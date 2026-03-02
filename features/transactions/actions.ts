'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { TransactionInsert } from '@/types/database.types'

export async function createTransaction(data: Omit<TransactionInsert, 'user_id'>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autenticado' }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('transactions').insert({ ...data, user_id: user.id })
    if (error) return { error: error.message }

    revalidatePath('/dashboard')
    revalidatePath('/transactions')
    return { success: true }
}

export async function getDashboardData() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()

    // Current month range
    const monthStart = new Date(year, month, 1).toISOString().split('T')[0]
    const monthEnd = new Date(year, month + 1, 0).toISOString().split('T')[0]

    // Last 6 months
    const sixMonthsAgo = new Date(year, month - 5, 1).toISOString().split('T')[0]

    const [transactionsRes, accountsRes, insightRes, upcomingRes] = await Promise.all([
        // All transactions for last 6 months
        supabase.from('transactions').select('*')
            .eq('user_id', user.id)
            .gte('date', sixMonthsAgo)
            .lte('date', monthEnd)
            .order('date', { ascending: false }),

        // All active accounts
        supabase.from('accounts').select('*').eq('user_id', user.id).eq('is_active', true),

        // Latest unread insight
        supabase.from('ai_insights').select('*')
            .eq('user_id', user.id).eq('read_status', false)
            .order('created_at', { ascending: false }).limit(1).maybeSingle(),

        // Upcoming fixed expenses (next 7 days)
        supabase.from('transactions').select('*, categories(name, icon, color)')
            .eq('user_id', user.id)
            .eq('type', 'fixo')
            .eq('status', 'pending')
            .gte('date', now.toISOString().split('T')[0])
            .lte('date', new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0])
            .order('date', { ascending: true })
            .limit(3),
    ])

    return {
        transactions: transactionsRes.data ?? [],
        accounts: accountsRes.data ?? [],
        insight: insightRes.data,
        upcomingFixed: upcomingRes.data ?? [],
        currentMonthRange: { start: monthStart, end: monthEnd },
    }
}

export type DashboardData = NonNullable<Awaited<ReturnType<typeof getDashboardData>>>
