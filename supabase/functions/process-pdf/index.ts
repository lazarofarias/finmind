// supabase/functions/process-pdf/index.ts
// Deno Edge Function – PDF text extraction + OpenAI parsing
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.21.4/mod.ts'

// ─── Zod schema for AI output validation ────────────────────
const ExtractedTransactionSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
    description: z.string().min(1),
    amount: z.number(),
    category_suggestion: z.string(),
})
const ExtractedArraySchema = z.array(ExtractedTransactionSchema)

// ─── CORS headers ────────────────────────────────────────────
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ─── Detect bank from text ───────────────────────────────────
function detectBank(text: string): string {
    const lower = text.toLowerCase()
    if (lower.includes('nubank')) return 'Nubank'
    if (lower.includes('itaú') || lower.includes('itau')) return 'Itaú'
    if (lower.includes('bradesco')) return 'Bradesco'
    if (lower.includes('inter')) return 'Inter'
    if (lower.includes('c6 bank') || lower.includes('c6bank')) return 'C6 Bank'
    if (lower.includes('xp investimentos') || lower.includes('xp cartão')) return 'XP'
    if (lower.includes('btg')) return 'BTG Pactual'
    if (lower.includes('santander')) return 'Santander'
    if (lower.includes('caixa')) return 'Caixa'
    return 'Desconhecido'
}

// ─── System prompt for OpenAI ────────────────────────────────
function buildSystemPrompt(bank: string): string {
    return `Você é um especialista em análise de faturas de cartão de crédito brasileiro.
Banco detectado: ${bank}.

INSTRUÇÕES ESTRITAS:
1. Extraia APENAS as transações de compra/pagamento desta fatura.
2. IGNORE: cabeçalhos, rodapés, saldo anterior, pagamento mínimo, total da fatura, IOF, encargos, limites.
3. Datas: converta para formato YYYY-MM-DD.
4. Valores: positivos = despesas, negativos = estornos/créditos (retorne negativos com sinal negativo).
5. category_suggestion: classifique em uma destas categorias: Alimentação, Transporte, Saúde, Educação, Lazer, Vestuário, Tecnologia, Assinaturas, Moradia, Outros.
6. RETORNE APENAS o array JSON, sem texto adicional, sem markdown.

Formato de saída (array JSON válido):
[{"date":"YYYY-MM-DD","description":"nome do estabelecimento","amount":99.90,"category_suggestion":"Alimentação"}]`
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    let uploadId: string | undefined
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const openAiKey = Deno.env.get('OPENAI_API_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    try {
        const { uploadId: uid, filePath, userId } = await req.json()
        uploadId = uid

        if (!uploadId || !filePath || !userId) {
            throw new Error('Parâmetros inválidos: uploadId, filePath e userId são obrigatórios.')
        }

        // Mark as processing
        await supabase.from('pdf_uploads').update({ status: 'processing' }).eq('id', uploadId)

        // 1. Download PDF from Storage
        const { data: fileData, error: downloadError } = await supabase.storage
            .from('statements')
            .download(filePath)

        if (downloadError || !fileData) {
            throw new Error(`Erro ao baixar arquivo: ${downloadError?.message ?? 'dados nulos'}`)
        }

        // 2. Extract text via pdf-parse (via CDN import)
        const pdfParse = (await import('https://esm.sh/pdf-parse@1.1.1')).default
        const buffer = await fileData.arrayBuffer()
        let rawText = ''

        try {
            const parsed = await pdfParse(Buffer.from(buffer))
            rawText = parsed.text
        } catch (parseErr) {
            throw new Error(`PDF inválido ou protegido por senha. Detalhe: ${(parseErr as Error).message}`)
        }

        if (!rawText || rawText.trim().length < 50) {
            throw new Error('PDF não contém texto legível. O arquivo pode ser um scan de imagem. Por favor, use um PDF nativo do banco.')
        }

        // 3. Detect bank
        const bank = detectBank(rawText)

        // 4. Call OpenAI GPT-4o-mini
        const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${openAiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                temperature: 0,
                max_tokens: 4000,
                messages: [
                    { role: 'system', content: buildSystemPrompt(bank) },
                    {
                        role: 'user',
                        content: `Extraia as transações deste extrato:\n\n${rawText.slice(0, 12000)}`,
                    },
                ],
            }),
        })

        if (!openAiRes.ok) {
            const errBody = await openAiRes.text()
            throw new Error(`Erro da API OpenAI (${openAiRes.status}): ${errBody}`)
        }

        const openAiData = await openAiRes.json()
        const rawJson = openAiData.choices?.[0]?.message?.content?.trim()

        if (!rawJson) throw new Error('OpenAI não retornou conteúdo.')

        // 5. Parse + validate with Zod
        let parsed: z.infer<typeof ExtractedArraySchema>
        try {
            const jsonMatch = rawJson.match(/\[[\s\S]*\]/)
            if (!jsonMatch) throw new Error('Nenhum array JSON encontrado na resposta da IA.')
            parsed = ExtractedArraySchema.parse(JSON.parse(jsonMatch[0]))
        } catch (zodErr) {
            throw new Error(`Resposta da IA inválida: ${(zodErr as Error).message}`)
        }

        // 6. Save results
        await supabase.from('pdf_uploads').update({
            status: 'done',
            extracted_transactions: parsed,
            bank_detected: bank,
        }).eq('id', uploadId)

        return new Response(
            JSON.stringify({ success: true, count: parsed.length, bank }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (err) {
        const message = (err as Error).message
        if (uploadId) {
            const supabase2 = createClient(supabaseUrl, supabaseServiceKey)
            await supabase2.from('pdf_uploads').update({
                status: 'error',
                error_logs: message,
            }).eq('id', uploadId)
        }
        return new Response(
            JSON.stringify({ error: message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
