import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { storageProvider } from '@/lib/storage'
import { getCapsuleAccessConfig } from '@/lib/capsule-access/config'
import { ACCESS_COOKIE_NAME, hasValidAccessCookie } from '@/lib/capsule-access/cookie'
import {
  getMediaBatchValidationError,
  getMediaValidationError,
  getMessageMediaType,
} from '@/lib/upload-validation'
import type { MessageMediaType } from '@/lib/upload-validation'

interface Params {
  capsuleId: string
}

type DirectUploadAsset = {
  mediaType: MessageMediaType
  sortOrder: number
  storagePath: string
}

type PendingFileUpload = {
  file: File
  sortOrder: number
}

function getStringEntries(values: FormDataEntryValue[]) {
  return values.filter((value): value is string => typeof value === 'string')
}

function getFileEntries(values: FormDataEntryValue[]) {
  return values.filter(
    (value): value is File => value instanceof File && value.size > 0
  )
}

function isValidSortOrder(value: number) {
  return Number.isInteger(value) && value >= 0
}

function hasUniqueSortOrders(sortOrders: number[]) {
  return new Set(sortOrders).size === sortOrders.length
}

function parseDirectUploadAssets(formData: FormData) {
  const mediaPaths = getStringEntries(formData.getAll('mediaPath'))
  const mediaTypes = getStringEntries(formData.getAll('mediaType'))
  const mediaOrders = getStringEntries(formData.getAll('mediaOrder'))

  if (
    mediaPaths.length !== mediaTypes.length ||
    mediaPaths.length !== mediaOrders.length
  ) {
    return null
  }

  const assets: DirectUploadAsset[] = []

  for (let index = 0; index < mediaPaths.length; index += 1) {
    const storagePath = mediaPaths[index]?.trim()
    const mediaType = getMessageMediaType(mediaTypes[index] ?? '')
    const sortOrder = Number(mediaOrders[index])

    if (!storagePath || !mediaType || !isValidSortOrder(sortOrder)) {
      return null
    }

    assets.push({
      storagePath,
      mediaType,
      sortOrder,
    })
  }

  return assets
}

function parsePendingFileUploads(formData: FormData) {
  const files = getFileEntries(formData.getAll('file'))
  const fileOrders = getStringEntries(formData.getAll('fileOrder'))

  if (files.length !== fileOrders.length) {
    return null
  }

  const uploads: PendingFileUpload[] = []

  for (let index = 0; index < files.length; index += 1) {
    const sortOrder = Number(fileOrders[index])

    if (!isValidSortOrder(sortOrder)) {
      return null
    }

    uploads.push({
      file: files[index],
      sortOrder,
    })
  }

  return uploads
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
    const sender = formData.get('sender') as string
    const content = formData.get('content') as string
    const title = formData.get('title') as string

    const directUploadAssets = parseDirectUploadAssets(formData)
    const pendingFileUploads = parsePendingFileUploads(formData)

    if (!directUploadAssets || !pendingFileUploads) {
      return NextResponse.json(
        { error: 'Dados de mídia inválidos.' },
        { status: 400 }
      )
    }

    if (
      directUploadAssets.length === 0 &&
      pendingFileUploads.length === 0
    ) {
      return NextResponse.json(
        { error: 'Selecione ao menos uma foto ou vídeo para enviar.' },
        { status: 400 }
      )
    }

    for (const { file } of pendingFileUploads) {
      const validationError = getMediaValidationError(
        file.type || 'application/octet-stream',
        file.size
      )

      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 })
      }
    }

    const allSortOrders = [
      ...directUploadAssets.map((asset) => asset.sortOrder),
      ...pendingFileUploads.map((upload) => upload.sortOrder),
    ]

    if (!hasUniqueSortOrders(allSortOrders)) {
      return NextResponse.json(
        { error: 'Dados de mídia inválidos.' },
        { status: 400 }
      )
    }

    const batchValidationError = getMediaBatchValidationError([
      ...directUploadAssets.map((asset) => asset.mediaType),
      ...pendingFileUploads.map(
        ({ file }) => file.type || 'application/octet-stream'
      ),
    ])

    if (batchValidationError) {
      return NextResponse.json({ error: batchValidationError }, { status: 400 })
    }

    const uploadedAssets = await Promise.all(
      pendingFileUploads.map(async ({ file, sortOrder }) => {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const mimeType = file.type || 'application/octet-stream'
        const originalFilename = file.name || 'unnamed_file'
        const uploadResult = await storageProvider.upload(
          buffer,
          originalFilename,
          mimeType
        )
        const mediaType = getMessageMediaType(uploadResult.mediaType)

        if (!mediaType) {
          throw new Error('Storage provider returned unsupported media type')
        }

        return {
          storagePath: uploadResult.storagePath,
          mediaType,
          sortOrder,
        }
      })
    )

    const assets = [...directUploadAssets, ...uploadedAssets].sort(
      (left, right) => left.sortOrder - right.sortOrder
    )
    const messageType = assets[0]?.mediaType

    if (!messageType) {
      return NextResponse.json(
        { error: 'Selecione ao menos uma foto ou vídeo para enviar.' },
        { status: 400 }
      )
    }

    const message = await prisma.message.create({
      data: {
        sender: sender || null,
        content: content || null,
        title: title || null,
        type: messageType,
        capsuleId,
        assets: {
          create: assets.map(({ storagePath, sortOrder }) => ({
            storagePath,
            sortOrder,
          })),
        },
      },
      include: {
        assets: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    })

    return NextResponse.json({ success: true, message })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Ocorreu um erro ao enviar sua mensagem. Tente novamente.' },
      { status: 500 }
    )
  }
}
