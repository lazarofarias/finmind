import { getInsightsAndSnapshots } from '@/features/ai-mentor/actions'
import { triggerAnalysis } from '@/features/ai-mentor/actions'
import InsightFeed from '@/features/ai-mentor/components/InsightFeed'
import CashFlowTrendChart from '@/features/ai-mentor/components/CashFlowTrendChart'
import FinancialScoreCard from '@/features/ai-mentor/components/FinancialScoreCard'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Brain, RefreshCw } from 'lucide-react'
import type { Metadata } from 'next'
import { revalidatePath } from 'next/cache'

export const metadata: Metadata = { title: 'Mentor de IA – FinMind' }

async function RunAnalysisButton() {
    async function handleTrigger() {
        'use server'
        await triggerAnalysis()
        revalidatePath('/ai-mentor')
    }
    return (
        <form action={handleTrigger}>
            <Button type="submit" variant="outline" size="sm"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100 gap-2">
                <RefreshCw className="w-3.5 h-3.5" />
                Analisar agora
            </Button>
        </form>
    )
}

export default async function AIMentorPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const data = user ? await getInsightsAndSnapshots() : null

    // Extract the latest cash-flow report insight for projections
    const cashFlowReport = data?.insights?.find(
        (i: any) => i.metadata?.is_cash_flow_report
    )
    const latestScore = data?.profile?.financial_score ?? null

    // Try to find archetype from an insight's metadata
    const archetypeInsight = data?.insights?.find((i: any) => i.metadata?.archetype)
    const archetype = archetypeInsight?.metadata?.archetype ?? null

    // Get real current balance from accounts
    const { data: accounts } = await (supabase as any)
        .from('accounts')
        .select('balance')
        .eq('user_id', user?.id)
        .eq('is_active', true)
    const currentBalance = (accounts ?? []).reduce((s: number, a: any) => s + Number(a.balance), 0)

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-50 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-indigo-400" />
                        Mentor de IA
                    </h1>
                    <p className="text-sm text-slate-400 mt-0.5">
                        Análise do seu comportamento financeiro e projeções inteligentes.
                    </p>
                </div>
                <RunAnalysisButton />
            </div>

            {/* Score card */}
            <FinancialScoreCard
                score={latestScore}
                archetype={archetype}
                archetypeDescription={null}
                savingsRate={cashFlowReport?.metadata?.savings_rate_percent ?? null}
                burnRateDaily={cashFlowReport?.metadata?.burn_rate_daily ?? null}
            />

            {/* Trend chart */}
            <CashFlowTrendChart
                snapshots={data?.snapshots ?? []}
                currentBalance={currentBalance}
                projectedMonthEnd={cashFlowReport?.metadata?.projected_month_end_balance ?? null}
                projected30d={cashFlowReport?.metadata?.projected_30d_balance ?? null}
            />

            {/* Insights feed */}
            <InsightFeed insights={data?.insights?.filter((i: any) => !i.metadata?.is_cash_flow_report) ?? []} />
        </div>
    )
}
