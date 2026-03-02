'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

type Stage = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

const STAGE_LABELS: Record<Stage, string> = {
    idle: '',
    uploading: 'Enviando arquivo...',
    processing: 'IA analisando gastos...',
    done: 'Preparando revisão...',
    error: 'Erro no processamento',
}

export default function FileUploader() {
    const [stage, setStage] = useState<Stage>('idle')
    const [progress, setProgress] = useState(0)
    const [errorMsg, setErrorMsg] = useState('')
    const router = useRouter()

    const processUpload = useCallback(async (file: File) => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setStage('error'); setErrorMsg('Não autenticado.'); return }

        // Validate
        if (file.type !== 'application/pdf') {
            setStage('error'); setErrorMsg('Apenas arquivos PDF são aceitos.'); return
        }
        if (file.size > 10 * 1024 * 1024) {
            setStage('error'); setErrorMsg('Arquivo muito grande. Máximo 10MB.'); return
        }

        setStage('uploading')
        setProgress(10)

        const filePath = `${user.id}/${Date.now()}_${file.name.replace(/\s/g, '_')}`

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('statements')
            .upload(filePath, file, { contentType: 'application/pdf', upsert: false })

        if (uploadError) {
            setStage('error')
            setErrorMsg(uploadError.message === 'The object exceeded the maximum allowed size'
                ? 'Arquivo muito grande. Máximo 10MB.'
                : uploadError.message)
            return
        }

        setProgress(35)

        // Create pdf_uploads record
        const { data: uploadRecord, error: dbError } = await supabase
            .from('pdf_uploads')
            .insert({
                user_id: user.id,
                file_path: filePath,
                original_name: file.name,
                status: 'pending',
            })
            .select()
            .single()

        if (dbError || !uploadRecord) {
            setStage('error'); setErrorMsg(dbError?.message ?? 'Erro ao registrar upload.'); return
        }

        setProgress(50)
        setStage('processing')

        // Invoke Edge Function
        const { data: fnData, error: fnError } = await supabase.functions.invoke('process-pdf', {
            body: { uploadId: uploadRecord.id, filePath, userId: user.id },
        })

        if (fnError || fnData?.error) {
            await supabase.from('pdf_uploads').update({
                status: 'error',
                error_logs: fnError?.message ?? fnData?.error,
            }).eq('id', uploadRecord.id)
            setStage('error')
            setErrorMsg(fnError?.message ?? fnData?.error ?? 'Falha no processamento.')
            return
        }

        setProgress(100)
        setStage('done')

        setTimeout(() => {
            router.push(`/transactions/import/review/${uploadRecord.id}`)
        }, 800)
    }, [router])

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop: ([file]) => { if (file) processUpload(file) },
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        disabled: stage !== 'idle' && stage !== 'error',
    })

    return (
        <div className="w-full space-y-4">
            <div
                {...getRootProps()}
                className={cn(
                    'relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed',
                    'p-12 cursor-pointer transition-all duration-200 group',
                    isDragActive && !isDragReject ? 'border-emerald-400 bg-emerald-500/5' :
                        isDragReject ? 'border-rose-400 bg-rose-500/5' :
                            stage === 'error' ? 'border-rose-500/50 bg-rose-500/5' :
                                'border-slate-700 bg-slate-900 hover:border-slate-600 hover:bg-slate-800/50'
                )}
            >
                <input {...getInputProps()} />

                {stage === 'idle' || stage === 'error' ? (
                    <>
                        <div className={cn(
                            'w-16 h-16 rounded-2xl flex items-center justify-center mb-4',
                            stage === 'error' ? 'bg-rose-500/10' : 'bg-slate-800 group-hover:bg-slate-700'
                        )}>
                            {stage === 'error'
                                ? <AlertCircle className="w-8 h-8 text-rose-400" />
                                : <Upload className="w-8 h-8 text-slate-400 group-hover:text-slate-200" />
                            }
                        </div>
                        <p className={cn('text-base font-semibold', stage === 'error' ? 'text-rose-400' : 'text-slate-200')}>
                            {stage === 'error' ? 'Erro: clique para tentar novamente' : 'Solte o PDF da fatura aqui'}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            {stage === 'error' ? errorMsg : 'ou clique para selecionar • Apenas PDF, máx. 10MB'}
                        </p>
                    </>
                ) : stage === 'done' ? (
                    <>
                        <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4" />
                        <p className="text-base font-semibold text-emerald-400">Processamento concluído!</p>
                        <p className="text-sm text-slate-500 mt-1">Redirecionando para revisão...</p>
                    </>
                ) : (
                    <>
                        {/* Animated processing state */}
                        <div className="relative w-20 h-20 mb-4">
                            <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                            <div
                                className="absolute inset-0 rounded-full border-4 border-emerald-500 transition-all duration-500"
                                style={{
                                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin((progress / 100) * 2 * Math.PI)}% ${50 - 50 * Math.cos((progress / 100) * 2 * Math.PI)}%)`
                                }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                {stage === 'uploading'
                                    ? <Upload className="w-7 h-7 text-emerald-400 animate-bounce" />
                                    : <FileText className="w-7 h-7 text-emerald-400 animate-pulse" />
                                }
                            </div>
                        </div>
                        <p className="text-base font-semibold text-slate-200">{STAGE_LABELS[stage]}</p>
                        <div className="w-48 h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">{progress}%</p>
                    </>
                )}
            </div>

            {/* Supported banks info */}
            <div className="flex flex-wrap gap-2 justify-center">
                {['Nubank', 'Itaú', 'Bradesco', 'Inter', 'C6 Bank', 'XP', 'BTG'].map(bank => (
                    <span key={bank} className="text-xs text-slate-500 bg-slate-800 border border-slate-700 rounded-full px-3 py-1">
                        {bank}
                    </span>
                ))}
            </div>
        </div>
    )
}
