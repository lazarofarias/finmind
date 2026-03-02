'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import QuickAddDialog from '@/features/transactions/components/QuickAddDialog'

export default function QuickAddFAB() {
    const [open, setOpen] = useState(false)

    return (
        <>
            {/* FAB – visible only on mobile, centered above the bottom nav */}
            <button
                onClick={() => setOpen(true)}
                className={cn(
                    'lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
                    'w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400',
                    'flex items-center justify-center shadow-xl shadow-emerald-500/40',
                    'transition-all duration-200 active:scale-95'
                )}
                aria-label="Adicionar transação"
            >
                {open ? <X className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6 text-white" />}
            </button>

            <QuickAddDialog open={open} onOpenChange={setOpen} />
        </>
    )
}
