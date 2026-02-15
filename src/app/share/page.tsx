import { QRCodeGenerator } from '@/components/qr-code-generator'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function SharePage() {
  return (
    <main className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 left-4 print:hidden">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 text-zinc-600 hover:text-zinc-900">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
        </Link>
      </div>
      <div className="w-full max-w-md">
        <QRCodeGenerator />
      </div>
    </main>
  )
}
