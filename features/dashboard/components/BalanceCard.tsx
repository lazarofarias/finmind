'use client'

import { formatBRL } from '@/lib/utils'
import { useUIStore } from '@/store/ui.store'
import { MonthTotals } from '@/features/dashboard/utils/calculateTotals'
import { Wallet, TrendingDown, TrendingUp, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BalanceCardProps {
    totals: MonthTotals
    totalBalance: number
    loading?: boolean
}

function StatItem({
    label, value, icon: Icon, color
}: { label: string; value: number; icon: React.ElementType; color: string }) {
    const { privacyMode } = useUIStore()
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Icon className={cn('w-3.5 h-3.5', color)} />
                {label}
            </div>
            <p className={cn(
                'text-base font-semibold text-slate-100 transition-all duration-300',
                privacyMode && 'blur-md select-none'
            )}>
                {formatBRL(value)}
            </p>
        </div>
    )
}

export default function BalanceCard({ totals, totalBalance, loading }: BalanceCardProps) {
    const { privacyMode } = useUIStore()

    if (loading) {
        return (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 animate-pulse">
                <div className="h-4 bg-slate-800 rounded w-32" />
                <div className="h-10 bg-slate-800 rounded w-48" />
                <div className="grid grid-cols-3 gap-4 pt-2">
                    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-800 rounded" />)}
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/80 border border-slate-800 p-6 space-y-5">
            {/* Total balance */}
            <div>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                    <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                    Saldo consolidado
                </p>
                <p className={cn(
                    'text-4xl font-bold text-slate-50 transition-all duration-300',
                    privacyMode && 'blur-xl select-none',
                    totalBalance < 0 ? 'text-rose-400' : 'text-slate-50'
                )}>
                    {formatBRL(totalBalance)}
                </p>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-800">
                <StatItem label="Receita" value={totals.income} icon={TrendingUp} color="text-emerald-400" />
                <StatItem label="Gastos Fixos" value={totals.fixed} icon={DollarSign} color="text-amber-400" />
                <StatItem label="Variáveis" value={totals.variable} icon={TrendingDown} color="text-rose-400" />
                <StatItem label="Disponível" value={totals.available} icon={Wallet} color="text-sky-400" />
            </div>
        </div>
    )
}
