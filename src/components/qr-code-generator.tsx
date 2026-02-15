'use client'

import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function QRCodeGenerator() {
  const [url, setUrl] = useState('')

  useEffect(() => {
    // Generate URL for the upload page
    setUrl(`${window.location.origin}/upload`)
  }, [])

  if (!url) return null

  return (
    <Card className="max-w-sm mx-auto border-zinc-200 shadow-lg print:shadow-none print:border-none">
      <CardHeader className="text-center">
        <CardTitle className="font-serif text-2xl">Cápsula do Tempo</CardTitle>
        <CardDescription>Escaneie para deixar uma mensagem</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <div className="p-4 bg-white rounded-xl shadow-inner border border-zinc-100">
          <QRCodeSVG
            value={url}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>
        <p className="text-xs text-zinc-400 break-all text-center">{url}</p>
        <Button variant="outline" className="w-full print:hidden" onClick={() => window.print()}>
          <Download className="w-4 h-4 mr-2" /> Imprimir
        </Button>
      </CardContent>
    </Card>
  )
}
