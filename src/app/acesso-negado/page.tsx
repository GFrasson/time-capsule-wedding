import Link from 'next/link'

export default function AccessDeniedPage() {
  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm text-center">
        <h1 className="text-2xl font-semibold text-zinc-900">Acesso restrito</h1>
        <p className="mt-4 text-zinc-600">
          Este espaço é exclusivo para convidados da festa com o QR Code oficial.
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          Se você recebeu o QR Code, escaneie novamente para liberar o acesso.
        </p>

        <Link
          href="/"
          className="mt-6 inline-block text-sm text-zinc-700 underline underline-offset-4 hover:text-zinc-900"
        >
          Voltar para a página inicial
        </Link>
      </div>
    </main>
  )
}
