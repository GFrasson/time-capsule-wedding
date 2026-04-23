import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from './route'

type UploadRouteRequest = {
  cookies: {
    get: (name: string) => { value: string } | undefined
  }
  formData: () => Promise<FormData>
}

type RequestEntry = [string, string | File]

const prismaMocks = vi.hoisted(() => ({
  messageCreate: vi.fn(),
}))

const storageMocks = vi.hoisted(() => ({
  upload: vi.fn(),
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

vi.mock('@/lib/storage', () => ({
  storageProvider: {
    upload: storageMocks.upload,
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
  return Promise.resolve({ capsuleId: 'capsule-123' })
}

function createFile(name: string, type: string, contents = name) {
  const file = new File([contents], name, { type })

  Object.defineProperty(file, 'arrayBuffer', {
    value: vi
      .fn()
      .mockResolvedValue(new TextEncoder().encode(contents).buffer),
  })

  return file
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

describe('POST /api/capsules/[capsuleId]/upload', () => {
  beforeEach(() => {
    prismaMocks.messageCreate.mockReset()
    storageMocks.upload.mockReset()
    accessMocks.getCapsuleAccessConfig.mockReset()
    accessMocks.hasValidAccessCookie.mockReset()

    accessMocks.getCapsuleAccessConfig.mockReturnValue(null)
    accessMocks.hasValidAccessCookie.mockResolvedValue(false)
    prismaMocks.messageCreate.mockResolvedValue({
      id: 'message-1',
      capsuleId: 'capsule-123',
      type: 'IMAGE',
      assets: [],
    })
    storageMocks.upload.mockImplementation(
      async (_buffer: Buffer, originalFilename: string, mimeType: string) => ({
        storagePath: `capsules/capsule-123/${originalFilename}`,
        mediaType: mimeType.startsWith('video/') ? 'VIDEO' : 'IMAGE',
      })
    )
  })

  it('returns 403 when the capsule is protected and the access cookie is invalid', async () => {
    accessMocks.getCapsuleAccessConfig.mockReturnValue({
      inviteToken: 'invite-token',
      cookieSecret: 'cookie-secret',
    })
    accessMocks.hasValidAccessCookie.mockResolvedValue(false)

    const request = createRequest([])

    const response = await POST(
      request as unknown as Parameters<typeof POST>[0],
      { params: createParams() }
    )

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({
      error: 'Access denied',
    })
    expect(accessMocks.hasValidAccessCookie).toHaveBeenCalledWith(
      undefined,
      'cookie-secret'
    )
    expect(request.formData).not.toHaveBeenCalled()
    expect(prismaMocks.messageCreate).not.toHaveBeenCalled()
  })

  it('returns 400 when neither a direct upload nor a file upload is provided', async () => {
    const request = createRequest([
      ['sender', 'Alice'],
      ['content', 'Parabens!'],
      ['title', 'Memoria'],
    ])

    const response = await POST(
      request as unknown as Parameters<typeof POST>[0],
      { params: createParams() }
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Selecione ao menos uma foto ou vídeo para enviar.',
    })
    expect(storageMocks.upload).not.toHaveBeenCalled()
    expect(prismaMocks.messageCreate).not.toHaveBeenCalled()
  })

  it('persists a direct upload when the access cookie is valid', async () => {
    accessMocks.getCapsuleAccessConfig.mockReturnValue({
      inviteToken: 'invite-token',
      cookieSecret: 'cookie-secret',
    })
    accessMocks.hasValidAccessCookie.mockResolvedValue(true)
    prismaMocks.messageCreate.mockResolvedValue({
      id: 'message-2',
      capsuleId: 'capsule-123',
      type: 'VIDEO',
      assets: [
        {
          id: 'asset-1',
          storagePath: 'capsules/capsule-123/video.mp4',
          sortOrder: 0,
        },
      ],
    })

    const request = createRequest(
      [
        ['mediaPath', 'capsules/capsule-123/video.mp4'],
        ['mediaType', 'VIDEO'],
        ['mediaOrder', '0'],
        ['sender', 'Alice'],
        ['content', 'Uma lembranca especial'],
        ['title', 'Nosso video'],
      ],
      'signed-cookie'
    )

    const response = await POST(
      request as unknown as Parameters<typeof POST>[0],
      { params: createParams() }
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      success: true,
      message: {
        id: 'message-2',
        capsuleId: 'capsule-123',
        type: 'VIDEO',
        assets: [
          {
            id: 'asset-1',
            storagePath: 'capsules/capsule-123/video.mp4',
            sortOrder: 0,
          },
        ],
      },
    })
    expect(accessMocks.hasValidAccessCookie).toHaveBeenCalledWith(
      'signed-cookie',
      'cookie-secret'
    )
    expect(storageMocks.upload).not.toHaveBeenCalled()
    expect(prismaMocks.messageCreate).toHaveBeenCalledWith({
      data: {
        sender: 'Alice',
        content: 'Uma lembranca especial',
        title: 'Nosso video',
        type: 'VIDEO',
        capsuleId: 'capsule-123',
        assets: {
          create: [
            {
              storagePath: 'capsules/capsule-123/video.mp4',
              sortOrder: 0,
            },
          ],
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
  })

  it('persists multiple direct upload images in the same message', async () => {
    prismaMocks.messageCreate.mockResolvedValue({
      id: 'message-3',
      capsuleId: 'capsule-123',
      type: 'IMAGE',
      assets: [
        {
          id: 'asset-1',
          storagePath: 'capsules/capsule-123/photo-1.jpg',
          sortOrder: 0,
        },
        {
          id: 'asset-2',
          storagePath: 'capsules/capsule-123/photo-2.jpg',
          sortOrder: 1,
        },
      ],
    })

    const request = createRequest([
      ['mediaPath', 'capsules/capsule-123/photo-1.jpg'],
      ['mediaType', 'IMAGE'],
      ['mediaOrder', '0'],
      ['mediaPath', 'capsules/capsule-123/photo-2.jpg'],
      ['mediaType', 'IMAGE'],
      ['mediaOrder', '1'],
      ['sender', 'Carol'],
      ['content', 'Duas lembrancas em uma mensagem'],
    ])

    const response = await POST(
      request as unknown as Parameters<typeof POST>[0],
      { params: createParams() }
    )

    expect(response.status).toBe(200)
    expect(storageMocks.upload).not.toHaveBeenCalled()
    expect(prismaMocks.messageCreate).toHaveBeenCalledWith({
      data: {
        sender: 'Carol',
        content: 'Duas lembrancas em uma mensagem',
        title: null,
        type: 'IMAGE',
        capsuleId: 'capsule-123',
        assets: {
          create: [
            {
              storagePath: 'capsules/capsule-123/photo-1.jpg',
              sortOrder: 0,
            },
            {
              storagePath: 'capsules/capsule-123/photo-2.jpg',
              sortOrder: 1,
            },
          ],
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
    await expect(response.json()).resolves.toEqual({
      success: true,
      message: {
        id: 'message-3',
        capsuleId: 'capsule-123',
        type: 'IMAGE',
        assets: [
          {
            id: 'asset-1',
            storagePath: 'capsules/capsule-123/photo-1.jpg',
            sortOrder: 0,
          },
          {
            id: 'asset-2',
            storagePath: 'capsules/capsule-123/photo-2.jpg',
            sortOrder: 1,
          },
        ],
      },
    })
  })

  it('returns 400 when more than 10 images are provided', async () => {
    const request = createRequest(
      createDirectUploadEntries(
        11,
        'IMAGE',
        (index) => `capsules/capsule-123/photo-${index}.jpg`
      )
    )

    const response = await POST(
      request as unknown as Parameters<typeof POST>[0],
      { params: createParams() }
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Envie no máximo 10 imagens por mensagem.',
    })
    expect(storageMocks.upload).not.toHaveBeenCalled()
    expect(prismaMocks.messageCreate).not.toHaveBeenCalled()
  })

  it('returns 400 when a direct upload mixes images and video', async () => {
    const request = createRequest([
      ['mediaPath', 'capsules/capsule-123/photo.jpg'],
      ['mediaType', 'IMAGE'],
      ['mediaOrder', '0'],
      ['mediaPath', 'capsules/capsule-123/video.mp4'],
      ['mediaType', 'VIDEO'],
      ['mediaOrder', '1'],
    ])

    const response = await POST(
      request as unknown as Parameters<typeof POST>[0],
      { params: createParams() }
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Não é possível misturar imagens e vídeos na mesma mensagem.',
    })
    expect(storageMocks.upload).not.toHaveBeenCalled()
    expect(prismaMocks.messageCreate).not.toHaveBeenCalled()
  })

  it('returns 400 when more than one video is provided', async () => {
    const request = createRequest([
      ['mediaPath', 'capsules/capsule-123/video-1.mp4'],
      ['mediaType', 'VIDEO'],
      ['mediaOrder', '0'],
      ['mediaPath', 'capsules/capsule-123/video-2.mp4'],
      ['mediaType', 'VIDEO'],
      ['mediaOrder', '1'],
    ])

    const response = await POST(
      request as unknown as Parameters<typeof POST>[0],
      { params: createParams() }
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Envie apenas 1 vídeo por mensagem.',
    })
    expect(storageMocks.upload).not.toHaveBeenCalled()
    expect(prismaMocks.messageCreate).not.toHaveBeenCalled()
  })

  it('uploads multiple files to storage and creates a single message record', async () => {
    prismaMocks.messageCreate.mockResolvedValue({
      id: 'message-4',
      capsuleId: 'capsule-123',
      type: 'IMAGE',
      assets: [
        {
          id: 'asset-1',
          storagePath: 'capsules/capsule-123/photo-1.jpg',
          sortOrder: 0,
        },
        {
          id: 'asset-2',
          storagePath: 'capsules/capsule-123/photo-2.jpg',
          sortOrder: 1,
        },
      ],
    })

    const request = createRequest([
      ['file', createFile('photo-1.jpg', 'image/jpeg', 'image-1')],
      ['fileOrder', '0'],
      ['file', createFile('photo-2.jpg', 'image/jpeg', 'image-2')],
      ['fileOrder', '1'],
      ['sender', 'Bob'],
      ['content', 'Te amo'],
    ])

    const response = await POST(
      request as unknown as Parameters<typeof POST>[0],
      { params: createParams() }
    )

    expect(response.status).toBe(200)
    expect(storageMocks.upload).toHaveBeenCalledTimes(2)
    expect(storageMocks.upload.mock.calls).toEqual(
      expect.arrayContaining([
        [expect.any(Buffer), 'photo-1.jpg', 'image/jpeg'],
        [expect.any(Buffer), 'photo-2.jpg', 'image/jpeg'],
      ])
    )
    expect(prismaMocks.messageCreate).toHaveBeenCalledWith({
      data: {
        sender: 'Bob',
        content: 'Te amo',
        title: null,
        type: 'IMAGE',
        capsuleId: 'capsule-123',
        assets: {
          create: [
            {
              storagePath: 'capsules/capsule-123/photo-1.jpg',
              sortOrder: 0,
            },
            {
              storagePath: 'capsules/capsule-123/photo-2.jpg',
              sortOrder: 1,
            },
          ],
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
    await expect(response.json()).resolves.toEqual({
      success: true,
      message: {
        id: 'message-4',
        capsuleId: 'capsule-123',
        type: 'IMAGE',
        assets: [
          {
            id: 'asset-1',
            storagePath: 'capsules/capsule-123/photo-1.jpg',
            sortOrder: 0,
          },
          {
            id: 'asset-2',
            storagePath: 'capsules/capsule-123/photo-2.jpg',
            sortOrder: 1,
          },
        ],
      },
    })
  })

  it('returns 500 when an unexpected error happens during persistence', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    prismaMocks.messageCreate.mockRejectedValue(new Error('database offline'))

    const request = createRequest([
      ['mediaPath', 'capsules/capsule-123/photo.jpg'],
      ['mediaType', 'IMAGE'],
      ['mediaOrder', '0'],
    ])

    const response = await POST(
      request as unknown as Parameters<typeof POST>[0],
      { params: createParams() }
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Ocorreu um erro ao enviar sua mensagem. Tente novamente.',
    })
    expect(consoleError).toHaveBeenCalledWith(
      'Upload error:',
      expect.any(Error)
    )

    consoleError.mockRestore()
  })
})
