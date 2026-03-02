import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Settings, User, Bell, Shield, CreditCard } from 'lucide-react'
import { logout } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Configurações – FinMind' }

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

    return (
        <div className="max-w-2xl mx-auto space-y-5">
            <div>
                <h1 className="text-xl font-bold text-slate-50 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-400" />
                    Configurações
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">Preferências e perfil da conta</p>
            </div>

            {/* Profile card */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-300">Perfil</span>
                </div>
                <div className="space-y-3">
                    <Row label="Nome" value={profile?.full_name ?? user?.user_metadata?.full_name ?? '—'} />
                    <Row label="E-mail" value={user?.email ?? '—'} />
                    <Row label="Perfil investidor" value={profile?.investor_profile ?? 'não definido'} />
                    <Row label="Score financeiro" value={profile?.financial_score != null ? `${profile.financial_score}/100` : '—'} />
                </div>
            </div>

            {/* Notifications */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                    <Bell className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-300">Notificações</span>
                </div>
                <p className="text-sm text-slate-500">Configure alertas de e-mail adicionando <code className="bg-slate-800 px-1 rounded text-slate-300">RESEND_API_KEY</code> no ambiente e fazendo deploy da Edge Function <code className="bg-slate-800 px-1 rounded text-slate-300">analyze-finances</code>.</p>
            </div>

            {/* Danger zone */}
            <div className="rounded-2xl bg-rose-500/5 border border-rose-500/20 p-5 space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-rose-500/10">
                    <Shield className="w-4 h-4 text-rose-400" />
                    <span className="text-sm font-semibold text-rose-400">Sessão</span>
                </div>
                <form action={logout}>
                    <Button type="submit" variant="destructive" size="sm">
                        Sair da conta
                    </Button>
                </form>
            </div>
        </div>
    )
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">{label}</span>
            <span className="text-slate-200 font-medium capitalize">{value}</span>
        </div>
    )
}
