import Link from 'next/link'
import { UploadForm } from '@/components/upload-form'

interface UploadPageProps {
  params: Promise<{ capsuleId: string }>
}

export default async function UploadPage({ params }: UploadPageProps) {
  const { capsuleId } = await params

  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl text-center text-zinc-900 mb-8">
          Cápsula do Tempo
        </h1>
        <p className="text-center text-zinc-600 mb-8 max-w-sm mx-auto">
          Compartilhe um momento especial com os noivos. Sua mensagem será guardada com carinho.
        </p>
        <UploadForm capsuleId={capsuleId} />

        <div className="mt-6 pb-6 text-center">
          <Link
            href={`/capsules/${capsuleId}`}
            className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors underline underline-offset-4"
          >
            Ver mensagens
          </Link>
        </div>
      </div>
    </main>
  )
}
