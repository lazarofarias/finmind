'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createTransaction } from '@/features/transactions/actions'
import { formatBRL, formatDate } from '@/lib/utils'
import { ExtractedTransaction, PdfUpload, Category } from '@/types/database.types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle2, AlertCircle, Loader2, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ReviewRow extends ExtractedTransaction {
    confirmed: boolean
    category_id: string
    account_id: string
}

export default function ReviewClient({ uploadId }: { uploadId: string }) {
    const [upload, setUpload] = useState<PdfUpload | null>(null)
    const [rows, setRows] = useState<ReviewRow[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([])
    const [defaultAccount, setDefaultAccount] = useState('')
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const supabase = createClient()

        async function load() {
            const [uploadRes, catsRes, accsRes] = await Promise.all([
                supabase.from('pdf_uploads').select('*').eq('id', uploadId).single(),
                supabase.from('categories').select('*'),
                supabase.from('accounts').select('id, name').eq('is_active', true),
            ])

            if (uploadRes.error || !uploadRes.data) {
                toast.error('Upload não encontrado.')
                return
            }

            const extracted = (uploadRes.data.extracted_transactions as ExtractedTransaction[]) ?? []
            const allAccs = accsRes.data ?? []

            // Check for duplicates against existing transactions
            const supabase2 = createClient()
            const { data: existing } = await supabase2.from('transactions').select('date, amount, description')

            const existingSet = new Set(
                (existing ?? []).map(t => `${t.date}|${t.amount}|${t.description}`)
            )

            const firstAcc = allAccs[0]?.id ?? ''
            // Use "negatives as receita, positives as despesa" logic
            const initialRows: ReviewRow[] = extracted.map(t => {
                const isDuplicate = existingSet.has(`${t.date}|${Math.abs(t.amount)}|${t.description}`)
                const matchedCat = (catsRes.data ?? []).find(c =>
                    c.name.toLowerCase() === t.category_suggestion.toLowerCase()
                )
                return {
                    ...t,
                    amount: Math.abs(t.amount),
                    isDuplicate,
                    confirmed: !isDuplicate,
                    category_id: matchedCat?.id ?? '',
                    account_id: firstAcc,
                }
            })

            setUpload(uploadRes.data as PdfUpload)
            setCategories(catsRes.data ?? [])
            setAccounts(allAccs)
            setDefaultAccount(firstAcc)
            setRows(initialRows)
            setLoading(false)
        }

        load()
    }, [uploadId])

    const toggleRow = (idx: number) => {
        setRows(r => r.map((row, i) => i === idx ? { ...row, confirmed: !row.confirmed } : row))
    }

    const updateRow = (idx: number, field: keyof ReviewRow, value: string) => {
        setRows(r => r.map((row, i) => i === idx ? { ...row, [field]: value } : row))
    }

    const toggleAll = () => {
        const allChecked = rows.every(r => r.confirmed)
        setRows(r => r.map(row => ({ ...row, confirmed: !allChecked })))
    }

    const handleConfirm = useCallback(async () => {
        const toImport = rows.filter(r => r.confirmed && !r.isDuplicate)
        if (toImport.length === 0) { toast.error('Nenhuma transação selecionada.'); return }

        setSaving(true)
        let errorCount = 0

        for (const row of toImport) {
            const result = await createTransaction({
                amount: row.amount,
                description: row.description,
                type: row.amount < 0 ? 'receita' : 'variavel',
                date: row.date,
                category_id: row.category_id || null,
                account_id: row.account_id || defaultAccount,
                status: 'confirmed',
                is_recurring: false,
            })
            if (result?.error) errorCount++
        }

        // Mark upload as done
        const supabase = createClient()
        await supabase.from('pdf_uploads').update({ status: 'done' }).eq('id', uploadId)

        setSaving(false)
        if (errorCount > 0) {
            toast.error(`${errorCount} transação(ões) falharam ao salvar.`)
        } else {
            toast.success(`${toImport.length} transações importadas com sucesso!`)
            router.push('/transactions')
        }
    }, [rows, uploadId, defaultAccount, router])

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl bg-slate-800" />)}
            </div>
        )
    }

    const confirmed = rows.filter(r => r.confirmed && !r.isDuplicate)
    const duplicates = rows.filter(r => r.isDuplicate)

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
                <Link href="/transactions/import" className="mt-1">
                    <ChevronLeft className="w-5 h-5 text-slate-400 hover:text-slate-200" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-50">Revisão da Importação</h1>
                    <p className="text-sm text-slate-400 mt-0.5">
                        {upload?.original_name} {upload?.bank_detected && `· ${upload.bank_detected}`}
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{confirmed.length} a importar</Badge>
                    {duplicates.length > 0 && (
                        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">{duplicates.length} duplicatas</Badge>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-800/70 text-slate-400 text-xs uppercase tracking-wider">
                                <th className="p-3 text-left w-10">
                                    <input
                                        type="checkbox"
                                        checked={rows.every(r => r.confirmed)}
                                        onChange={toggleAll}
                                        className="rounded border-slate-600 accent-emerald-500"
                                    />
                                </th>
                                <th className="p-3 text-left">Data</th>
                                <th className="p-3 text-left">Descrição</th>
                                <th className="p-3 text-right">Valor</th>
                                <th className="p-3 text-left">Categoria</th>
                                <th className="p-3 text-left">Conta</th>
                                <th className="p-3 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {rows.map((row, idx) => (
                                <tr
                                    key={idx}
                                    className={`transition-colors ${row.isDuplicate ? 'opacity-50 bg-amber-500/3' :
                                            row.confirmed ? 'hover:bg-slate-800/30' : 'opacity-40'
                                        }`}
                                >
                                    <td className="p-3">
                                        <input
                                            type="checkbox"
                                            checked={row.confirmed}
                                            onChange={() => toggleRow(idx)}
                                            disabled={row.isDuplicate}
                                            className="rounded border-slate-600 accent-emerald-500"
                                        />
                                    </td>
                                    <td className="p-3 text-slate-300 whitespace-nowrap">{formatDate(row.date)}</td>
                                    <td className="p-3 text-slate-200 max-w-[200px]">
                                        <p className="truncate">{row.description}</p>
                                    </td>
                                    <td className={`p-3 text-right font-semibold whitespace-nowrap ${row.amount < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {formatBRL(Math.abs(row.amount))}
                                    </td>
                                    <td className="p-3">
                                        <select
                                            value={row.category_id}
                                            onChange={e => updateRow(idx, 'category_id', e.target.value)}
                                            className="w-36 h-8 px-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                                        >
                                            <option value="">Sem categoria</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-3">
                                        <select
                                            value={row.account_id}
                                            onChange={e => updateRow(idx, 'account_id', e.target.value)}
                                            className="w-32 h-8 px-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                                        >
                                            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-3">
                                        {row.isDuplicate ? (
                                            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">
                                                <AlertCircle className="w-3 h-3 mr-1" /> Já importado
                                            </Badge>
                                        ) : row.confirmed ? (
                                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                                                <CheckCircle2 className="w-3 h-3 mr-1" /> Confirmar
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-slate-700 text-slate-500 text-[10px]">Ignorar</Badge>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">
                    {confirmed.length} de {rows.length} transações selecionadas
                </p>
                <Button
                    onClick={handleConfirm}
                    disabled={saving || confirmed.length === 0}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Confirmar importação
                </Button>
            </div>
        </div>
    )
}
