import { UploadForm } from '@/components/upload-form'

export default function UploadPage() {
  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-serif text-center text-zinc-900 mb-8">
          Cápsula do Tempo
        </h1>
        <p className="text-center text-zinc-600 mb-8 max-w-sm mx-auto">
          Compartilhe um momento especial com os noivos. Sua mensagem será guardada com carinho.
        </p>
        <UploadForm />
      </div>
    </main>
  )
}
