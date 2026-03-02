'use client'

import { AiInsight } from '@/types/database.types'
import { Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface InsightCardProps {
    insight: AiInsight | null
    loading?: boolean
}

const typeConfig = {
    anomaly: { bg: 'from-rose-500/10 to-rose-500/5', border: 'border-rose-500/30', badge: 'Anomalia', badgeColor: 'bg-rose-500/20 text-rose-400' },
    tip: { bg: 'from-emerald-500/10 to-emerald-500/5', border: 'border-emerald-500/30', badge: 'Dica', badgeColor: 'bg-emerald-500/20 text-emerald-400' },
    alert: { bg: 'from-amber-500/10 to-amber-500/5', border: 'border-amber-500/30', badge: 'Alerta', badgeColor: 'bg-amber-500/20 text-amber-400' },
    report: { bg: 'from-sky-500/10 to-sky-500/5', border: 'border-sky-500/30', badge: 'Relatório', badgeColor: 'bg-sky-500/20 text-sky-400' },
}

export default function InsightCard({ insight, loading }: InsightCardProps) {
    const [dismissed, setDismissed] = useState(false)

    if (loading) {
        return <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 h-24 animate-pulse" />
    }

    if (!insight || dismissed) return null

    const config = typeConfig[insight.type] ?? typeConfig.tip

    return (
        <div className={cn(
            'rounded-2xl bg-gradient-to-r border p-4 lg:p-5',
            config.bg, config.border
        )}>
            <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800/80 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider', config.badgeColor)}>
                            {config.badge}
                        </span>
                        <span className="text-xs text-slate-500">Mentor IA</span>
                    </div>
                    <p className="text-sm font-medium text-slate-200 leading-relaxed">{insight.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{insight.content}</p>
                </div>
                <button onClick={() => setDismissed(true)} className="text-slate-600 hover:text-slate-400 shrink-0 mt-0.5 transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
