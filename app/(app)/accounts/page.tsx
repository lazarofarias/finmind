import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Wallet, PiggyBank, TrendingUp, CreditCard } from 'lucide-react'

export const metadata: Metadata = { title: 'Contas – FinMind' }

const typeIcon: Record<string, any> = {
    corrente: Wallet, poupanca: PiggyBank, investimento: TrendingUp, cartao: CreditCard,
}
const typeLabel: Record<string, string> = {
    corrente: 'Conta Corrente', poupanca: 'Poupança', investimento: 'Investimento', cartao: 'Cartão de Crédito',
}

export default async function AccountsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: accounts } = await (supabase as any)
        .from('accounts')
        .select('*')
        .eq('user_id', user?.id)
        .order('name')

    const total = (accounts ?? []).reduce((s: number, a: any) => s + Number(a.balance), 0)

    return (
        <div className="max-w-3xl mx-auto space-y-5">
            <div>
                <h1 className="text-xl font-bold text-slate-50 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-slate-400" />
                    Contas
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">Visão consolidada de todas as suas contas</p>
            </div>

            {/* Total */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 p-5">
                <p className="text-xs text-slate-400 mb-1">Patrimônio Total</p>
                <p className="text-3xl font-bold text-emerald-400">
                    R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-slate-500 mt-1">{(accounts ?? []).length} conta(s) ativa(s)</p>
            </div>

            {/* List */}
            <div className="grid gap-3">
                {(accounts ?? []).length === 0 ? (
                    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-10 text-center">
                        <Wallet className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-400">Nenhuma conta cadastrada</p>
                        <p className="text-sm text-slate-600 mt-1">Adicione suas contas pelo SQL do Supabase ou pelo painel futuro.</p>
                    </div>
                ) : (
                    (accounts ?? []).map((account: any) => {
                        const Icon = typeIcon[account.type] ?? Wallet
                        return (
                            <div key={account.id} className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                                    <Icon className="w-5 h-5 text-slate-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-100">{account.name}</p>
                                    <p className="text-xs text-slate-500">{typeLabel[account.type] ?? account.type}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold ${Number(account.balance) >= 0 ? 'text-slate-100' : 'text-rose-400'}`}>
                                        R$ {Number(account.balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                    {account.bank_name && (
                                        <p className="text-xs text-slate-500">{account.bank_name}</p>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
