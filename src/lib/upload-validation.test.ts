import { describe, expect, it } from 'vitest'

import {
  getMediaBatchValidationError,
  getMessageMediaType,
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

  it('classifies supported mime types and persisted message types', () => {
    expect(getMessageMediaType('image/png')).toBe('IMAGE')
    expect(getMessageMediaType('video/mp4')).toBe('VIDEO')
    expect(getMessageMediaType('IMAGE')).toBe('IMAGE')
    expect(getMessageMediaType('VIDEO')).toBe('VIDEO')
  })

  it('rejects more than 10 images in the same message', () => {
    const error = getMediaBatchValidationError(
      Array.from({ length: 11 }, () => 'image/png')
    )

    expect(error).toMatch(/10 imagens/)
  })

  it('rejects more than one video in the same message', () => {
    const error = getMediaBatchValidationError(['video/mp4', 'video/webm'])

    expect(error).toMatch(/1 vídeo/)
  })

  it('rejects mixed image and video selections', () => {
    const error = getMediaBatchValidationError(['image/png', 'video/mp4'])

    expect(error).toMatch(/misturar/)
  })

  it('accepts up to 10 images or one video in the same message', () => {
    expect(
      getMediaBatchValidationError(
        Array.from({ length: 10 }, () => 'image/png')
      )
    ).toBeNull()
    expect(getMediaBatchValidationError(['video/mp4'])).toBeNull()
  })
})
