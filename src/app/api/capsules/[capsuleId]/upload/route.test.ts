import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from './route'

type UploadRouteRequest = {
  cookies: {
    get: (name: string) => { value: string } | undefined
  }
  formData: () => Promise<FormData>
}

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
  entries: Array<[string, string | File]>,
  cookieValue?: string
): UploadRouteRequest {
  const formData = new FormData()

  for (const [key, value] of entries) {
    formData.set(key, value)
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
    })
    storageMocks.upload.mockResolvedValue({
      storagePath: 'capsules/capsule-123/photo.jpg',
      mediaType: 'IMAGE',
    })
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
      error: 'Selecione uma foto ou vídeo para enviar.',
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
      mediaUrl: 'capsules/capsule-123/video.mp4',
      type: 'VIDEO',
    })

    const request = createRequest(
      [
        ['mediaPath', 'capsules/capsule-123/video.mp4'],
        ['mediaType', 'VIDEO'],
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
        mediaUrl: 'capsules/capsule-123/video.mp4',
        type: 'VIDEO',
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
        mediaUrl: 'capsules/capsule-123/video.mp4',
        type: 'VIDEO',
        capsuleId: 'capsule-123',
      },
    })
  })

  it('returns 400 when the uploaded file fails media validation', async () => {
    const file = new File(['document'], 'notes.pdf', {
      type: 'application/pdf',
    })
    const request = createRequest([['file', file]])

    const response = await POST(
      request as unknown as Parameters<typeof POST>[0],
      { params: createParams() }
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Apenas imagens e vídeos suportados são permitidos.',
    })
    expect(storageMocks.upload).not.toHaveBeenCalled()
    expect(prismaMocks.messageCreate).not.toHaveBeenCalled()
  })

  it('uploads the file to storage and creates the message record', async () => {
    prismaMocks.messageCreate.mockResolvedValue({
      id: 'message-3',
      capsuleId: 'capsule-123',
      mediaUrl: 'capsules/capsule-123/photo.jpg',
      type: 'IMAGE',
    })

    const file = new File(['image-bytes'], 'photo.jpg', {
      type: 'image/jpeg',
    })
    Object.defineProperty(file, 'arrayBuffer', {
      value: vi
        .fn()
        .mockResolvedValue(new TextEncoder().encode('image-bytes').buffer),
    })
    const request = createRequest([
      ['file', file],
      ['sender', 'Bob'],
      ['content', 'Te amo'],
    ])

    const response = await POST(
      request as unknown as Parameters<typeof POST>[0],
      { params: createParams() }
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      success: true,
      message: {
        id: 'message-3',
        capsuleId: 'capsule-123',
        mediaUrl: 'capsules/capsule-123/photo.jpg',
        type: 'IMAGE',
      },
    })
    expect(storageMocks.upload).toHaveBeenCalledWith(
      expect.any(Buffer),
      'photo.jpg',
      'image/jpeg'
    )
    expect(prismaMocks.messageCreate).toHaveBeenCalledWith({
      data: {
        sender: 'Bob',
        content: 'Te amo',
        title: null,
        mediaUrl: 'capsules/capsule-123/photo.jpg',
        type: 'IMAGE',
        capsuleId: 'capsule-123',
      },
    })
  })

  it('returns 500 when an unexpected error happens during persistence', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    prismaMocks.messageCreate.mockRejectedValue(new Error('database offline'))

    const request = createRequest([
      ['mediaPath', 'capsules/capsule-123/photo.jpg'],
      ['mediaType', 'IMAGE'],
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
