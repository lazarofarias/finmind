'use client'

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { useUIStore } from '@/store/ui.store'
import { formatBRL } from '@/lib/utils'

interface Snapshot {
    snapshot_date: string
    actual_balance: number
    projected_month_end_balance: number
    financial_score: number
}

interface TrendChartProps {
    snapshots: Snapshot[]
    currentBalance: number
    projectedMonthEnd: number | null
    projected30d: number | null
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl text-xs min-w-[180px]">
            <p className="font-semibold text-slate-200 mb-2">{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} className="flex items-center justify-between gap-4" style={{ color: p.color }}>
                    <span className="text-slate-400">{p.name}</span>
                    <span className="font-semibold">{formatBRL(p.value)}</span>
                </p>
            ))}
        </div>
    )
}

export default function CashFlowTrendChart({ snapshots, currentBalance, projectedMonthEnd, projected30d }: TrendChartProps) {
    const { privacyMode } = useUIStore()

    // Build chart data from historical snapshots + future projections
    const today = new Date()
    const todayStr = today.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

    // Historical data from snapshots
    const historicalData = snapshots.map(s => ({
        label: new Date(s.snapshot_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        real: s.actual_balance,
        projected: undefined as number | undefined,
        isFuture: false,
    }))

    // Add today's actual balance if not already there
    if (!historicalData.find(d => d.label === todayStr)) {
        historicalData.push({ label: todayStr, real: currentBalance, projected: undefined, isFuture: false })
    }

    // Future projections
    const futureData = []
    if (projectedMonthEnd !== null) {
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        futureData.push({
            label: endOfMonth.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
            real: undefined as number | undefined,
            projected: projectedMonthEnd,
            isFuture: true,
        })
    }
    if (projected30d !== null) {
        const in30d = new Date(today.getTime() + 30 * 86400000)
        futureData.push({
            label: in30d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
            real: undefined as number | undefined,
            projected: projected30d,
            isFuture: true,
        })
    }

    const allData = [...historicalData, ...futureData]

    if (allData.length < 2) {
        return (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 flex items-center justify-center h-48">
                <p className="text-slate-500 text-sm">Aguardando dados históricos para exibir o gráfico de tendência.</p>
            </div>
        )
    }

    return (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-slate-300">Tendência de Saldo</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Histórico real vs. projeção da IA</p>
                </div>
                {projectedMonthEnd !== null && (
                    <div className="text-right">
                        <p className="text-xs text-slate-500">Projeção fim do mês</p>
                        <p className={`text-sm font-bold ${projectedMonthEnd >= 0 ? 'text-emerald-400' : 'text-rose-400'} ${privacyMode ? 'blur-md' : ''}`}>
                            {formatBRL(projectedMonthEnd)}
                        </p>
                    </div>
                )}
            </div>

            <div className={`transition-all duration-300 ${privacyMode ? 'blur-md' : ''}`}>
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={allData}>
                        <defs>
                            <linearGradient id="realGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis
                            tick={{ fill: '#64748b', fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={v => new Intl.NumberFormat('pt-BR', { notation: 'compact', style: 'currency', currency: 'BRL' }).format(v)}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeDasharray: '4 4' }} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                        <ReferenceLine y={0} stroke="#334155" strokeDasharray="4 4" />
                        <Line
                            type="monotone"
                            dataKey="real"
                            name="Saldo Real"
                            stroke="#10b981"
                            strokeWidth={2.5}
                            dot={{ fill: '#10b981', r: 3 }}
                            activeDot={{ r: 5 }}
                            connectNulls={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="projected"
                            name="Saldo Previsto"
                            stroke="#6366f1"
                            strokeWidth={2}
                            strokeDasharray="6 3"
                            dot={{ fill: '#6366f1', r: 3, strokeDasharray: 0 }}
                            activeDot={{ r: 5 }}
                            connectNulls
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <p className="text-[10px] text-slate-600 mt-2 text-center">
                Linha sólida = histórico real · Linha pontilhada = projeção da IA
            </p>
        </div>
    )
}
