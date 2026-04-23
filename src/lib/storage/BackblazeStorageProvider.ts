import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { IStorageProvider, PresignedUploadTarget } from './IStorageProvider'
import crypto from 'crypto'

export class BackblazeStorageProvider implements IStorageProvider {
  private s3: S3Client
  private bucketName = process.env.BACKBLAZE_BUCKET_NAME ?? ''
  private bucketFolder = process.env.BACKBLAZE_BUCKET_FOLDER ?? 'wedding_capsule'
  private signedUrlExpiresInSeconds = Number(
    process.env.BACKBLAZE_SIGNED_URL_EXPIRES_IN_SECONDS ?? '300'
  )
  private objectCacheControl = 'public, max-age=31536000, immutable'

  constructor() {
    this.s3 = new S3Client({
      endpoint: process.env.BACKBLAZE_ENDPOINT ?? '',
      region: process.env.BACKBLAZE_REGION ?? 'us-west-000',
      credentials: {
        accessKeyId: process.env.BACKBLAZE_KEY_ID ?? '',
        secretAccessKey: process.env.BACKBLAZE_APPLICATION_KEY ?? '',
      },
    })
  }

  private buildStoragePath(originalFilename: string) {
    const extension = originalFilename.split('.').pop()
    const uniqueName = crypto.randomUUID() + (extension ? `.${extension}` : '')

    return `${this.bucketFolder}/${uniqueName}`
  }

  private resolveMediaType(mimeType: string): 'IMAGE' | 'VIDEO' {
    return mimeType.startsWith('video/') ? 'VIDEO' : 'IMAGE'
  }

  async createPresignedUpload(
    originalFilename: string,
    mimeType: string
  ): Promise<PresignedUploadTarget> {
    const key = this.buildStoragePath(originalFilename)
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: mimeType,
      CacheControl: this.objectCacheControl,
    })

    const uploadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: this.signedUrlExpiresInSeconds,
    })

    return {
      uploadUrl,
      storagePath: key,
      mediaType: this.resolveMediaType(mimeType),
    }
  }

  async getDownloadUrl(storagePath: string, expiresInSeconds?: number): Promise<string> {
    if (!storagePath) {
      return ''
    }

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: storagePath,
    })

    return getSignedUrl(this.s3, command, {
      expiresIn: expiresInSeconds ?? this.signedUrlExpiresInSeconds,
    })
  }
}
