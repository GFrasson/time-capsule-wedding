'use client'

import { QRCodeSVG } from 'qrcode.react'
import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface QRCodeGeneratorProps {
  capsuleId: string
}

export function QRCodeGenerator({ capsuleId }: QRCodeGeneratorProps) {
  const url = useMemo(() => {
    if (typeof window === 'undefined') return ''

    const uploadUrl = new URL(`${window.location.origin}/capsules/${capsuleId}/upload`)
    const inviteToken = process.env.NEXT_PUBLIC_CAPSULE_ACCESS_TOKEN

    if (inviteToken) {
      uploadUrl.searchParams.set('invite', inviteToken)
    }

    return uploadUrl.toString()
  }, [capsuleId])

  if (!url) return null

  return (
    <Card className="max-w-sm mx-auto border-zinc-200 shadow-lg print:shadow-none print:border-none">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Cápsula do Tempo</CardTitle>
        <CardDescription>Escaneie para deixar uma mensagem</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <div className="p-4 bg-white rounded-xl shadow-inner border border-zinc-100">
          <QRCodeSVG
            value={url}
            size={200}
            level="H"
            includeMargin
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
