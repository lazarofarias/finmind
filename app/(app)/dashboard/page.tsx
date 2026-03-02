import { getDashboardData } from '@/features/transactions/actions'
import { getInsightsAndSnapshots } from '@/features/ai-mentor/actions'
import { calculateTotals, buildChartData } from '@/features/dashboard/utils/calculateTotals'
import BalanceCard from '@/features/dashboard/components/BalanceCard'
import CashFlowChart from '@/features/dashboard/components/CashFlowChart'
import UpcomingFixed from '@/features/dashboard/components/UpcomingFixed'
import InsightFeed from '@/features/ai-mentor/components/InsightFeed'
import FinancialScoreCard from '@/features/ai-mentor/components/FinancialScoreCard'
import QuickAddDialogDesktop from '@/features/dashboard/components/QuickAddDesktopTrigger'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard – FinMind' }

export default async function DashboardPage() {
    const [data, aiData] = await Promise.all([getDashboardData(), getInsightsAndSnapshots()])

    if (!data) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-500">
                Erro ao carregar dados. Tente novamente.
            </div>
        )
    }

    const totals = calculateTotals(data.transactions, data.currentMonthRange.start, data.currentMonthRange.end)
    const chartData = buildChartData(data.transactions)
    const totalBalance = (data.accounts as Array<{ balance: number }>).reduce((s, a) => s + a.balance, 0)

    // AI data
    const cashFlowReport = aiData?.insights?.find((i: any) => i.metadata?.is_cash_flow_report)
    const latestScore = aiData?.profile?.financial_score ?? null
    const archetype = aiData?.insights?.find((i: any) => i.metadata?.archetype)?.metadata?.archetype ?? null
    const feedInsights = aiData?.insights?.filter((i: any) => !i.metadata?.is_cash_flow_report).slice(0, 3) ?? []

    return (
        <div className="max-w-7xl mx-auto space-y-5">
            {/* Header row */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-50">Dashboard</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', weekday: 'long', day: 'numeric' })}
                    </p>
                </div>
                <QuickAddDialogDesktop />
            </div>

            {/* Balance */}
            <BalanceCard totals={totals} totalBalance={totalBalance} />

            {/* Chart + Upcoming + Score */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                    <CashFlowChart data={chartData} />
                </div>
                <div className="space-y-4">
                    {/* Financial Score mini */}
                    <FinancialScoreCard
                        score={latestScore}
                        archetype={archetype}
                        archetypeDescription={null}
                        savingsRate={cashFlowReport?.metadata?.savings_rate_percent ?? null}
                        burnRateDaily={cashFlowReport?.metadata?.burn_rate_daily ?? null}
                    />
                    <UpcomingFixed items={data.upcomingFixed as any} />
                </div>
            </div>

            {/* AI Insights feed (top 3) */}
            {feedInsights.length > 0 && (
                <InsightFeed insights={feedInsights as any} />
            )}
        </div>
    )
}

