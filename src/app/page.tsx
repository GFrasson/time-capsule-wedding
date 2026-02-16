import Link from 'next/link'
import { Timeline } from '@/components/timeline'
import { Button } from '@/components/ui/button'
import { PlusCircle, QrCode } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 relative pb-20 font-sans">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-bold text-zinc-800">Cápsula do Tempo</h1>
        <Link href="/share">
          <Button variant="ghost" size="icon" className="hover:bg-zinc-100 rounded-full">
            <QrCode className="w-5 h-5 text-zinc-600" />
            <span className="sr-only">QR Code</span>
          </Button>
        </Link>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl text-zinc-900 mb-2">Linha do Tempo</h2>
          <p className="text-zinc-500">Momentos compartilhados pelos convidados</p>
        </div>

        <Timeline />
      </div>

      <div className="fixed bottom-6 right-6 z-20">
        <Link href="/upload">
          <Button size="lg" className="rounded-full w-12 h-12 shadow-lg bg-primary hover:bg-primary/90 transition-transform hover:scale-105 flex items-center justify-center p-0">
            <PlusCircle className="w-12 h-12 text-white" />
            <span className="sr-only">Adicionar</span>
          </Button>
        </Link>
      </div>
    </main>
  )
}
