import type { Metadata } from 'next'
import BalanceCard from '@/features/dashboard/components/BalanceCard'
import CashFlowChart from '@/features/dashboard/components/CashFlowChart'
import UpcomingFixed from '@/features/dashboard/components/UpcomingFixed'
import InsightFeed from '@/features/ai-mentor/components/InsightFeed'
import FinancialScoreCard from '@/features/ai-mentor/components/FinancialScoreCard'
import Link from 'next/link'
import { LayoutDashboard, ArrowLeftRight, Wallet, TrendingUp, Brain, Settings, LogIn } from 'lucide-react'

export const metadata: Metadata = { title: 'Demo – FinMind' }

// ─── Mock data with correct prop types ───────────────────────
const MOCK_TOTALS = {
    income: 8500,
    fixed: 3200,
    variable: 1850,
    balance: 3450,
    available: 3450,
}

const MOCK_CHART = [
    { label: 'Out', income: 7200, expenses: 4800 },
    { label: 'Nov', income: 8100, expenses: 5200 },
    { label: 'Dez', income: 9500, expenses: 6100 },
    { label: 'Jan', income: 7800, expenses: 4900 },
    { label: 'Fev', income: 8200, expenses: 5400 },
    { label: 'Mar', income: 8500, expenses: 5050 },
]

const MOCK_UPCOMING = [
    { id: '1', description: 'Aluguel', amount: 1800, date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], categories: { name: 'Moradia', icon: '🏠', color: '#6366f1' } },
    { id: '2', description: 'Internet Vivo', amount: 99.9, date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], categories: { name: 'Utilidades', icon: '📡', color: '#f59e0b' } },
    { id: '3', description: 'Spotify', amount: 21.9, date: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0], categories: { name: 'Entretenimento', icon: '🎵', color: '#10b981' } },
]

const MOCK_INSIGHTS = [
    {
        id: '1', type: 'anomaly' as const, title: 'Gasto com Delivery 40% acima do mês passado',
        content: 'Você gastou R$ 580 em aplicativos de delivery em março vs R$ 415 em fevereiro. Considere cozinhar mais em casa para economizar.',
        read_status: false, feedback: null,
        metadata: { severity: 'warning' as const, archetype: 'O Gastronômico' },
        created_at: new Date().toISOString(),
    },
    {
        id: '2', type: 'tip' as const, title: 'Oportunidade: sobra R$ 3.450 este mês',
        content: 'Sua taxa de poupança é de 40,6% — excelente! Que tal alocar R$ 1.000 em renda variável? Seu perfil indica tolerância moderada a risco.',
        read_status: false, feedback: null,
        metadata: { severity: 'opportunity' as const },
        created_at: new Date().toISOString(),
    },
    {
        id: '3', type: 'alert' as const, title: 'Netflix + Amazon + Disney = R$ 104/mês',
        content: 'Identificamos 3 streamings ativos. Planos compartilhados ou revezamento entre plataformas poderiam economizar R$ 50–70/mês.',
        read_status: false, feedback: null,
        metadata: { severity: 'warning' as const },
        created_at: new Date().toISOString(),
    },
]

const navItems = [
    { href: '/demo', label: 'Dashboard', icon: LayoutDashboard, active: true },
    { href: '#', label: 'Transações', icon: ArrowLeftRight, active: false },
    { href: '#', label: 'Contas', icon: Wallet, active: false },
    { href: '#', label: 'Investimentos', icon: TrendingUp, active: false },
    { href: '#', label: 'Mentor IA', icon: Brain, active: false },
    { href: '#', label: 'Configurações', icon: Settings, active: false },
]

export default function DemoPage() {
    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* Demo Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-slate-900 border-r border-slate-800 px-3 py-6">
                <div className="flex items-center gap-3 px-3 mb-8">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <span className="text-white font-bold">F</span>
                    </div>
                    <span className="text-xl font-bold text-slate-50">FinMind</span>
                </div>
                <nav className="flex-1 space-y-1">
                    {navItems.map(({ href, label, icon: Icon, active }) => (
                        <a key={label} href={href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'text-slate-400 hover:text-slate-50 hover:bg-slate-800'
                                }`}>
                            <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-emerald-400' : 'text-slate-500'}`} />
                            {label}
                        </a>
                    ))}
                </nav>
                <p className="px-3 text-xs text-slate-600">FinMind v1.0 · Modo Demo</p>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* TopBar */}
                <header className="h-14 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40">
                    <div>
                        <span className="text-sm font-semibold text-slate-100">Olá, João Silva 👋</span>
                        <span className="ml-3 text-xs bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                            🎭 Modo Demo — dados fictícios
                        </span>
                    </div>
                    <Link href="/login"
                        className="flex items-center gap-2 text-sm px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition-colors">
                        <LogIn className="w-4 h-4" />
                        Fazer login de verdade
                    </Link>
                </header>

                {/* Content */}
                <main className="flex-1 p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-5">
                        <div>
                            <h1 className="text-xl font-bold text-slate-50">Dashboard</h1>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', weekday: 'long', day: 'numeric' })}
                            </p>
                        </div>

                        <BalanceCard totals={MOCK_TOTALS} totalBalance={12340.5} />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            <div className="lg:col-span-2">
                                <CashFlowChart data={MOCK_CHART} />
                            </div>
                            <div className="space-y-4">
                                <FinancialScoreCard
                                    score={74}
                                    archetype="O Poupador Estratégico"
                                    archetypeDescription="Você tem ótima organização financeira mas pode otimizar gastos variáveis."
                                    savingsRate={40.6}
                                    burnRateDaily={168.3}
                                />
                                <UpcomingFixed items={MOCK_UPCOMING as any} />
                            </div>
                        </div>

                        <InsightFeed insights={MOCK_INSIGHTS as any} />
                    </div>
                </main>
            </div>
        </div>
    )
}
