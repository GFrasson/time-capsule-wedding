export interface MediaAssetReference {
  storagePath: string
  thumbnailPath?: string | null
}

export function getMediaAssetUrl(storagePath: string) {
  if (!storagePath) {
    return '';
  }

  const params = new URLSearchParams({
    path: storagePath,
  });

  return `/api/media?${params.toString()}`;
}

export function getDisplayMediaAssetUrl(asset: MediaAssetReference) {
  return getMediaAssetUrl(asset.thumbnailPath || asset.storagePath)
}
