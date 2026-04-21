export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]

export const ACCEPTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-m4v',
]

const ACCEPTED_MEDIA_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES]

export function isAcceptedMediaType(mimeType: string) {
  return ACCEPTED_MEDIA_TYPES.includes(mimeType)
}

export function isAcceptedFileSize(size: number) {
  return size <= MAX_FILE_SIZE
}

export function getMediaValidationError(mimeType: string, size?: number) {
  if (typeof size === 'number' && !isAcceptedFileSize(size)) {
    return 'O arquivo deve ter no maximo 50MB.'
  }

  if (!isAcceptedMediaType(mimeType)) {
    return 'Apenas imagens e vídeos suportados são permitidos.'
  }

  return null
}
