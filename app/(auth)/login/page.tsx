'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { login } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Loader2, Sparkles } from 'lucide-react'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button disabled={pending} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
            {pending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Entrar
        </Button>
    )
}

export default function LoginPage() {
    const [state, formAction] = useActionState(login, null)

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
                <CardTitle className="text-slate-50">Bem-vindo de volta</CardTitle>
                <CardDescription className="text-slate-400">Entre com sua conta FinMind</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-300">E-mail</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="seu@email.com"
                            required
                            className="bg-slate-800 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-emerald-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-300">Senha</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            className="bg-slate-800 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-emerald-500"
                        />
                    </div>
                    {state?.error && (
                        <p className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                            {state.error}
                        </p>
                    )}
                    <SubmitButton />
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-slate-800" />
                    <span className="text-xs text-slate-600">ou</span>
                    <div className="flex-1 h-px bg-slate-800" />
                </div>

                {/* Demo button */}
                <Link href="/demo"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-indigo-500/30 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/50 transition-all text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    Explorar o demo sem login →
                </Link>

                <p className="mt-4 text-center text-sm text-slate-400">
                    Não tem conta?{' '}
                    <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
                        Cadastre-se
                    </Link>
                </p>
            </CardContent>
        </Card>
    )
}
