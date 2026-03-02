'use client'

import { formatBRL, formatDate } from '@/lib/utils'
import { useUIStore } from '@/store/ui.store'
import { cn } from '@/lib/utils'
import { CalendarClock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface UpcomingItem {
    id: string
    description: string | null
    amount: number
    date: string
    categories: { name: string; icon: string; color: string } | null
}

export default function UpcomingFixed({ items, loading }: { items: UpcomingItem[], loading?: boolean }) {
    const { privacyMode } = useUIStore()

    if (loading) {
        return (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-3 animate-pulse">
                <div className="h-4 bg-slate-800 rounded w-40 mb-4" />
                {[1, 2, 3].map(i => <div key={i} className="h-14 bg-slate-800 rounded-xl" />)}
            </div>
        )
    }

    return (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
            <div className="flex items-center gap-2 mb-4">
                <CalendarClock className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-300">Próximos Vencimentos</h3>
                <Badge variant="secondary" className="ml-auto text-xs bg-slate-800 text-slate-400">{items.length} este mês</Badge>
            </div>

            {items.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">Nenhum vencimento nos próximos 7 dias 🎉</p>
            ) : (
                <div className="space-y-2">
                    {items.map(item => {
                        const daysUntil = Math.ceil((new Date(item.date).getTime() - Date.now()) / 86400000)
                        return (
                            <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                                <div
                                    className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0"
                                    style={{ background: `${item.categories?.color ?? '#6366f1'}20` }}
                                >
                                    {item.categories?.icon ?? '📌'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-200 truncate">{item.description ?? 'Sem descrição'}</p>
                                    <p className="text-xs text-slate-500">{formatDate(item.date)}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className={cn('text-sm font-semibold text-rose-400 transition-all', privacyMode && 'blur-md')}>
                                        {formatBRL(item.amount)}
                                    </p>
                                    <p className={cn('text-xs', daysUntil <= 1 ? 'text-rose-400' : daysUntil <= 3 ? 'text-amber-400' : 'text-slate-500')}>
                                        {daysUntil === 0 ? 'Hoje!' : daysUntil === 1 ? 'Amanhã' : `em ${daysUntil}d`}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
