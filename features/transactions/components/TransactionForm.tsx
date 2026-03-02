'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTransaction, updateTransaction } from '@/features/transactions/actions'
import { Account, Category, Transaction } from '@/types/database.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface TransactionFormProps {
    accounts: Account[]
    categories: Category[]
    initialData?: Transaction
}

export default function TransactionForm({ accounts, categories, initialData }: TransactionFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [transactionType, setTransactionType] = useState(initialData?.type ?? 'variavel')
    const [status, setStatus] = useState(initialData?.status ?? 'pending')

    const isEditing = !!initialData

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const form = new FormData(e.currentTarget)

        const payload = {
            amount: parseFloat(form.get('amount') as string),
            description: form.get('description') as string,
            category_id: (form.get('category_id') as string) || null,
            account_id: form.get('account_id') as string,
            date: form.get('date') as string,
            type: transactionType as 'fixo' | 'variavel' | 'receita',
            status: status as 'pending' | 'confirmed',
            is_recurring: false,
        }

        let result
        if (isEditing) {
            result = await updateTransaction(initialData.id, payload)
        } else {
            result = await createTransaction(payload)
        }

        setLoading(false)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success(isEditing ? 'Lançamento atualizado' : 'Lançamento criado')
            router.push('/transactions')
            router.refresh()
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto pb-10">
            {/* Header / Type Switcher */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-50 mb-1">Qual é o tipo do lançamento?</h2>
                    <p className="text-sm text-slate-400">Receitas aumentam seu saldo, fixos e variáveis diminuem.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    {(['receita', 'fixo', 'variavel'] as const).map(t => {
                        const isSelected = transactionType === t
                        const labels = { receita: 'Receita', fixo: 'Gasto Fixo', variavel: 'Gasto Variável' }
                        const colors = {
                            receita: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                            fixo: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
                            variavel: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }
                        return (
                            <button
                                key={t} type="button" onClick={() => setTransactionType(t)}
                                className={`flex-1 p-4 rounded-xl border text-sm font-semibold transition-all ${isSelected ? colors[t] : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                    }`}
                            >
                                {labels[t]}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Details Form */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount" className="text-slate-300">Valor (R$)</Label>
                        <Input
                            id="amount" name="amount" type="number" step="0.01" min="0.01"
                            defaultValue={initialData?.amount}
                            placeholder="0,00" required
                            className="h-12 text-lg font-medium bg-slate-800 border-slate-700 text-slate-50"
                        />
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label htmlFor="date" className="text-slate-300">Data da Ocorrência</Label>
                        <Input
                            id="date" name="date" type="date"
                            defaultValue={initialData?.date || new Date().toISOString().split('T')[0]} required
                            className="h-12 bg-slate-800 border-slate-700 text-slate-50"
                        />
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label htmlFor="description" className="text-slate-300">Descrição</Label>
                    <Input
                        id="description" name="description"
                        defaultValue={initialData?.description || ''}
                        placeholder="Ex: Aluguel do Apartamento..." required
                        className="h-12 bg-slate-800 border-slate-700 text-slate-50"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Category */}
                    <div className="space-y-2">
                        <Label htmlFor="category_id" className="text-slate-300">Categoria</Label>
                        <select
                            id="category_id" name="category_id"
                            defaultValue={initialData?.category_id || ''}
                            className="w-full h-12 px-3 rounded-md bg-slate-800 border border-slate-700 text-slate-50 text-sm focus:outline-none focus:border-emerald-500"
                        >
                            <option value="">Sem categoria</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    {/* Account */}
                    <div className="space-y-2">
                        <Label htmlFor="account_id" className="text-slate-300">Conta Bancária / Destino</Label>
                        <select
                            id="account_id" name="account_id" required
                            defaultValue={initialData?.account_id || ''}
                            className="w-full h-12 px-3 rounded-md bg-slate-800 border border-slate-700 text-slate-50 text-sm focus:outline-none focus:border-emerald-500"
                        >
                            <option value="" disabled>Selecione uma conta...</option>
                            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Status Toggle */}
                <div className="pt-2">
                    <Label className="text-slate-300 block mb-2">Status de Pagamento</Label>
                    <div className="flex bg-slate-800 rounded-lg p-1 w-full md:w-fit">
                        <button
                            type="button"
                            onClick={() => setStatus('pending')}
                            className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-semibold transition-all ${status === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            Pendente
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatus('confirmed')}
                            className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-semibold transition-all ${status === 'confirmed' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            Pago / Recebido
                        </button>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-50"
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {isEditing ? 'Salvar Alterações' : 'Criar Lançamento'}
                </Button>
            </div>
        </form>
    )
}
