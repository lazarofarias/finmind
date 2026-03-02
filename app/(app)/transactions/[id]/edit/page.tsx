import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import TransactionForm from '@/features/transactions/components/TransactionForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Editar Lançamento – FinMind' }

interface EditTransactionPageProps {
    params: Promise<{ id: string }>
}

export default async function EditTransactionPage({ params }: EditTransactionPageProps) {
    const { id } = await params

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch transaction, accounts and categories
    const [transactionRes, accountsRes, categoriesRes] = await Promise.all([
        supabase.from('transactions').select('*').eq('id', id).eq('user_id', user.id).single(),
        supabase.from('accounts').select('*').eq('user_id', user.id).eq('is_active', true),
        supabase.from('categories').select('*').order('name', { ascending: true })
    ])

    if (!transactionRes.data) {
        notFound()
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/transactions" className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-50 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-slate-50">Editar Lançamento</h1>
                    <p className="text-sm text-slate-400 mt-0.5">Modifique os dados da transação.</p>
                </div>
            </div>

            <TransactionForm
                accounts={accountsRes.data ?? []}
                categories={categoriesRes.data ?? []}
                initialData={transactionRes.data}
            />
        </div>
    )
}
