import { beforeEach, describe, expect, it, vi } from 'vitest'

const storageMocks = vi.hoisted(() => ({
  createPresignedUpload: vi.fn(),
}))

vi.mock('@/lib/storage', () => ({
  storageProvider: {
    createPresignedUpload: storageMocks.createPresignedUpload,
  },
}))

import { POST } from './route'

describe('POST /api/capsules/[capsuleId]/upload/init', () => {
  beforeEach(() => {
    storageMocks.createPresignedUpload.mockReset()
  })

  it('returns 400 when originalFilename or mimeType is missing', async () => {
    const request = new Request('http://localhost/api/capsules/test/upload/init', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        originalFilename: 'photo.jpg',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'originalFilename and mimeType are required',
    })
    expect(storageMocks.createPresignedUpload).not.toHaveBeenCalled()
  })

  it('returns 400 when the upload metadata fails validation', async () => {
    const request = new Request('http://localhost/api/capsules/test/upload/init', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        originalFilename: 'photo.jpg',
        mimeType: 'image/jpeg',
        fileSize: 50 * 1024 * 1024 + 1,
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'O arquivo deve ter no maximo 50MB.',
    })
    expect(storageMocks.createPresignedUpload).not.toHaveBeenCalled()
  })

  it('returns the presigned upload target when direct upload is available', async () => {
    storageMocks.createPresignedUpload.mockResolvedValue({
      uploadUrl: 'https://storage.example/upload',
      storagePath: 'capsules/test/photo.jpg',
      mediaType: 'IMAGE',
    })

    const request = new Request('http://localhost/api/capsules/test/upload/init', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        originalFilename: 'photo.jpg',
        mimeType: 'image/jpeg',
        fileSize: 1024,
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      directUpload: true,
      uploadUrl: 'https://storage.example/upload',
      storagePath: 'capsules/test/photo.jpg',
      mediaType: 'IMAGE',
    })
  })

  it('returns 500 when creating the upload target throws', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    storageMocks.createPresignedUpload.mockRejectedValue(new Error('storage offline'))

    const request = new Request('http://localhost/api/capsules/test/upload/init', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        originalFilename: 'photo.jpg',
        mimeType: 'image/jpeg',
        fileSize: 1024,
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Internal Server Error',
    })
    expect(consoleError).toHaveBeenCalledWith(
      'Upload init error:',
      expect.any(Error)
    )

    consoleError.mockRestore()
  })
})
