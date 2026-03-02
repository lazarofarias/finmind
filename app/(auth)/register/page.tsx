'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { register } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button disabled={pending} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
            {pending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Criar conta
        </Button>
    )
}

export default function RegisterPage() {
    const [state, formAction] = useActionState(register, null)

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
                <CardTitle className="text-slate-50">Criar conta</CardTitle>
                <CardDescription className="text-slate-400">Comece a controlar suas finanças gratuitamente</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="full_name" className="text-slate-300">Nome completo</Label>
                        <Input
                            id="full_name"
                            name="full_name"
                            placeholder="João Silva"
                            required
                            className="bg-slate-800 border-slate-700 text-slate-50 placeholder:text-slate-500 focus:border-emerald-500"
                        />
                    </div>
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
                        <Label htmlFor="password" className="text-slate-300">Senha (mín. 6 caracteres)</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            minLength={6}
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
                <p className="mt-4 text-center text-sm text-slate-400">
                    Já tem conta?{' '}
                    <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
                        Entrar
                    </Link>
                </p>
            </CardContent>
        </Card>
    )
}
