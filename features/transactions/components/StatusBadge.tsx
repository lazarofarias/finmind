'use client'

import { useTransition } from 'react'
import { toggleTransactionStatus } from '@/features/transactions/actions'
import { Check, Clock, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface StatusBadgeProps {
    id: string
    status: string // 'pending' | 'confirmed'
}

export default function StatusBadge({ id, status }: StatusBadgeProps) {
    const [isPending, startTransition] = useTransition()

    function handleToggle() {
        startTransition(async () => {
            const res = await toggleTransactionStatus(id, status)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success(res.newStatus === 'confirmed' ? 'Marcado como pago' : 'Marcado como pendente')
            }
        })
    }

    const isConfirmed = status === 'confirmed'

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase transition-all border',
                isConfirmed
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20',
                isPending && 'opacity-50 cursor-not-allowed'
            )}
        >
            {isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
            ) : isConfirmed ? (
                <Check className="w-3 h-3" />
            ) : (
                <Clock className="w-3 h-3" />
            )}
            {isConfirmed ? 'Pago' : 'Pendente'}
        </button>
    )
}
