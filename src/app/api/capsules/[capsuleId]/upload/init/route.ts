import { NextResponse } from 'next/server'
import { storageProvider } from '@/lib/storage'
import { getMediaValidationError } from '@/lib/upload-validation'

interface Params {
  capsuleId: string
}

export async function POST(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  await params

  try {
    const body = await request.json()
    const originalFilename = body.originalFilename as string | undefined
    const mimeType = body.mimeType as string | undefined
    const fileSize = body.fileSize as number | undefined

    if (!originalFilename || !mimeType) {
      return NextResponse.json({ error: 'originalFilename and mimeType are required' }, { status: 400 })
    }

    const validationError = getMediaValidationError(mimeType, fileSize)

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const uploadTarget = await storageProvider.createPresignedUpload?.(originalFilename, mimeType)

    if (!uploadTarget) {
      return NextResponse.json({ directUpload: false }, { status: 200 })
    }

    return NextResponse.json({
      directUpload: true,
      ...uploadTarget,
    })
  } catch (error) {
    console.error('Upload init error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
