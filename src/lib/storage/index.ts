import { IStorageProvider } from './IStorageProvider';
import { BackblazeStorageProvider } from './BackblazeStorageProvider';

export const storageProvider: IStorageProvider = new BackblazeStorageProvider();
