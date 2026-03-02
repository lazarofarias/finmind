'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard, ArrowLeftRight, TrendingUp, Bot, Settings, Wallet
} from 'lucide-react'

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/transactions', label: 'Transações', icon: ArrowLeftRight },
    { href: '/accounts', label: 'Contas', icon: Wallet },
    { href: '/investments', label: 'Investimentos', icon: TrendingUp },
    { href: '/ai-mentor', label: 'Mentor IA', icon: Bot },
    { href: '/settings', label: 'Configurações', icon: Settings },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-slate-900 border-r border-slate-800 px-3 py-6">
            {/* Logo */}
            <div className="flex items-center gap-3 px-3 mb-8">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <span className="text-white font-bold">F</span>
                </div>
                <span className="text-xl font-bold text-slate-50">FinMind</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href || pathname.startsWith(href + '/')
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                                active
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'text-slate-400 hover:text-slate-50 hover:bg-slate-800'
                            )}
                        >
                            <Icon className={cn('w-5 h-5 shrink-0', active ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300')} />
                            {label}
                        </Link>
                    )
                })}
            </nav>

            {/* Version */}
            <p className="px-3 text-xs text-slate-600">FinMind v1.0</p>
        </aside>
    )
}
