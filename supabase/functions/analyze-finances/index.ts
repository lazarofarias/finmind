// supabase/functions/analyze-finances/index.ts
// Deno Edge Function – Financial Analysis: Anomaly Detection + Score + Profile + Cash Flow Prediction
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.21.4/mod.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ─── Output schema ────────────────────────────────────────────
const InsightSchema = z.object({
    type: z.enum(['anomaly', 'tip', 'alert', 'report']),
    title: z.string(),
    content: z.string(),
    severity: z.enum(['critical', 'warning', 'opportunity']),
    metadata: z.record(z.unknown()).optional(),
})

const AnalysisOutputSchema = z.object({
    financial_score: z.number().int().min(0).max(100),
    user_archetype: z.string(),
    archetype_description: z.string(),
    insights: z.array(InsightSchema).min(1).max(10),
    burn_rate_daily: z.number(),
    projected_month_end_balance: z.number(),
    projected_30d_balance: z.number(),
    savings_rate_percent: z.number(),
})

type AnalysisOutput = z.infer<typeof AnalysisOutputSchema>

// ─── Helpers ─────────────────────────────────────────────────
function anonymize(description: string): string {
    // Replace specific merchant names with category-level descriptions
    const patterns: [RegExp, string][] = [
        [/ifood|rappi|uber eats|james/gi, '[App de Delivery]'],
        [/uber|99pop|cabify/gi, '[Transporte por App]'],
        [/netflix|spotify|amazon prime|disney|hbo|globoplay/gi, '[Streaming]'],
        [/nubank|itaú|bradesco|santander|inter|c6/gi, '[Banco]'],
        [/pix\s*/gi, '[PIX]'],
    ]
    let cleaned = description
    for (const [pattern, replacement] of patterns) {
        cleaned = cleaned.replace(pattern, replacement)
    }
    return cleaned
}

function buildSystemPrompt(): string {
    return `Você é um consultor financeiro especialista em finanças pessoais brasileiras.
Sua tarefa é analisar dados financeiros reais e gerar insights ACIONÁVEIS e específicos.

REGRAS CRÍTICAS:
1. Ignore transferências entre contas do mesmo usuário (não são gastos reais).
2. Ignore pagamentos de fatura de cartão se já existem os lançamentos individuais.
3. Seja ESPECÍFICO: mencione valores, percentuais e datas quando disponíveis.
4. O score deve refletir: 40% taxa de poupança + 30% cumprimento de orçamentos + 30% consistência.
5. Arquétipos sugeridos: "O Poupador Estratégico", "O Gastronômico", "O Sobrevivente", "O Impulsivo", "O Equilibrado", "O Investidor".
6. Para anomalias: compare com a média dos 3 meses anteriores (se disponível).
7. Retorne APENAS o JSON, sem markdown, sem texto extra.

SAÍDA OBRIGATÓRIA (JSON válido):
{
  "financial_score": <0-100>,
  "user_archetype": "<nome do arquétipo>",
  "archetype_description": "<1 frase descritiva>",
  "insights": [
    {
      "type": "anomaly|tip|alert|report",
      "title": "<título curto>",
      "content": "<descrição acionável com valores específicos>",
      "severity": "critical|warning|opportunity",
      "metadata": { "category": "...", "amount": ..., "change_percent": ... }
    }
  ],
  "burn_rate_daily": <média de gastos diários>,
  "projected_month_end_balance": <saldo projetado fim do mês>,
  "projected_30d_balance": <saldo projetado em 30 dias>,
  "savings_rate_percent": <percentual poupado da receita>
}`
}

function formatDataForLLM(params: {
    transactions: Record<string, unknown>[]
    accounts: Record<string, unknown>[]
    budgets: Record<string, unknown>[]
    totalBalance: number
    today: string
    monthStart: string
}): string {
    const { transactions, accounts, budgets, totalBalance, today, monthStart } = params

    // Group transactions by category for context
    const byCategory: Record<string, { total: number; count: number; items: string[] }> = {}
    for (const t of transactions) {
        if (t.type === 'receita') continue
        const cat = (t as any).categories?.name ?? 'Sem categoria'
        if (!byCategory[cat]) byCategory[cat] = { total: 0, count: 0, items: [] }
        byCategory[cat].total += Number(t.amount)
        byCategory[cat].count++
        byCategory[cat].items.push(anonymize(String(t.description ?? '')))
    }

    const income = transactions
        .filter(t => t.type === 'receita')
        .reduce((s, t) => s + Number(t.amount), 0)

    const totalExpenses = transactions
        .filter(t => t.type !== 'receita')
        .reduce((s, t) => s + Number(t.amount), 0)

    const budgetSummary = budgets.map(b => ({
        category: (b as any).categories?.name ?? 'Desconhecida',
        limit: b.limit_amount,
        spent: byCategory[(b as any).categories?.name]?.total ?? 0,
    }))

    return `=== DADOS FINANCEIROS PARA ANÁLISE ===
Data de hoje: ${today}
Início do período: ${monthStart}

SALDO TOTAL CONSOLIDADO: R$ ${totalBalance.toFixed(2)}
RECEITA NO PERÍODO: R$ ${income.toFixed(2)}
TOTAL GASTO NO PERÍODO: R$ ${totalExpenses.toFixed(2)}
TAXA DE POUPANÇA BRUTA: ${income > 0 ? (((income - totalExpenses) / income) * 100).toFixed(1) : 0}%

CONTAS:
${accounts.map((a: any) => `- ${a.name} (${a.type}): R$ ${Number(a.balance).toFixed(2)}`).join('\n')}

GASTOS POR CATEGORIA (últimos 60 dias):
${Object.entries(byCategory).map(([cat, data]) =>
        `- ${cat}: R$ ${data.total.toFixed(2)} (${data.count} lançamentos)`
    ).join('\n')}

ORÇAMENTOS vs GASTOS REAIS:
${budgetSummary.map(b =>
        `- ${b.category}: Limite R$ ${b.limit}, Gasto R$ ${(b.spent as number).toFixed(2)} (${b.limit > 0 ? (((b.spent as number) / Number(b.limit)) * 100).toFixed(0) : 0}%)`
    ).join('\n')}

TRANSAÇÕES RECENTES (últimos 30 dias, anonimizadas):
${transactions
            .filter(t => t.date >= new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0])
            .slice(0, 30)
            .map((t: any) => `[${t.date}] ${t.type.toUpperCase()} R$ ${t.amount} - ${anonymize(t.description ?? '')} (${t.categories?.name ?? 'Sem cat.'})`)
            .join('\n')}`
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const openAiKey = Deno.env.get('OPENAI_API_KEY')!

    const supabase = createClient(supabaseUrl, serviceKey)

    try {
        // Parse body (userId may be passed by cron or specific user trigger)
        const body = await req.json().catch(() => ({}))
        const userId: string | null = body.userId ?? null

        // Get list of users to analyze (if no specific user, analyze all)
        let userIds: string[] = []
        if (userId) {
            userIds = [userId]
        } else {
            const { data: profiles } = await supabase.from('profiles').select('id')
            userIds = (profiles ?? []).map((p: any) => p.id)
        }

        const results = []

        for (const uid of userIds) {
            const today = new Date().toISOString().split('T')[0]
            const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000).toISOString().split('T')[0]
            const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

            // ─── Aggregate data ───────────────────────────────────
            const [txRes, accRes, budgetRes] = await Promise.all([
                supabase.from('transactions')
                    .select('*, categories(name, icon)')
                    .eq('user_id', uid)
                    .gte('date', sixtyDaysAgo)
                    .order('date', { ascending: false }),
                supabase.from('accounts')
                    .select('*')
                    .eq('user_id', uid)
                    .eq('is_active', true),
                supabase.from('budgets')
                    .select('*, categories(name)')
                    .eq('user_id', uid),
            ])

            const transactions = txRes.data ?? []
            const accounts = accRes.data ?? []
            const budgets = budgetRes.data ?? []
            const totalBalance = accounts.reduce((s: number, a: any) => s + Number(a.balance), 0)

            if (transactions.length === 0) {
                results.push({ userId: uid, skipped: true, reason: 'no_transactions' })
                continue
            }

            // ─── Build LLM context ────────────────────────────────
            const dataContext = formatDataForLLM({ transactions: transactions as any, accounts: accounts as any, budgets: budgets as any, totalBalance, today, monthStart })

            // ─── Call OpenAI ──────────────────────────────────────
            const llmRes = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openAiKey}` },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    temperature: 0.3,
                    max_tokens: 2000,
                    messages: [
                        { role: 'system', content: buildSystemPrompt() },
                        { role: 'user', content: dataContext },
                    ],
                }),
            })

            if (!llmRes.ok) {
                throw new Error(`OpenAI error ${llmRes.status}: ${await llmRes.text()}`)
            }

            const llmData = await llmRes.json()
            const rawContent = llmData.choices?.[0]?.message?.content?.trim()
            if (!rawContent) throw new Error('Empty LLM response')

            // ─── Parse + validate ─────────────────────────────────
            let analysis: AnalysisOutput
            try {
                const jsonMatch = rawContent.match(/\{[\s\S]*\}/)
                if (!jsonMatch) throw new Error('No JSON found in response')
                analysis = AnalysisOutputSchema.parse(JSON.parse(jsonMatch[0]))
            } catch (e) {
                throw new Error(`Invalid LLM output: ${(e as Error).message}\nRaw: ${rawContent.slice(0, 200)}`)
            }

            // ─── Persist insights ─────────────────────────────────
            const now = new Date().toISOString()
            const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString() // 7 days

            // Delete old unread insights older than 30 days first
            await supabase.from('ai_insights')
                .delete()
                .eq('user_id', uid)
                .eq('read_status', false)
                .lt('created_at', new Date(Date.now() - 30 * 86400000).toISOString())

            // Insert new insights
            const insightRows = analysis.insights.map(insight => ({
                user_id: uid,
                type: insight.type,
                title: insight.title,
                content: insight.content,
                read_status: false,
                metadata: {
                    ...insight.metadata,
                    severity: insight.severity,
                    archetype: analysis.user_archetype,
                    burn_rate_daily: analysis.burn_rate_daily,
                    projected_month_end_balance: analysis.projected_month_end_balance,
                    projected_30d_balance: analysis.projected_30d_balance,
                    savings_rate_percent: analysis.savings_rate_percent,
                    generated_at: now,
                },
                expires_at: expiresAt,
            }))

            // Insert cash flow report as a special insight
            insightRows.push({
                user_id: uid,
                type: 'report',
                title: `Previsão de Caixa – ${new Date().toLocaleDateString('pt-BR', { month: 'long' })}`,
                content: `Burn Rate: R$ ${analysis.burn_rate_daily.toFixed(2)}/dia · Saldo fim do mês: R$ ${analysis.projected_month_end_balance.toFixed(2)} · Próximos 30 dias: R$ ${analysis.projected_30d_balance.toFixed(2)}`,
                read_status: false,
                metadata: {
                    severity: analysis.projected_month_end_balance < 0 ? 'critical' : analysis.projected_month_end_balance < totalBalance * 0.1 ? 'warning' : 'opportunity',
                    burn_rate_daily: analysis.burn_rate_daily,
                    projected_month_end_balance: analysis.projected_month_end_balance,
                    projected_30d_balance: analysis.projected_30d_balance,
                    savings_rate_percent: analysis.savings_rate_percent,
                    is_cash_flow_report: true,
                    generated_at: now,
                },
                expires_at: expiresAt,
            })

            await supabase.from('ai_insights').insert(insightRows)

            // ─── Update financial score on profile ────────────────
            await supabase.from('profiles').update({
                financial_score: analysis.financial_score,
                investor_profile: analysis.financial_score >= 70 ? 'arrojado' : analysis.financial_score >= 40 ? 'moderado' : 'conservador',
            }).eq('id', uid)

            // ─── Send email alert if critical insights found ───────
            const criticalInsights = analysis.insights.filter(i => i.severity === 'critical')
            if (criticalInsights.length > 0) {
                const resendKey = Deno.env.get('RESEND_API_KEY')
                if (resendKey) {
                    // Get user email
                    const { data: { user: authUser } } = await supabase.auth.admin.getUserById(uid)
                    if (authUser?.email) {
                        await fetch('https://api.resend.com/emails', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
                            body: JSON.stringify({
                                from: 'FinMind <noreply@yourdomain.com>',
                                to: authUser.email,
                                subject: `⚠️ FinMind: ${criticalInsights.length} alerta(s) crítico(s) detectado(s)`,
                                html: `
                  <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
                    <div style="background:#020617;padding:24px;border-radius:12px 12px 0 0">
                      <h2 style="color:#10b981;margin:0">FinMind</h2>
                    </div>
                    <div style="background:#0f172a;padding:24px;border-radius:0 0 12px 12px">
                      <h3 style="color:#f1f5f9">Alertas Críticos Detectados</h3>
                      ${criticalInsights.map(i => `
                        <div style="background:#1e293b;border-left:4px solid #f43f5e;padding:16px;border-radius:8px;margin-bottom:12px">
                          <p style="color:#f43f5e;font-weight:bold;margin:0 0 4px">${i.title}</p>
                          <p style="color:#94a3b8;margin:0;font-size:14px">${i.content}</p>
                        </div>
                      `).join('')}
                      <p style="color:#64748b;font-size:12px;margin-top:24px">
                        Score Financeiro atual: <strong style="color:#10b981">${analysis.financial_score}/100</strong><br>
                        Arquétipo: ${analysis.user_archetype}
                      </p>
                      <a href="${Deno.env.get('NEXT_PUBLIC_APP_URL') ?? 'http://localhost:3000'}/ai-mentor"
                         style="display:inline-block;background:#10b981;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;margin-top:16px;font-size:14px">
                        Ver Análise Completa →
                      </a>
                    </div>
                  </div>`,
                            }),
                        }).catch(() => {/* Silently fail email – non-critical */ })
                    }
                }
            }

            results.push({
                userId: uid,
                score: analysis.financial_score,
                archetype: analysis.user_archetype,
                insightsCreated: insightRows.length,
                criticalAlerts: criticalInsights.length,
                burnRateDaily: analysis.burn_rate_daily,
                projectedMonthEnd: analysis.projected_month_end_balance,
            })
        }

        return new Response(JSON.stringify({ success: true, analyzed: results.length, results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (err) {
        const message = (err as Error).message
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
