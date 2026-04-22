import { describe, expect, it } from 'vitest'

import {
  MAX_FILE_SIZE,
  getMediaValidationError,
  isAcceptedFileSize,
  isAcceptedMediaType,
} from './upload-validation'

describe('upload-validation', () => {
  it('accepts supported image and video mime types', () => {
    expect(isAcceptedMediaType('image/jpeg')).toBe(true)
    expect(isAcceptedMediaType('video/mp4')).toBe(true)
  })

  it('rejects unsupported mime types', () => {
    expect(isAcceptedMediaType('application/pdf')).toBe(false)
  })

  it('accepts files up to the maximum size limit', () => {
    expect(isAcceptedFileSize(MAX_FILE_SIZE)).toBe(true)
    expect(isAcceptedFileSize(MAX_FILE_SIZE + 1)).toBe(false)
  })

  it('returns the file size error before the mime type error', () => {
    const error = getMediaValidationError('application/pdf', MAX_FILE_SIZE + 1)

    expect(error).toMatch(/50MB/)
  })

  it('returns a mime type error for unsupported files within the size limit', () => {
    const error = getMediaValidationError('application/pdf', MAX_FILE_SIZE)

    expect(error).toMatch(/permitidos/)
  })

  it('returns null for valid media files', () => {
    expect(getMediaValidationError('image/png', MAX_FILE_SIZE)).toBeNull()
  })
})
