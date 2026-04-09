import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { storageProvider } from '@/lib/storage'
import { getMediaValidationError } from '@/lib/upload-validation'

interface Params {
  capsuleId: string
}

export async function POST(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  const { capsuleId } = await params

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const mediaPath = formData.get('mediaPath') as string | null
    const mediaTypeFromClient = formData.get('mediaType') as string | null
    const sender = formData.get('sender') as string
    const content = formData.get('content') as string
    const title = formData.get('title') as string

    const hasDirectUpload = Boolean(mediaPath && mediaTypeFromClient)
    const hasFileUpload = Boolean(file && file.size > 0)

    if (!hasDirectUpload && !hasFileUpload) {
      return NextResponse.json({ error: 'File or uploaded media reference is required' }, { status: 400 })
    }

    let mediaUrl = ''
    let mediaType = 'TEXT'

    if (hasDirectUpload) {
      mediaUrl = mediaPath!
      mediaType = mediaTypeFromClient === 'VIDEO' ? 'VIDEO' : 'IMAGE'
    } else if (file && file.size > 0) {
      const validationError = getMediaValidationError(file.type || 'application/octet-stream', file.size)

      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 })
      }

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      const mimeType = file.type || 'application/octet-stream';
      const originalFilename = file.name || 'unnamed_file';

      const uploadResult = await storageProvider.upload(buffer, originalFilename, mimeType);

      mediaUrl = uploadResult.storagePath
      mediaType = uploadResult.mediaType
    }

    const message = await prisma.message.create({
      data: {
        sender: sender || null,
        content: content || null,
        title: title || null,
        mediaUrl: mediaUrl,
        type: mediaType,
        capsuleId: capsuleId,
      },
    })

    return NextResponse.json({ success: true, message })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
