'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, ArrowLeftRight, TrendingUp, Bot, Settings } from 'lucide-react'

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/transactions', label: 'Transações', icon: ArrowLeftRight },
    { href: '/investments', label: 'Investimentos', icon: TrendingUp },
    { href: '/ai-mentor', label: 'Mentor', icon: Bot },
    { href: '/settings', label: 'Config', icon: Settings },
]

export default function MobileNav() {
    const pathname = usePathname()

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800">
            <div className="flex items-center justify-around h-16 px-2">
                {navItems.map(({ href, label, icon: Icon }, i) => {
                    const active = pathname === href || pathname.startsWith(href + '/')
                    // Middle slot is reserved for the FAB in the parent layout
                    if (i === 2) {
                        return (
                            <div key="spacer" className="w-16" />
                        )
                    }
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                'flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all min-w-[48px]',
                                active ? 'text-emerald-400' : 'text-slate-500'
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-[10px] font-medium">{label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
