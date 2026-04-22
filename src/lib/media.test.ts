import { describe, expect, it } from 'vitest'

import { getMediaAssetUrl } from './media'

describe('getMediaAssetUrl', () => {
  it('returns an empty string when there is no storage path', () => {
    expect(getMediaAssetUrl('')).toBe('')
  })

  it('builds the API url with an encoded path query parameter', () => {
    expect(getMediaAssetUrl('capsules/our photo.png')).toBe(
      '/api/media?path=capsules%2Four+photo.png'
    )
  })
})
