'use client'

import { cn } from '@/lib/utils'
import { Brain, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useUIStore } from '@/store/ui.store'

interface FinancialScoreCardProps {
    score: number | null
    archetype: string | null
    archetypeDescription: string | null
    savingsRate: number | null
    burnRateDaily: number | null
}

function ScoreRing({ score }: { score: number }) {
    const radius = 40
    const stroke = 6
    const normalizedRadius = radius - stroke / 2
    const circumference = 2 * Math.PI * normalizedRadius
    const strokeDashoffset = circumference - (score / 100) * circumference

    const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#f43f5e'
    const label = score >= 70 ? 'Excelente' : score >= 55 ? 'Bom' : score >= 40 ? 'Regular' : 'Crítico'

    return (
        <div className="relative flex items-center justify-center">
            <svg width={radius * 2} height={radius * 2} className="-rotate-90">
                <circle
                    cx={radius} cy={radius} r={normalizedRadius}
                    stroke="#1e293b" strokeWidth={stroke} fill="none"
                />
                <circle
                    cx={radius} cy={radius} r={normalizedRadius}
                    stroke={color} strokeWidth={stroke} fill="none"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                />
            </svg>
            <div className="absolute text-center">
                <p className="text-2xl font-bold" style={{ color }}>{score}</p>
                <p className="text-[9px] text-slate-500 -mt-0.5">{label}</p>
            </div>
        </div>
    )
}

export default function FinancialScoreCard({
    score, archetype, archetypeDescription, savingsRate, burnRateDaily
}: FinancialScoreCardProps) {
    const { privacyMode } = useUIStore()

    if (!score) {
        return (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center">
                    <Brain className="w-8 h-8 text-slate-600" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-300">Score ainda não calculado</p>
                    <p className="text-xs text-slate-500 mt-1">Execute a análise de IA para gerar seu score.</p>
                </div>
            </div>
        )
    }

    const trend = score >= 70 ? 'up' : score >= 40 ? 'flat' : 'down'
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
    const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-amber-400'

    return (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
            <div className="flex items-center gap-4">
                <div className={privacyMode ? 'blur-md' : ''}>
                    <ScoreRing score={score} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Brain className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-xs text-slate-500 font-medium">Score Financeiro</span>
                    </div>

                    {archetype && (
                        <>
                            <p className="text-sm font-bold text-slate-100 leading-snug">{archetype}</p>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{archetypeDescription}</p>
                        </>
                    )}

                    <div className="flex items-center gap-3 mt-3">
                        <div className={cn('flex items-center gap-1', trendColor)}>
                            <TrendIcon className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">{score}/100</span>
                        </div>
                        {savingsRate !== null && (
                            <span className={cn('text-xs text-slate-500', privacyMode && 'blur-md')}>
                                Taxa poupança: <span className="text-slate-300">{savingsRate.toFixed(1)}%</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
