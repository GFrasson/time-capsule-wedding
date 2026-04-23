import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCapsuleAccessConfig } from '@/lib/capsule-access/config'
import { ACCESS_COOKIE_NAME, hasValidAccessCookie } from '@/lib/capsule-access/cookie'
import {
  getMediaBatchValidationError,
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
  thumbnailPath: string | null
}

function getStringEntries(values: FormDataEntryValue[]) {
  return values.filter((value): value is string => typeof value === 'string')
}

function isValidSortOrder(value: number) {
  return Number.isInteger(value) && value >= 0
}

function hasUniqueSortOrders(sortOrders: number[]) {
  return new Set(sortOrders).size === sortOrders.length
}

function parseDirectUploadAssets(formData: FormData) {
  const mediaPaths = getStringEntries(formData.getAll('mediaPath'))
  const thumbnailPaths = getStringEntries(formData.getAll('thumbnailPath'))
  const mediaTypes = getStringEntries(formData.getAll('mediaType'))
  const mediaOrders = getStringEntries(formData.getAll('mediaOrder'))

  if (
    mediaPaths.length !== mediaTypes.length ||
    mediaPaths.length !== mediaOrders.length ||
    (thumbnailPaths.length > 0 && mediaPaths.length !== thumbnailPaths.length)
  ) {
    return null
  }

  const assets: DirectUploadAsset[] = []
  const hasThumbnailPaths = thumbnailPaths.length === mediaPaths.length

  for (let index = 0; index < mediaPaths.length; index += 1) {
    const storagePath = mediaPaths[index]?.trim()
    const thumbnailPath = hasThumbnailPaths ? thumbnailPaths[index]?.trim() : ''
    const mediaType = getMessageMediaType(mediaTypes[index] ?? '')
    const sortOrder = Number(mediaOrders[index])

    if (!storagePath || !mediaType || !isValidSortOrder(sortOrder)) {
      return null
    }

    assets.push({
      storagePath,
      thumbnailPath:
        mediaType === 'IMAGE' && thumbnailPath ? thumbnailPath : null,
      mediaType,
      sortOrder,
    })
  }

  return assets
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

    if (!directUploadAssets) {
      return NextResponse.json(
        { error: 'Dados de mídia inválidos.' },
        { status: 400 }
      )
    }

    if (directUploadAssets.length === 0) {
      return NextResponse.json(
        { error: 'Selecione ao menos uma foto ou vídeo para enviar.' },
        { status: 400 }
      )
    }

    const allSortOrders = directUploadAssets.map((asset) => asset.sortOrder)

    if (!hasUniqueSortOrders(allSortOrders)) {
      return NextResponse.json(
        { error: 'Dados de mídia inválidos.' },
        { status: 400 }
      )
    }

    const batchValidationError = getMediaBatchValidationError(
      directUploadAssets.map((asset) => asset.mediaType)
    )

    if (batchValidationError) {
      return NextResponse.json({ error: batchValidationError }, { status: 400 })
    }

    const assets = directUploadAssets.sort(
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
          create: assets.map(({ storagePath, thumbnailPath, sortOrder }) => ({
            storagePath,
            thumbnailPath,
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
