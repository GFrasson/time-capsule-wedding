import { IStorageProvider } from './IStorageProvider';
import { CloudinaryStorageProvider } from './CloudinaryStorageProvider';
import { BackblazeStorageProvider } from './BackblazeStorageProvider';

export const storageProvider: IStorageProvider = process.env.STORAGE_PROVIDER === 'cloudinary'
  ? new CloudinaryStorageProvider()
  : new BackblazeStorageProvider();
