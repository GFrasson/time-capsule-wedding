import { NextRequest, NextResponse } from 'next/server';
import { storageProvider } from '@/lib/storage';

const backblazeSignedUrlExpiresInSeconds = Number(
  process.env.BACKBLAZE_SIGNED_URL_EXPIRES_IN_SECONDS ?? '300'
);

function getRouteCacheControl() {
  if (process.env.STORAGE_PROVIDER === 'cloudinary') {
    return 'public, max-age=86400, stale-while-revalidate=604800';
  }

  const maxAge = Math.max(0, backblazeSignedUrlExpiresInSeconds - 30);

  return `private, max-age=${maxAge}, stale-while-revalidate=30`;
}

export async function GET(request: NextRequest) {
  const storagePath = request.nextUrl.searchParams.get('path');

  if (!storagePath) {
    return NextResponse.json(
      { error: 'Caminho da mídia não informado.' },
      { status: 400 }
    );
  }

  const downloadUrl = await storageProvider.getDownloadUrl(storagePath);

  return NextResponse.redirect(downloadUrl, {
    headers: {
      'Cache-Control': getRouteCacheControl(),
    },
  });
}
