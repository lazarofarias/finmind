'use client'

import { useState, useTransition } from 'react'
import { MoreHorizontal, Edit, Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { deleteTransaction } from '@/features/transactions/actions'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Link from 'next/link'

interface TransactionRowActionsProps {
    id: string
}

export default function TransactionRowActions({ id }: TransactionRowActionsProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [isPending, startTransition] = useTransition()

    function handleDelete() {
        startTransition(async () => {
            const res = await deleteTransaction(id)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success('Transação excluída com sucesso')
                setShowDeleteDialog(false)
            }
        })
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-50 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-300 w-40">
                    <DropdownMenuItem asChild className="hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">
                        <Link href={`/transactions/${id}/edit`} className="flex items-center gap-2">
                            <Edit className="w-4 h-4" /> Editar
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-800" />
                    <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-rose-400 focus:bg-slate-800 focus:text-rose-300 cursor-pointer flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" /> Excluir
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="bg-slate-900 border-slate-800 text-slate-50">
                    <DialogHeader>
                        <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
                            <AlertTriangle className="w-6 h-6 text-rose-500" />
                        </div>
                        <DialogTitle className="text-xl">Excluir transação?</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Esta ação não pode ser desfeita. O lançamento será permanentemente removido do seu histórico e fluxos de caixa.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6 gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={isPending}
                            className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-50"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={isPending}
                            className="bg-rose-500 hover:bg-rose-600 text-white"
                        >
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Sim, excluir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
