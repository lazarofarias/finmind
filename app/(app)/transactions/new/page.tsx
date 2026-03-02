import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TransactionForm from '@/features/transactions/components/TransactionForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Novo Lançamento – FinMind' }

export default async function NewTransactionPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch accounts and categories
    const [accountsRes, categoriesRes] = await Promise.all([
        supabase.from('accounts').select('*').eq('user_id', user.id).eq('is_active', true),
        supabase.from('categories').select('*').order('name', { ascending: true })
    ])

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/transactions" className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-50 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-slate-50">Novo Lançamento</h1>
                    <p className="text-sm text-slate-400 mt-0.5">Cadastre uma nova receita ou despesa de ponta a ponta.</p>
                </div>
            </div>

            <TransactionForm
                accounts={accountsRes.data ?? []}
                categories={categoriesRes.data ?? []}
            />
        </div>
    )
}
