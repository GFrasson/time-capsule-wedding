import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from './route'

type UploadRouteRequest = {
  cookies: {
    get: (name: string) => { value: string } | undefined
  }
  formData: () => Promise<FormData>
}

type RequestEntry = [string, string | File]
type MediaAssetEntry = {
  storagePath: string
  mediaType: string
  sortOrder: number | string
}
type UploadEntryOptions = {
  assets?: MediaAssetEntry[]
  sender?: string
  content?: string
  title?: string
}
type CreatedAsset = {
  storagePath: string
  sortOrder: number
}
type ExpectedMessageCreate = {
  sender?: string | null
  content?: string | null
  title?: string | null
  type: 'IMAGE' | 'VIDEO'
  assets: CreatedAsset[]
}

const CAPSULE_ID = 'capsule-123'
const MESSAGE_INCLUDE = {
  assets: {
    orderBy: {
      sortOrder: 'asc',
    },
  },
}

const prismaMocks = vi.hoisted(() => ({
  messageCreate: vi.fn(),
}))

const accessMocks = vi.hoisted(() => ({
  getCapsuleAccessConfig: vi.fn(),
  hasValidAccessCookie: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  default: {
    message: {
      create: prismaMocks.messageCreate,
    },
  },
}))

vi.mock('@/lib/capsule-access/config', () => ({
  getCapsuleAccessConfig: accessMocks.getCapsuleAccessConfig,
}))

vi.mock('@/lib/capsule-access/cookie', () => ({
  ACCESS_COOKIE_NAME: 'wedding_guest_access',
  hasValidAccessCookie: accessMocks.hasValidAccessCookie,
}))

function createRequest(
  entries: RequestEntry[],
  cookieValue?: string
): UploadRouteRequest {
  const formData = new FormData()

  for (const [key, value] of entries) {
    formData.append(key, value)
  }

  return {
    cookies: {
      get: vi.fn((name: string) =>
        name === 'wedding_guest_access' && cookieValue
          ? { value: cookieValue }
          : undefined
      ),
    },
    formData: vi.fn().mockResolvedValue(formData),
  }
}

function createParams() {
  return Promise.resolve({ capsuleId: CAPSULE_ID })
}

function createDirectUploadEntries(
  count: number,
  mediaType: 'IMAGE' | 'VIDEO',
  filenameFactory: (index: number) => string
): RequestEntry[] {
  const entries: RequestEntry[] = []

  for (let index = 0; index < count; index += 1) {
    entries.push(
      ['mediaPath', filenameFactory(index)],
      ['mediaType', mediaType],
      ['mediaOrder', String(index)]
    )
  }

  return entries
}

function appendOptionalEntry(
  entries: RequestEntry[],
  key: string,
  value?: string
) {
  if (value !== undefined) {
    entries.push([key, value])
  }
}

function createMediaEntries(assets: MediaAssetEntry[]): RequestEntry[] {
  const entries: RequestEntry[] = []

  for (const { storagePath, mediaType, sortOrder } of assets) {
    entries.push(
      ['mediaPath', storagePath],
      ['mediaType', mediaType],
      ['mediaOrder', String(sortOrder)]
    )
  }

  return entries
}

function createUploadEntries({
  assets = [],
  sender,
  content,
  title,
}: UploadEntryOptions): RequestEntry[] {
  const entries = createMediaEntries(assets)

  appendOptionalEntry(entries, 'sender', sender)
  appendOptionalEntry(entries, 'content', content)
  appendOptionalEntry(entries, 'title', title)

  return entries
}

async function submitUpload(entries: RequestEntry[], cookieValue?: string) {
  const request = createRequest(entries, cookieValue)
  const response = await POST(
    request as unknown as Parameters<typeof POST>[0],
    { params: createParams() }
  )

  return { request, response }
}

async function expectErrorResponse(
  response: Response,
  status: number,
  error: string
) {
  expect(response.status).toBe(status)
  await expect(response.json()).resolves.toEqual({ error })
}

async function expectSuccessResponse(response: Response, message: unknown) {
  expect(response.status).toBe(200)
  await expect(response.json()).resolves.toEqual({
    success: true,
    message,
  })
}

function expectMessageCreateCalledWith({
  sender = null,
  content = null,
  title = null,
  type,
  assets,
}: ExpectedMessageCreate) {
  expect(prismaMocks.messageCreate).toHaveBeenCalledWith({
    data: {
      sender,
      content,
      title,
      type,
      capsuleId: CAPSULE_ID,
      assets: {
        create: assets.map(({ storagePath, sortOrder }) => ({
          storagePath,
          sortOrder,
        })),
      },
    },
    include: MESSAGE_INCLUDE,
  })
}

describe('POST /api/capsules/[capsuleId]/upload', () => {
  beforeEach(() => {
    prismaMocks.messageCreate.mockReset()
    accessMocks.getCapsuleAccessConfig.mockReset()
    accessMocks.hasValidAccessCookie.mockReset()

    accessMocks.getCapsuleAccessConfig.mockReturnValue(null)
    accessMocks.hasValidAccessCookie.mockResolvedValue(false)
    prismaMocks.messageCreate.mockResolvedValue({
      id: 'message-1',
      capsuleId: CAPSULE_ID,
      type: 'IMAGE',
      assets: [],
    })
  })

  it('returns 403 when the capsule is protected and the access cookie is invalid', async () => {
    accessMocks.getCapsuleAccessConfig.mockReturnValue({
      inviteToken: 'invite-token',
      cookieSecret: 'cookie-secret',
    })
    accessMocks.hasValidAccessCookie.mockResolvedValue(false)

    const { request, response } = await submitUpload([])

    await expectErrorResponse(response, 403, 'Access denied')
    expect(accessMocks.hasValidAccessCookie).toHaveBeenCalledWith(
      undefined,
      'cookie-secret'
    )
    expect(request.formData).not.toHaveBeenCalled()
    expect(prismaMocks.messageCreate).not.toHaveBeenCalled()
  })

  it('returns 400 when no direct uploads are provided', async () => {
    const { response } = await submitUpload(
      createUploadEntries({
        sender: 'Alice',
        content: 'Parabens!',
        title: 'Memoria',
      })
    )

    await expectErrorResponse(
      response,
      400,
      'Selecione ao menos uma foto ou v\u00eddeo para enviar.'
    )
    expect(prismaMocks.messageCreate).not.toHaveBeenCalled()
  })

  it('persists a direct upload when the access cookie is valid', async () => {
    accessMocks.getCapsuleAccessConfig.mockReturnValue({
      inviteToken: 'invite-token',
      cookieSecret: 'cookie-secret',
    })
    accessMocks.hasValidAccessCookie.mockResolvedValue(true)

    const message = {
      id: 'message-2',
      capsuleId: CAPSULE_ID,
      type: 'VIDEO',
      assets: [
        {
          id: 'asset-1',
          storagePath: `capsules/${CAPSULE_ID}/video.mp4`,
          sortOrder: 0,
        },
      ],
    }

    prismaMocks.messageCreate.mockResolvedValue(message)

    const { response } = await submitUpload(
      createUploadEntries({
        assets: [
          {
            storagePath: `capsules/${CAPSULE_ID}/video.mp4`,
            mediaType: 'VIDEO',
            sortOrder: 0,
          },
        ],
        sender: 'Alice',
        content: 'Uma lembranca especial',
        title: 'Nosso video',
      }),
      'signed-cookie'
    )

    await expectSuccessResponse(response, message)
    expect(accessMocks.hasValidAccessCookie).toHaveBeenCalledWith(
      'signed-cookie',
      'cookie-secret'
    )
    expectMessageCreateCalledWith({
      sender: 'Alice',
      content: 'Uma lembranca especial',
      title: 'Nosso video',
      type: 'VIDEO',
      assets: [
        {
          storagePath: `capsules/${CAPSULE_ID}/video.mp4`,
          sortOrder: 0,
        },
      ],
    })
  })

  it('persists multiple direct upload images in the same message', async () => {
    const message = {
      id: 'message-3',
      capsuleId: CAPSULE_ID,
      type: 'IMAGE',
      assets: [
        {
          id: 'asset-1',
          storagePath: `capsules/${CAPSULE_ID}/photo-1.jpg`,
          sortOrder: 0,
        },
        {
          id: 'asset-2',
          storagePath: `capsules/${CAPSULE_ID}/photo-2.jpg`,
          sortOrder: 1,
        },
      ],
    }

    prismaMocks.messageCreate.mockResolvedValue(message)

    const { response } = await submitUpload(
      createUploadEntries({
        assets: [
          {
            storagePath: `capsules/${CAPSULE_ID}/photo-1.jpg`,
            mediaType: 'IMAGE',
            sortOrder: 0,
          },
          {
            storagePath: `capsules/${CAPSULE_ID}/photo-2.jpg`,
            mediaType: 'IMAGE',
            sortOrder: 1,
          },
        ],
        sender: 'Carol',
        content: 'Duas lembrancas em uma mensagem',
      })
    )

    expectMessageCreateCalledWith({
      sender: 'Carol',
      content: 'Duas lembrancas em uma mensagem',
      type: 'IMAGE',
      assets: [
        {
          storagePath: `capsules/${CAPSULE_ID}/photo-1.jpg`,
          sortOrder: 0,
        },
        {
          storagePath: `capsules/${CAPSULE_ID}/photo-2.jpg`,
          sortOrder: 1,
        },
      ],
    })
    await expectSuccessResponse(response, message)
  })

  it('returns 400 when more than 10 images are provided', async () => {
    const { response } = await submitUpload(
      createDirectUploadEntries(
        11,
        'IMAGE',
        (index) => `capsules/${CAPSULE_ID}/photo-${index}.jpg`
      )
    )

    await expectErrorResponse(
      response,
      400,
      'Envie no m\u00e1ximo 10 imagens por mensagem.'
    )
    expect(prismaMocks.messageCreate).not.toHaveBeenCalled()
  })

  it('returns 400 when a direct upload mixes images and video', async () => {
    const { response } = await submitUpload(
      createUploadEntries({
        assets: [
          {
            storagePath: `capsules/${CAPSULE_ID}/photo.jpg`,
            mediaType: 'IMAGE',
            sortOrder: 0,
          },
          {
            storagePath: `capsules/${CAPSULE_ID}/video.mp4`,
            mediaType: 'VIDEO',
            sortOrder: 1,
          },
        ],
      })
    )

    await expectErrorResponse(
      response,
      400,
      'N\u00e3o \u00e9 poss\u00edvel misturar imagens e v\u00eddeos na mesma mensagem.'
    )
    expect(prismaMocks.messageCreate).not.toHaveBeenCalled()
  })

  it('returns 400 when more than one video is provided', async () => {
    const { response } = await submitUpload(
      createUploadEntries({
        assets: [
          {
            storagePath: `capsules/${CAPSULE_ID}/video-1.mp4`,
            mediaType: 'VIDEO',
            sortOrder: 0,
          },
          {
            storagePath: `capsules/${CAPSULE_ID}/video-2.mp4`,
            mediaType: 'VIDEO',
            sortOrder: 1,
          },
        ],
      })
    )

    await expectErrorResponse(
      response,
      400,
      'Envie apenas 1 v\u00eddeo por mensagem.'
    )
    expect(prismaMocks.messageCreate).not.toHaveBeenCalled()
  })

  it('returns 400 when media metadata is malformed', async () => {
    const { response } = await submitUpload(
      createUploadEntries({
        assets: [
          {
            storagePath: `capsules/${CAPSULE_ID}/photo.jpg`,
            mediaType: 'IMAGE',
            sortOrder: 'not-a-number',
          },
        ],
      })
    )

    await expectErrorResponse(
      response,
      400,
      'Dados de m\u00eddia inv\u00e1lidos.'
    )
    expect(prismaMocks.messageCreate).not.toHaveBeenCalled()
  })

  it('returns 500 when an unexpected error happens during persistence', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    prismaMocks.messageCreate.mockRejectedValue(new Error('database offline'))

    const { response } = await submitUpload(
      createUploadEntries({
        assets: [
          {
            storagePath: `capsules/${CAPSULE_ID}/photo.jpg`,
            mediaType: 'IMAGE',
            sortOrder: 0,
          },
        ],
      })
    )

    await expectErrorResponse(
      response,
      500,
      'Ocorreu um erro ao enviar sua mensagem. Tente novamente.'
    )
    expect(consoleError).toHaveBeenCalledWith(
      'Upload error:',
      expect.any(Error)
    )

    consoleError.mockRestore()
  })
})
