'use client'

import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Send, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  getMediaBatchValidationError,
  getMediaValidationError,
} from '@/lib/upload-validation'

const uploadSchema = z.object({
  title: z.string().optional(),
  sender: z.string().optional(),
  content: z.string().optional(),
  files: z
    .array(z.custom<File>((value) => value instanceof File))
    .superRefine((files, ctx) => {
      if (files.length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'Por favor, selecione ao menos um arquivo.',
        })
        return
      }

      for (const file of files) {
        const validationError = getMediaValidationError(
          file.type || 'application/octet-stream',
          file.size
        )

        if (validationError) {
          ctx.addIssue({
            code: 'custom',
            message: validationError,
          })
          return
        }
      }

      const batchValidationError = getMediaBatchValidationError(
        files.map((file) => file.type || 'application/octet-stream')
      )

      if (batchValidationError) {
        ctx.addIssue({
          code: 'custom',
          message: batchValidationError,
        })
      }
    }),
})

interface UploadFormProps {
  capsuleId?: string
}

interface DirectUploadInitResponse {
  directUpload: true
  uploadUrl: string
  storagePath: string
  mediaType: 'IMAGE' | 'VIDEO'
}

type UploadInitResponse = DirectUploadInitResponse | { directUpload: false }

type PreparedUpload =
  | {
      kind: 'direct'
      mediaPath: string
      mediaType: 'IMAGE' | 'VIDEO'
      order: number
    }
  | {
      kind: 'fallback'
      file: File
      order: number
    }

async function getResponseErrorMessage(response: Response, fallback: string) {
  const data = await response.json().catch(() => null)

  if (typeof data?.error === 'string' && data.error.trim().length > 0) {
    return data.error
  }

  return fallback
}

export function UploadForm({ capsuleId }: UploadFormProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const form = useForm<z.infer<typeof uploadSchema>>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: '',
      sender: '',
      content: '',
      files: [],
    },
  })

  const selectedFiles = form.watch('files') ?? []

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files ?? [])

    form.setValue('files', nextFiles, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
  }

  const onSubmit = async (values: z.infer<typeof uploadSchema>) => {
    if (!capsuleId) {
      toast.error('Capsula invalida.')
      return
    }

    setIsUploading(true)

    try {
      const preparedUploads = await Promise.all(
        values.files.map(async (file, order): Promise<PreparedUpload> => {
          const initResponse = await fetch(`/api/capsules/${capsuleId}/upload/init`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              originalFilename: file.name,
              mimeType: file.type || 'application/octet-stream',
              fileSize: file.size,
            }),
          })

          if (!initResponse.ok) {
            throw new Error(
              await getResponseErrorMessage(
                initResponse,
                'Não foi possível preparar seus uploads agora. Tente novamente em instantes.'
              )
            )
          }

          const initResult = (await initResponse.json()) as UploadInitResponse

          if (!initResult.directUpload) {
            return {
              kind: 'fallback',
              file,
              order,
            }
          }

          const uploadResponse = await fetch(initResult.uploadUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': file.type || 'application/octet-stream',
            },
            body: file,
          })

          if (!uploadResponse.ok) {
            throw new Error(`Não foi possível enviar ${file.name}.`)
          }

          return {
            kind: 'direct',
            mediaPath: initResult.storagePath,
            mediaType: initResult.mediaType,
            order,
          }
        })
      )

      const formData = new FormData()

      if (values.title) formData.append('title', values.title)
      if (values.sender) formData.append('sender', values.sender)
      if (values.content) formData.append('content', values.content)

      preparedUploads
        .sort((left, right) => left.order - right.order)
        .forEach((upload) => {
          if (upload.kind === 'direct') {
            formData.append('mediaPath', upload.mediaPath)
            formData.append('mediaType', upload.mediaType)
            formData.append('mediaOrder', String(upload.order))
            return
          }

          formData.append('file', upload.file)
          formData.append('fileOrder', String(upload.order))
        })

      const response = await fetch(`/api/capsules/${capsuleId}/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(
          await getResponseErrorMessage(
            response,
            'Não foi possível enviar sua mensagem agora. Tente novamente em instantes.'
          )
        )
      }

      toast.success('Mensagem enviada com sucesso!')
      form.reset({
        title: '',
        sender: '',
        content: '',
        files: [],
      })

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error(error)
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Não foi possível enviar sua mensagem agora. Tente novamente em instantes.'

      toast.error(message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md border-zinc-100 shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-2xl text-zinc-800">
          Deixe sua mensagem
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-zinc-600">
              Título
            </Label>
            <Input
              id="title"
              placeholder="Ex: Lembrança da Praia"
              className="bg-zinc-50"
              {...form.register('title')}
            />
            {form.formState.errors.title ? (
              <p className="text-sm text-red-500">
                {form.formState.errors.title.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sender" className="text-zinc-600">
              Seu Nome
            </Label>
            <Input
              id="sender"
              placeholder="Ex: Tio João"
              className="bg-zinc-50"
              {...form.register('sender')}
            />
            {form.formState.errors.sender ? (
              <p className="text-sm text-red-500">
                {form.formState.errors.sender.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-zinc-600">
              Mensagem
            </Label>
            <Textarea
              id="content"
              placeholder="Escreva algo especial para os noivos..."
              className="min-h-[100px] resize-none bg-zinc-50"
              {...form.register('content')}
            />
            {form.formState.errors.content ? (
              <p className="text-sm text-red-500">
                {form.formState.errors.content.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label className="block text-zinc-600">
              Fotos ou Vídeo <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                id="files"
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <Label
                htmlFor="files"
                className={`flex min-h-32 w-full cursor-pointer flex-col justify-center rounded-lg border-2 border-dashed transition-colors hover:bg-zinc-50 ${
                  form.formState.errors.files ? 'border-red-500' : 'border-zinc-200'
                }`}
              >
                {selectedFiles.length > 0 ? (
                  <div className="space-y-3 p-4">
                    <div className="flex items-center justify-between gap-3 text-left">
                      <p className="text-sm font-medium text-zinc-700">
                        {selectedFiles.length === 1
                          ? selectedFiles[0].name
                          : `${selectedFiles.length} arquivos selecionados`}
                      </p>
                      <p className="text-xs text-zinc-400">Clique para alterar</p>
                    </div>

                    <div className="space-y-2">
                      {selectedFiles.slice(0, 4).map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="rounded-md bg-zinc-100 px-3 py-2 text-left"
                        >
                          <p className="truncate text-sm text-zinc-700">
                            {file.name}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {file.type.startsWith('video/') ? 'Vídeo' : 'Imagem'}
                          </p>
                        </div>
                      ))}
                    </div>

                    {selectedFiles.length > 4 ? (
                      <p className="text-xs text-zinc-500">
                        +{selectedFiles.length - 4} arquivo(s)
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 p-4 text-zinc-400">
                    <Upload className="h-8 w-8" />
                    <span className="text-sm">Toque para selecionar</span>
                    <span className="text-center text-xs">
                      Até 10 imagens ou 1 vídeo
                    </span>
                  </div>
                )}
              </Label>
            </div>
            <p className="text-xs text-zinc-400">
              Até 10 imagens ou 1 vídeo. Cada arquivo pode ter até 50MB.
            </p>
            {form.formState.errors.files ? (
              <p className="text-sm text-red-500">
                {form.formState.errors.files.message as string}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            className="w-full bg-zinc-900 py-6 text-lg text-white transition-all hover:bg-zinc-800"
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
