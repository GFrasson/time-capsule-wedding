'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Camera, Upload, Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'

export function UploadForm() {
  const [isUploading, setIsUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(selectedFile)
      } else {
        setPreview(null)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsUploading(true)

    const formData = new FormData(e.currentTarget)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      toast.success('Mensagem enviada com sucesso!')
      // Reset form
      setFile(null);
      setPreview(null);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error(error)
      toast.error('Erro ao enviar mensagem. Tente novamente.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-zinc-100">
      <CardHeader>
        <CardTitle className="text-2xl text-center text-zinc-800">
          Deixe sua mensagem
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sender" className="text-zinc-600">Seu Nome</Label>
            <Input id="sender" name="sender" placeholder="Ex: Tio João" required className="bg-zinc-50" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-zinc-600">Mensagem</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Escreva algo especial para os noivos..."
              className="resize-none bg-zinc-50 min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-600 block">Foto ou Vídeo (Opcional)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="file"
                name="file"
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Label
                htmlFor="file"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-50 transition-colors"
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="h-full object-contain" />
                ) : file ? (
                  <div className="text-center">
                    <p className="text-sm font-medium text-zinc-700">{file.name}</p>
                    <p className="text-xs text-zinc-400">Clique para alterar</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-zinc-400">
                    <Upload className="w-8 h-8" />
                    <span className="text-sm">Toque para selecionar</span>
                  </div>
                )}
              </Label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white transition-all py-6 text-lg"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Enviando...
              </>
            ) : (
              <>
                Enviar <Send className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
