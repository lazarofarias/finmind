'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { formatBRL } from '@/lib/utils'
import { submitInsightFeedback, markInsightRead } from '@/features/ai-mentor/actions'
import {
    AlertTriangle, TrendingUp, Lightbulb, BarChart3, ThumbsUp, ThumbsDown, X, Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import { useUIStore } from '@/store/ui.store'

interface Insight {
    id: string
    type: 'anomaly' | 'tip' | 'alert' | 'report'
    title: string
    content: string
    read_status: boolean
    feedback: number | null
    metadata: {
        severity?: 'critical' | 'warning' | 'opportunity'
        burn_rate_daily?: number
        projected_month_end_balance?: number
        savings_rate_percent?: number
        is_cash_flow_report?: boolean
        archetype?: string
    }
    created_at: string
}

interface InsightFeedProps {
    insights: Insight[]
}

const severityConfig = {
    critical: {
        border: 'border-rose-500/40',
        bg: 'bg-rose-500/5',
        badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        icon: AlertTriangle,
        iconColor: 'text-rose-400',
        label: 'Crítico',
    },
    warning: {
        border: 'border-amber-500/40',
        bg: 'bg-amber-500/5',
        badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        icon: AlertTriangle,
        iconColor: 'text-amber-400',
        label: 'Alerta',
    },
    opportunity: {
        border: 'border-emerald-500/40',
        bg: 'bg-emerald-500/5',
        badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        icon: TrendingUp,
        iconColor: 'text-emerald-400',
        label: 'Oportunidade',
    },
}

const typeConfig = {
    anomaly: { icon: AlertTriangle, color: 'text-rose-400' },
    alert: { icon: AlertTriangle, color: 'text-amber-400' },
    tip: { icon: Lightbulb, color: 'text-emerald-400' },
    report: { icon: BarChart3, color: 'text-sky-400' },
}

function InsightCard({ insight, onDismiss }: { insight: Insight; onDismiss: (id: string) => void }) {
    const [, startTransition] = useTransition()
    const [localFeedback, setLocalFeedback] = useState<number | null>(insight.feedback)
    const { privacyMode } = useUIStore()

    const severity = (insight.metadata?.severity ?? 'warning') as 'critical' | 'warning' | 'opportunity'
    const config = severityConfig[severity]
    const TypeIcon = typeConfig[insight.type]?.icon ?? Sparkles
    const typeColor = typeConfig[insight.type]?.color ?? 'text-slate-400'

    function handleFeedback(value: 1 | -1) {
        if (localFeedback) return
        setLocalFeedback(value)
        startTransition(async () => {
            await submitInsightFeedback(insight.id, value)
            toast.success(value === 1 ? 'Obrigado pelo feedback positivo!' : 'Anotado! Vamos melhorar.')
        })
    }

    function handleDismiss() {
        startTransition(async () => {
            await markInsightRead(insight.id)
            onDismiss(insight.id)
        })
    }

    return (
        <div className={cn(
            'rounded-xl border p-4 transition-all duration-200 group',
            config.border, config.bg
        )}>
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center shrink-0 mt-0.5">
                    <TypeIcon className={cn('w-4 h-4', typeColor)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border',
                            config.badge
                        )}>
                            {config.label}
                        </span>
                        {insight.metadata?.archetype && (
                            <span className="text-[10px] text-slate-500">{insight.metadata.archetype}</span>
                        )}
                    </div>

                    {/* Title + body */}
                    <p className="text-sm font-semibold text-slate-100 mb-0.5">{insight.title}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{insight.content}</p>

                    {/* Cash flow sub-stats (only on report type) */}
                    {insight.metadata?.is_cash_flow_report && insight.metadata.burn_rate_daily != null && (
                        <div className={cn(
                            'grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-800',
                            privacyMode && 'blur-md'
                        )}>
                            <Stat label="Burn Rate/dia" value={formatBRL(insight.metadata.burn_rate_daily!)} />
                            <Stat label="Fim do mês" value={formatBRL(insight.metadata.projected_month_end_balance ?? 0)} />
                            <Stat label="Taxa de poupança" value={`${insight.metadata.savings_rate_percent?.toFixed(1) ?? 0}%`} />
                        </div>
                    )}

                    {/* Feedback */}
                    <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-600 mr-1">Útil?</span>
                            <button
                                onClick={() => handleFeedback(1)}
                                disabled={localFeedback !== null}
                                className={cn(
                                    'w-6 h-6 rounded flex items-center justify-center transition-all',
                                    localFeedback === 1
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'text-slate-600 hover:text-emerald-400 hover:bg-emerald-500/10',
                                    localFeedback !== null && localFeedback !== 1 && 'opacity-30'
                                )}
                            >
                                <ThumbsUp className="w-3 h-3" />
                            </button>
                            <button
                                onClick={() => handleFeedback(-1)}
                                disabled={localFeedback !== null}
                                className={cn(
                                    'w-6 h-6 rounded flex items-center justify-center transition-all',
                                    localFeedback === -1
                                        ? 'bg-rose-500/20 text-rose-400'
                                        : 'text-slate-600 hover:text-rose-400 hover:bg-rose-500/10',
                                    localFeedback !== null && localFeedback !== -1 && 'opacity-30'
                                )}
                            >
                                <ThumbsDown className="w-3 h-3" />
                            </button>
                        </div>

                        <button
                            onClick={handleDismiss}
                            className="text-slate-700 hover:text-slate-400 text-[10px] flex items-center gap-1 transition-colors"
                        >
                            <X className="w-3 h-3" /> Dispensar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[10px] text-slate-500">{label}</p>
            <p className="text-xs font-semibold text-slate-200">{value}</p>
        </div>
    )
}

export default function InsightFeed({ insights }: InsightFeedProps) {
    const [visible, setVisible] = useState<Insight[]>(insights)

    const dismiss = (id: string) => setVisible(v => v.filter(i => i.id !== id))

    // Sort: critical first, then warning, then opportunity
    const sorted = [...visible].sort((a, b) => {
        const order = { critical: 0, warning: 1, opportunity: 2 }
        const sa = order[a.metadata?.severity ?? 'warning'] ?? 1
        const sb = order[b.metadata?.severity ?? 'warning'] ?? 1
        return sa - sb
    })

    if (sorted.length === 0) {
        return (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 text-center">
                <Sparkles className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                <p className="text-slate-300 font-medium">Tudo em ordem por aqui!</p>
                <p className="text-sm text-slate-500 mt-1">Nenhum insight pendente no momento.</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Insights da IA
                </h3>
                <span className="text-xs text-slate-500">{sorted.length} pendentes</span>
            </div>
            {sorted.map(insight => (
                <InsightCard key={insight.id} insight={insight} onDismiss={dismiss} />
            ))}
        </div>
    )
}
