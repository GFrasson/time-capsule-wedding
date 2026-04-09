export interface UploadResult {
  storagePath: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'TEXT';
}

export interface PresignedUploadTarget {
  uploadUrl: string;
  storagePath: string;
  mediaType: 'IMAGE' | 'VIDEO';
}

export interface IStorageProvider {
  /**
   * Uploads a file buffer to the storage provider
   * @param buffer The file buffer
   * @param originalFilename The original name of the file
   * @param mimeType The MIME type of the file
   * @returns An object containing the persisted media reference and the classified media type
   */
  upload(buffer: Buffer, originalFilename: string, mimeType: string): Promise<UploadResult>;

  /**
   * Creates a direct-to-storage upload target when supported by the provider
   * @param originalFilename The original name of the file
   * @param mimeType The MIME type of the file
   * @returns A signed upload URL and the storage reference to persist, or null when unsupported
   */
  createPresignedUpload?(originalFilename: string, mimeType: string): Promise<PresignedUploadTarget | null>;

  /**
   * Resolves a persisted media reference into a URL the app can render/download
   * @param storagePath The persisted media reference
   * @param expiresInSeconds Signed URL lifetime in seconds when supported
   */
  getDownloadUrl(storagePath: string, expiresInSeconds?: number): Promise<string>;
}
