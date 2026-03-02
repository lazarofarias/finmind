'use client'
import { useState } from 'react'
import QuickAddDialog from '@/features/transactions/components/QuickAddDialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function QuickAddDesktopTrigger() {
    const [open, setOpen] = useState(false)
    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                className="hidden lg:flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
            >
                <Plus className="w-4 h-4" />
                Novo lançamento
            </Button>
            <QuickAddDialog open={open} onOpenChange={setOpen} />
        </>
    )
}
