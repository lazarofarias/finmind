export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.12),rgba(255,255,255,0))]">
            <div className="w-full max-w-md px-4">
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">F</span>
                        </div>
                        <span className="text-2xl font-bold text-slate-50">FinMind</span>
                    </div>
                    <p className="text-slate-400 text-sm">Controle financeiro com inteligência artificial</p>
                </div>
                {children}
            </div>
        </div>
    )
}
