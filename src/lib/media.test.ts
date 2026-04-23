import { describe, expect, it } from 'vitest'
import { getDisplayMediaAssetUrl, getMediaAssetUrl } from './media'

describe('media URL helpers', () => {
  it('returns an empty string when there is no storage path', () => {
    expect(getMediaAssetUrl('')).toBe('')
  })

  it('builds proxied media URLs for storage paths', () => {
    expect(getMediaAssetUrl('capsules/test/photo 1.jpg')).toBe(
      '/api/media?path=capsules%2Ftest%2Fphoto+1.jpg'
    )
  })

  it('prefers thumbnail paths for display URLs', () => {
    expect(
      getDisplayMediaAssetUrl({
        storagePath: 'capsules/test/photo.jpg',
        thumbnailPath: 'capsules/test/photo-thumbnail.jpg',
      })
    ).toBe('/api/media?path=capsules%2Ftest%2Fphoto-thumbnail.jpg')
  })

  it('falls back to the original path when no thumbnail exists', () => {
    expect(
      getDisplayMediaAssetUrl({
        storagePath: 'capsules/test/photo.jpg',
        thumbnailPath: null,
      })
    ).toBe('/api/media?path=capsules%2Ftest%2Fphoto.jpg')
  })

  it('falls back to the original path when the thumbnail path is blank', () => {
    expect(
      getDisplayMediaAssetUrl({
        storagePath: 'capsules/test/photo.jpg',
        thumbnailPath: '',
      })
    ).toBe('/api/media?path=capsules%2Ftest%2Fphoto.jpg')
  })
})
