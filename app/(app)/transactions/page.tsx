import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeftRight, Plus, FileText } from 'lucide-react'
import Link from 'next/link'
import StatusBadge from '@/features/transactions/components/StatusBadge'
import TransactionRowActions from '@/features/transactions/components/TransactionRowActions'

export const metadata: Metadata = { title: 'Transações – FinMind' }

export default async function TransactionsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: transactions } = await (supabase as any)
        .from('transactions')
        .select('*, categories(name, icon, color)')
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .limit(50)

    const typeLabel: Record<string, string> = {
        fixo: 'Fixo', variavel: 'Variável', receita: 'Receita',
    }
    const typeColor: Record<string, string> = {
        fixo: 'text-amber-400', variavel: 'text-rose-400', receita: 'text-emerald-400',
    }

    return (
        <div className="max-w-5xl mx-auto space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-50 flex items-center gap-2">
                        <ArrowLeftRight className="w-5 h-5 text-slate-400" />
                        Transações
                    </h1>
                    <p className="text-sm text-slate-400 mt-0.5">Gestão completa de lançamentos e histórico</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link href="/transactions/import"
                        className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 transition-colors font-medium">
                        <FileText className="w-4 h-4" /> Importar Fatura
                    </Link>
                    <Link href="/transactions/new"
                        className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-colors font-medium">
                        <Plus className="w-4 h-4" /> Novo Lançamento
                    </Link>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/50">
                {!transactions || transactions.length === 0 ? (
                    <div className="p-12 text-center">
                        <ArrowLeftRight className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-200 font-medium">Nenhuma transação ainda</p>
                        <p className="text-sm text-slate-500 mt-1">Adicione lançamentos pelo botão + ou importe uma fatura PDF.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wider">
                                    <th className="p-4 text-left font-semibold">Data</th>
                                    <th className="p-4 text-left font-semibold">Descrição</th>
                                    <th className="p-4 text-left font-semibold hidden sm:table-cell">Categoria</th>
                                    <th className="p-4 text-left font-semibold">Tipo</th>
                                    <th className="p-4 text-left font-semibold">Status</th>
                                    <th className="p-4 text-right font-semibold">Valor</th>
                                    <th className="p-4 text-right font-semibold w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {transactions.map((t: any) => (
                                    <tr key={t.id} className="hover:bg-slate-800/40 transition-colors group">
                                        <td className="p-4 text-slate-400 text-xs whitespace-nowrap">
                                            {new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                        </td>
                                        <td className="p-4 text-slate-200">
                                            <p className="truncate max-w-[150px] sm:max-w-[250px] font-medium">{t.description ?? '—'}</p>
                                        </td>
                                        <td className="p-4 text-slate-400 text-xs hidden sm:table-cell">
                                            {t.categories?.name ? (
                                                <span className="bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
                                                    {t.categories.name}
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td className={`p-4 text-xs font-semibold ${typeColor[t.type] ?? 'text-slate-400'}`}>
                                            {typeLabel[t.type] ?? t.type}
                                        </td>
                                        <td className="p-4">
                                            <StatusBadge id={t.id} status={t.status || 'pending'} />
                                        </td>
                                        <td className={`p-4 text-right font-bold tracking-tight whitespace-nowrap ${t.type === 'receita' ? 'text-emerald-400' : 'text-slate-100'}`}>
                                            {t.type === 'receita' ? '+' : '-'} {Number(t.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                        <td className="p-4 text-right">
                                            <TransactionRowActions id={t.id} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

