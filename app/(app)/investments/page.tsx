import type { Metadata } from 'next'
import { TrendingUp } from 'lucide-react'

export const metadata: Metadata = { title: 'Investimentos – FinMind' }

export default function InvestmentsPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-5">
            <div>
                <h1 className="text-xl font-bold text-slate-50 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-slate-400" />
                    Investimentos
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">Carteira e alocação de ativos</p>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-indigo-400" />
                </div>
                <p className="text-slate-300 font-semibold text-lg">Módulo de Investimentos</p>
                <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
                    Em construção. Aqui você poderá acompanhar seus ativos, Suitability e sugestões de alocação baseadas em perfil de risco.
                </p>
                <div className="flex gap-2 justify-center mt-5 flex-wrap">
                    {['Renda Fixa', 'Ações', 'FIIs', 'Cripto', 'Internacional'].map(cat => (
                        <span key={cat} className="text-xs bg-slate-800 border border-slate-700 text-slate-500 rounded-full px-3 py-1">
                            {cat}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}
