export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
export const MAX_IMAGE_FILES_PER_MESSAGE = 10
export const MAX_VIDEO_FILES_PER_MESSAGE = 1

export type MessageMediaType = 'IMAGE' | 'VIDEO'

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

export function getMessageMediaType(value: string): MessageMediaType | null {
  if (value === 'IMAGE' || ACCEPTED_IMAGE_TYPES.includes(value)) {
    return 'IMAGE'
  }

  if (value === 'VIDEO' || ACCEPTED_VIDEO_TYPES.includes(value)) {
    return 'VIDEO'
  }

  return null
}

export function getMediaValidationError(mimeType: string, size?: number) {
  if (typeof size === 'number' && !isAcceptedFileSize(size)) {
    return 'O arquivo deve ter no maximo 50MB.'
  }

  if (!getMessageMediaType(mimeType)) {
    return 'Apenas imagens e videos suportados sao permitidos.'
  }

  return null
}

export function getMediaBatchValidationError(mediaValues: string[]) {
  if (mediaValues.length === 0) {
    return 'Selecione ao menos uma foto ou vídeo para enviar.'
  }

  const mediaTypes = mediaValues.map(getMessageMediaType)

  if (mediaTypes.some((mediaType) => mediaType === null)) {
    return 'Apenas imagens e vídeos suportados são permitidos.'
  }

  const hasImages = mediaTypes.includes('IMAGE')
  const hasVideos = mediaTypes.includes('VIDEO')

  if (hasImages && hasVideos) {
    return 'Não é possível misturar imagens e vídeos na mesma mensagem.'
  }

  if (hasVideos && mediaTypes.length > MAX_VIDEO_FILES_PER_MESSAGE) {
    return 'Envie apenas 1 vídeo por mensagem.'
  }

  if (hasImages && mediaTypes.length > MAX_IMAGE_FILES_PER_MESSAGE) {
    return 'Envie no máximo 10 imagens por mensagem.'
  }

  return null
}
