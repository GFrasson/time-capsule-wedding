import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { storageProvider } from '@/lib/storage'
import { getCapsuleAccessConfig } from '@/lib/capsule-access/config'
import { ACCESS_COOKIE_NAME, hasValidAccessCookie } from '@/lib/capsule-access/cookie'

interface Params {
  capsuleId: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { capsuleId } = await params

  try {
    const accessConfig = getCapsuleAccessConfig()

    if (accessConfig) {
      const hasAccess = await hasValidAccessCookie(
        request.cookies.get(ACCESS_COOKIE_NAME)?.value,
        accessConfig.cookieSecret
      )

      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const sender = formData.get('sender') as string
    const content = formData.get('content') as string
    const title = formData.get('title') as string

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    let mediaUrl = ''
    let mediaType = 'TEXT'

    if (file && file.size > 0) {
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
