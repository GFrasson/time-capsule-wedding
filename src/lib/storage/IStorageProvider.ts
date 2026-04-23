export interface PresignedUploadTarget {
  uploadUrl: string
  storagePath: string
  mediaType: 'IMAGE' | 'VIDEO'
}

export interface IStorageProvider {
  /**
   * Creates a direct-to-storage upload target for every media upload.
   * The app now assumes uploads happen client-side through this signed URL.
   */
  createPresignedUpload(
    originalFilename: string,
    mimeType: string
  ): Promise<PresignedUploadTarget>

  /**
   * Resolves a persisted media reference into a URL the app can render/download
   * @param storagePath The persisted media reference
   * @param expiresInSeconds Signed URL lifetime in seconds when supported
   */
  getDownloadUrl(storagePath: string, expiresInSeconds?: number): Promise<string>
}
