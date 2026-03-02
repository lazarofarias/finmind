'use client'

import { logout } from '@/features/auth/actions'
import { useUIStore } from '@/store/ui.store'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, LogOut, Bell } from 'lucide-react'
import { Profile } from '@/types/database.types'

interface TopBarProps {
    profile: Profile | null
}

export default function TopBar({ profile }: TopBarProps) {
    const { privacyMode, togglePrivacyMode } = useUIStore()

    return (
        <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 lg:px-6 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
            {/* Greeting */}
            <div>
                <p className="text-xs text-slate-500">Bem-vindo de volta,</p>
                <p className="text-sm font-semibold text-slate-100 truncate max-w-[160px]">
                    {profile?.full_name?.split(' ')[0] ?? 'Usuário'}
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {/* Privacy toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePrivacyMode}
                    className="text-slate-400 hover:text-slate-50 hover:bg-slate-800"
                    title={privacyMode ? 'Mostrar valores' : 'Ocultar valores'}
                >
                    {privacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-50 hover:bg-slate-800" title="Notificações">
                    <Bell className="w-4 h-4" />
                </Button>

                {/* Logout */}
                <form action={logout}>
                    <Button variant="ghost" size="icon" type="submit" className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10" title="Sair">
                        <LogOut className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </header>
    )
}
