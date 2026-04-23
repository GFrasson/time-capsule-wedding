import { NextResponse } from 'next/server'
import { storageProvider } from '@/lib/storage'
import { getMediaValidationError } from '@/lib/upload-validation'

const THUMBNAIL_MIME_TYPE = 'image/jpeg'

function getThumbnailFilename(originalFilename: string) {
  const filename = originalFilename.trim().split(/[\\/]/).pop() || 'image'
  const extensionIndex = filename.lastIndexOf('.')
  const nameWithoutExtension =
    extensionIndex > 0 ? filename.slice(0, extensionIndex) : filename

  return `${nameWithoutExtension}-thumbnail.jpg`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const originalFilename = body.originalFilename as string | undefined
    const mimeType = body.mimeType as string | undefined
    const fileSize = body.fileSize as number | undefined

    if (!originalFilename || !mimeType) {
      return NextResponse.json(
        { error: 'originalFilename and mimeType are required' },
        { status: 400 }
      )
    }

    const validationError = getMediaValidationError(mimeType, fileSize)

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const uploadTarget = await storageProvider.createPresignedUpload(
      originalFilename,
      mimeType
    )
    const thumbnailUploadTarget =
      uploadTarget.mediaType === 'IMAGE'
        ? await storageProvider.createPresignedUpload(
            getThumbnailFilename(originalFilename),
            THUMBNAIL_MIME_TYPE
          )
        : null

    return NextResponse.json({
      directUpload: true,
      ...uploadTarget,
      ...(thumbnailUploadTarget
        ? {
            thumbnailUploadUrl: thumbnailUploadTarget.uploadUrl,
            thumbnailStoragePath: thumbnailUploadTarget.storagePath,
          }
        : {}),
    })
  } catch (error) {
    console.error('Upload init error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
