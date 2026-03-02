'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitInsightFeedback(insightId: string, feedback: 1 | -1) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autenticado' }

    await (supabase as any)
        .from('ai_insights')
        .update({ feedback, feedback_at: new Date().toISOString(), read_status: true })
        .eq('id', insightId)
        .eq('user_id', user.id)

    revalidatePath('/dashboard')
    revalidatePath('/ai-mentor')
    return { success: true }
}

export async function markInsightRead(insightId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await (supabase as any)
        .from('ai_insights')
        .update({ read_status: true })
        .eq('id', insightId)
        .eq('user_id', user.id)

    revalidatePath('/dashboard')
}

export async function triggerAnalysis() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autenticado' }

    const { data, error } = await supabase.functions.invoke('analyze-finances', {
        body: { userId: user.id },
    })

    if (error) return { error: error.message }
    revalidatePath('/dashboard')
    revalidatePath('/ai-mentor')
    return { success: true, data }
}

export async function getInsightsAndSnapshots() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]

    const [insightsRes, snapshotsRes, profileRes] = await Promise.all([
        (supabase as any)
            .from('ai_insights')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20),

        (supabase as any)
            .from('cash_flow_snapshots')
            .select('*')
            .eq('user_id', user.id)
            .gte('snapshot_date', thirtyDaysAgo)
            .order('snapshot_date', { ascending: true }),

        (supabase as any)
            .from('profiles')
            .select('financial_score, investor_profile, full_name')
            .eq('id', user.id)
            .single(),
    ])

    return {
        insights: insightsRes.data ?? [],
        snapshots: snapshotsRes.data ?? [],
        profile: profileRes.data,
    }
}
