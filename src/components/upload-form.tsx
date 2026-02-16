'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg"];

const uploadSchema = z.object({
  title: z.string().optional(),
  sender: z.string().optional(),
  content: z.string().optional(),
  file: z.custom<File>((val) => val instanceof File, "Por favor, selecione um arquivo")
    .refine((file) => file.size <= MAX_FILE_SIZE, `O arquivo deve ter no máximo 50MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type) || ACCEPTED_VIDEO_TYPES.includes(file.type),
      "Apenas imagens e vídeos são permitidos."
    )
})

interface UploadFormProps {
  capsuleId?: string
}

export function UploadForm({ capsuleId }: UploadFormProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const form = useForm<z.infer<typeof uploadSchema>>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: '',
      sender: '',
      content: '',
    },
  })

  // Handle file selection separately to manage preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      form.setValue('file', selectedFile)
      form.clearErrors('file')

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

  const onSubmit = async (values: z.infer<typeof uploadSchema>) => {
    setIsUploading(true)

    const formData = new FormData()
    formData.append('file', values.file)
    if (values.title) formData.append('title', values.title)
    if (values.sender) formData.append('sender', values.sender)
    if (values.content) formData.append('content', values.content)

    try {
      const response = await fetch(`/api/capsules/${capsuleId}/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      toast.success('Mensagem enviada com sucesso!')
      // Reset form
      form.reset()
      setPreview(null)
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-zinc-600">Título</Label>
            <Input
              id="title"
              placeholder="Ex: Lembrança da Praia"
              className="bg-zinc-50"
              {...form.register('title')}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sender" className="text-zinc-600">Seu Nome</Label>
            <Input
              id="sender"
              placeholder="Ex: Tio João"
              className="bg-zinc-50"
              {...form.register('sender')}
            />
            {form.formState.errors.sender && (
              <p className="text-sm text-red-500">{form.formState.errors.sender.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-zinc-600">Mensagem</Label>
            <Textarea
              id="content"
              placeholder="Escreva algo especial para os noivos..."
              className="resize-none bg-zinc-50 min-h-[100px]"
              {...form.register('content')}
            />
            {form.formState.errors.content && (
              <p className="text-sm text-red-500">{form.formState.errors.content.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-600 block">Foto ou Vídeo <span className="text-red-500">*</span></Label>
            <div className="flex items-center gap-4">
              <Input
                required
                id="file"
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Label
                htmlFor="file"
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-zinc-50 transition-colors ${form.formState.errors.file ? 'border-red-500' : 'border-zinc-200'
                  }`}
              >
                {preview ? (
                  <Image
                    src={preview}
                    alt="Preview"
                    className="h-full object-contain"
                    width={400}
                    height={400}
                  />
                ) : form.watch('file') ? (
                  <div className="text-center">
                    <p className="text-sm font-medium text-zinc-700">{form.watch('file')?.name}</p>
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
            {form.formState.errors.file && (
              <p className="text-sm text-red-500">{form.formState.errors.file.message as string}</p>
            )}
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
