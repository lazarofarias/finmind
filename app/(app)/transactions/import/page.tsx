import FileUploader from '@/features/pdf-import/components/FileUploader'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Importar Fatura – FinMind' }

export default function ImportPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-xl font-bold text-slate-50">Importar Fatura</h1>
                <p className="text-sm text-slate-400 mt-1">
                    Faça upload do PDF da sua fatura e deixe a IA extrair e categorizar as transações automaticamente.
                </p>
            </div>
            <FileUploader />
        </div>
    )
}
