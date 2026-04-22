import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const storageMocks = vi.hoisted(() => ({
  getDownloadUrl: vi.fn(),
}))

vi.mock('@/lib/storage', () => ({
  storageProvider: {
    getDownloadUrl: storageMocks.getDownloadUrl,
  },
}))

import { GET } from './route'

function createRequest(url: string, headers?: HeadersInit) {
  return {
    nextUrl: new URL(url),
    headers: new Headers(headers),
  } as NextRequest
}

describe('GET /api/media', () => {
  const originalStorageProvider = process.env.STORAGE_PROVIDER
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    storageMocks.getDownloadUrl.mockReset()
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)

    if (originalStorageProvider === undefined) {
      delete process.env.STORAGE_PROVIDER
    } else {
      process.env.STORAGE_PROVIDER = originalStorageProvider
    }
  })

  it('returns 400 when the media path is missing', async () => {
    const request = createRequest('http://localhost/api/media')

    const response = await GET(request)

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        error: expect.any(String),
      })
    )
    expect(storageMocks.getDownloadUrl).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('redirects to the storage asset when the provider is cloudinary', async () => {
    process.env.STORAGE_PROVIDER = 'cloudinary'
    storageMocks.getDownloadUrl.mockResolvedValue('https://cdn.example/capsules/photo.jpg')

    const request = createRequest('http://localhost/api/media?path=capsules/photo.jpg')

    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('https://cdn.example/capsules/photo.jpg')
    expect(response.headers.get('cache-control')).toBe(
      'public, max-age=86400, stale-while-revalidate=604800'
    )
    expect(response.headers.get('cdn-cache-control')).toBeNull()
    expect(storageMocks.getDownloadUrl).toHaveBeenCalledWith('capsules/photo.jpg')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('proxies partial upstream responses for non-cloudinary providers', async () => {
    process.env.STORAGE_PROVIDER = 'backblaze'
    storageMocks.getDownloadUrl.mockResolvedValue('https://storage.example/capsules/video.mp4')
    fetchMock.mockResolvedValue(
      new Response('partial-media', {
        status: 206,
        headers: {
          'accept-ranges': 'bytes',
          'content-length': '12',
          'content-range': 'bytes 0-11/120',
          'content-type': 'video/mp4',
          etag: '"asset-tag"',
          'last-modified': 'Tue, 22 Apr 2025 10:00:00 GMT',
          'x-extra-header': 'ignored',
        },
      })
    )

    const request = createRequest('http://localhost/api/media?path=capsules/video.mp4', {
      range: 'bytes=0-11',
    })

    const response = await GET(request)

    expect(response.status).toBe(206)
    await expect(response.text()).resolves.toBe('partial-media')
    expect(response.headers.get('cache-control')).toBe(
      'public, max-age=3500, stale-while-revalidate=60'
    )
    expect(response.headers.get('cdn-cache-control')).toBe(
      'public, s-maxage=86400, stale-while-revalidate=604800'
    )
    expect(response.headers.get('vercel-cdn-cache-control')).toBe(
      'public, s-maxage=86400, stale-while-revalidate=604800'
    )
    expect(response.headers.get('content-range')).toBe('bytes 0-11/120')
    expect(response.headers.get('content-type')).toBe('video/mp4')
    expect(response.headers.get('x-extra-header')).toBeNull()
    expect(storageMocks.getDownloadUrl).toHaveBeenCalledWith('capsules/video.mp4')
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [downloadUrl, init] = fetchMock.mock.calls[0]
    expect(downloadUrl).toBe('https://storage.example/capsules/video.mp4')
    expect(init?.cache).toBe('no-store')
    expect(init?.headers).toBeInstanceOf(Headers)
  })

  it('returns the upstream error status when fetching the media asset fails', async () => {
    process.env.STORAGE_PROVIDER = 'backblaze'
    storageMocks.getDownloadUrl.mockResolvedValue('https://storage.example/capsules/photo.jpg')
    fetchMock.mockResolvedValue(
      new Response('not found', {
        status: 404,
      })
    )

    const request = createRequest('http://localhost/api/media?path=capsules/photo.jpg')

    const response = await GET(request)

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to fetch media asset',
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://storage.example/capsules/photo.jpg',
      expect.objectContaining({
        cache: 'no-store',
      })
    )
  })
})
