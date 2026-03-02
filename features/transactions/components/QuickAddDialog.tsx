'use client'

import { useState, useEffect } from 'react'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { createTransaction } from '@/features/transactions/actions'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Category, Account } from '@/types/database.types'

interface QuickAddDialogProps {
    open: boolean
    onOpenChange: (v: boolean) => void
}

function QuickAddForm({ onSuccess }: { onSuccess: () => void }) {
    const [loading, setLoading] = useState(false)
    const [accounts, setAccounts] = useState<Account[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [transactionType, setTransactionType] = useState<'fixo' | 'variavel' | 'receita'>('variavel')

    useEffect(() => {
        const supabase = createClient()
        supabase.from('accounts').select('*').eq('is_active', true).then(({ data }) => setAccounts(data ?? []))
        supabase.from('categories').select('*').then(({ data }) => setCategories(data ?? []))
    }, [])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const form = new FormData(e.currentTarget)
        const result = await createTransaction({
            amount: parseFloat(form.get('amount') as string),
            description: form.get('description') as string,
            category_id: (form.get('category_id') as string) || null,
            account_id: form.get('account_id') as string,
            type: transactionType,
            date: form.get('date') as string,
            status: 'confirmed',
            is_recurring: false,
        })
        setLoading(false)
        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success('Transação adicionada!')
            onSuccess()
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 px-1">
            {/* Amount */}
            <div className="space-y-1">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                    id="amount" name="amount" type="number" step="0.01" min="0.01"
                    placeholder="0,00" required
                    className="bg-slate-800 border-slate-700 text-slate-50"
                />
            </div>

            {/* Description */}
            <div className="space-y-1">
                <Label htmlFor="description">Descrição</Label>
                <Input
                    id="description" name="description" placeholder="Ex: Aluguel, Supermercado..." required
                    className="bg-slate-800 border-slate-700 text-slate-50"
                />
            </div>

            {/* Type switch */}
            <div className="space-y-1">
                <Label>Tipo</Label>
                <div className="flex gap-2">
                    {(['variavel', 'fixo', 'receita'] as const).map(t => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setTransactionType(t)}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all ${transactionType === t
                                    ? t === 'receita' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                        : 'bg-rose-500/20 border-rose-500 text-rose-400'
                                    : 'border-slate-700 text-slate-400 hover:border-slate-600'
                                }`}
                        >
                            {t === 'variavel' ? 'Variável' : t === 'fixo' ? 'Fixo' : 'Receita'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Category */}
            <div className="space-y-1">
                <Label htmlFor="category_id">Categoria</Label>
                <select
                    id="category_id" name="category_id"
                    className="w-full h-10 px-3 rounded-md bg-slate-800 border border-slate-700 text-slate-50 text-sm focus:outline-none focus:border-emerald-500"
                >
                    <option value="">Sem categoria</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            {/* Account */}
            <div className="space-y-1">
                <Label htmlFor="account_id">Conta</Label>
                <select
                    id="account_id" name="account_id" required
                    className="w-full h-10 px-3 rounded-md bg-slate-800 border border-slate-700 text-slate-50 text-sm focus:outline-none focus:border-emerald-500"
                >
                    <option value="">Selecione...</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
            </div>

            {/* Date */}
            <div className="space-y-1">
                <Label htmlFor="date">Data</Label>
                <Input
                    id="date" name="date" type="date"
                    defaultValue={new Date().toISOString().split('T')[0]} required
                    className="bg-slate-800 border-slate-700 text-slate-50"
                />
            </div>

            <Button
                type="submit" disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Salvar transação
            </Button>
        </form>
    )
}

export default function QuickAddDialog({ open, onOpenChange }: QuickAddDialogProps) {
    const isDesktop = useMediaQuery('(min-width: 1024px)')

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="bg-slate-900 border-slate-800 text-slate-50 max-w-md">
                    <DialogHeader>
                        <DialogTitle>Lançamento rápido</DialogTitle>
                    </DialogHeader>
                    <QuickAddForm onSuccess={() => onOpenChange(false)} />
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="bg-slate-900 border-slate-800 text-slate-50 pb-8">
                <DrawerHeader>
                    <DrawerTitle>Lançamento rápido</DrawerTitle>
                </DrawerHeader>
                <div className="px-4">
                    <QuickAddForm onSuccess={() => onOpenChange(false)} />
                </div>
            </DrawerContent>
        </Drawer>
    )
}
