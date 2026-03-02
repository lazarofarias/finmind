import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeftRight, Plus, Filter } from 'lucide-react'
import Link from 'next/link'

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
        fixo: 'text-sky-400', variavel: 'text-amber-400', receita: 'text-emerald-400',
    }

    return (
        <div className="max-w-4xl mx-auto space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-50 flex items-center gap-2">
                        <ArrowLeftRight className="w-5 h-5 text-slate-400" />
                        Transações
                    </h1>
                    <p className="text-sm text-slate-400 mt-0.5">Histórico completo de lançamentos</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/transactions/import"
                        className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors">
                        <Plus className="w-4 h-4" /> Importar PDF
                    </Link>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-800 overflow-hidden">
                {!transactions || transactions.length === 0 ? (
                    <div className="p-12 text-center">
                        <ArrowLeftRight className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium">Nenhuma transação ainda</p>
                        <p className="text-sm text-slate-600 mt-1">Adicione lançamentos pelo botão + ou importe uma fatura PDF.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-800/70 text-slate-400 text-xs uppercase tracking-wider">
                                <th className="p-3 text-left">Data</th>
                                <th className="p-3 text-left">Descrição</th>
                                <th className="p-3 text-left">Categoria</th>
                                <th className="p-3 text-left">Tipo</th>
                                <th className="p-3 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {transactions.map((t: any) => (
                                <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="p-3 text-slate-500 text-xs whitespace-nowrap">
                                        {new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="p-3 text-slate-200 max-w-[200px]">
                                        <p className="truncate">{t.description ?? '—'}</p>
                                    </td>
                                    <td className="p-3 text-slate-400 text-xs">{t.categories?.name ?? '—'}</td>
                                    <td className={`p-3 text-xs font-medium ${typeColor[t.type] ?? 'text-slate-400'}`}>
                                        {typeLabel[t.type] ?? t.type}
                                    </td>
                                    <td className={`p-3 text-right font-semibold ${t.type === 'receita' ? 'text-emerald-400' : 'text-slate-200'}`}>
                                        {t.type === 'receita' ? '+' : '-'} R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
