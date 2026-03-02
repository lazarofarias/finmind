'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChartMonth } from '@/features/dashboard/utils/calculateTotals'
import { useUIStore } from '@/store/ui.store'

interface CashFlowChartProps {
    data: ChartMonth[]
    loading?: boolean
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl text-xs">
            <p className="font-semibold text-slate-200 mb-2">{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} style={{ color: p.color }} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
                    {p.name}: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(p.value)}
                </p>
            ))}
        </div>
    )
}

export default function CashFlowChart({ data, loading }: CashFlowChartProps) {
    const { privacyMode } = useUIStore()

    if (loading) {
        return (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 animate-pulse">
                <div className="h-4 bg-slate-800 rounded w-40 mb-6" />
                <div className="h-48 bg-slate-800 rounded" />
            </div>
        )
    }

    return (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Fluxo de Caixa – Últimos 6 Meses</h3>
            <div className={`transition-all duration-300 ${privacyMode ? 'blur-md' : ''}`}>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data} barSize={16} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis
                            tick={{ fill: '#64748b', fontSize: 10 }}
                            axisLine={false} tickLine={false}
                            tickFormatter={v => new Intl.NumberFormat('pt-BR', { notation: 'compact', currency: 'BRL', style: 'currency' }).format(v)}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                        <Bar dataKey="income" name="Receita" fill="#10b981" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="expenses" name="Despesas" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
