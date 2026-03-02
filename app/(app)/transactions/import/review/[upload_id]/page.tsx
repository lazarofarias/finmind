import ReviewClient from '@/features/pdf-import/components/ReviewClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Revisar Importação – FinMind' }

export default function ReviewPage({ params }: { params: { upload_id: string } }) {
    return <ReviewClient uploadId={params.upload_id} />
}
