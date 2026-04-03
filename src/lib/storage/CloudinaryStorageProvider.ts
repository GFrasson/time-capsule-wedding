import { v2 as cloudinary } from 'cloudinary';
import { IStorageProvider, UploadResult } from './IStorageProvider';

interface CloudinaryUploadResult {
  resource_type: string;
  secure_url: string;
}

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class CloudinaryStorageProvider implements IStorageProvider {
  async upload(buffer: Buffer, originalFilename: string, mimeType: string): Promise<UploadResult> {
    void originalFilename;
    void mimeType;

    const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'wedding_capsule',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(new Error('Cloudinary upload returned no result'));
            return;
          }

          resolve(result);
        }
      );
      stream.end(buffer);
    });

    const isVideo = uploadResult.resource_type === 'video';

    return {
      storagePath: uploadResult.secure_url,
      mediaType: isVideo ? 'VIDEO' : 'IMAGE',
    };
  }

  async getDownloadUrl(storagePath: string): Promise<string> {
    return storagePath;
  }
}
