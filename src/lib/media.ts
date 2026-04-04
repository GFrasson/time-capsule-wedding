export function getMediaAssetUrl(storagePath: string) {
  if (!storagePath) {
    return '';
  }

  const params = new URLSearchParams({
    path: storagePath,
  });

  return `/api/media?${params.toString()}`;
}
