import { NextRequest, NextResponse } from 'next/server';
import { storageProvider } from '@/lib/storage';

const browserCacheControl = 'public, max-age=3500, stale-while-revalidate=60';
const vercelCdnCacheControl = 'public, s-maxage=86400, stale-while-revalidate=604800';
const proxyResponseHeaders = [
  'accept-ranges',
  'content-length',
  'content-range',
  'content-type',
  'etag',
  'last-modified',
] as const;

function getRouteCacheControl() {
  return process.env.STORAGE_PROVIDER === 'cloudinary'
    ? 'public, max-age=86400, stale-while-revalidate=604800'
    : browserCacheControl;
}

function getRouteHeaders() {
  if (process.env.STORAGE_PROVIDER === 'cloudinary') {
    return new Headers({
      'Cache-Control': getRouteCacheControl(),
    });
  }

  return new Headers({
    'Cache-Control': getRouteCacheControl(),
    'CDN-Cache-Control': vercelCdnCacheControl,
    'Vercel-CDN-Cache-Control': vercelCdnCacheControl,
  });
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

  if (process.env.STORAGE_PROVIDER === 'cloudinary') {
    return NextResponse.redirect(downloadUrl, {
      headers: getRouteHeaders(),
    });
  }

  const upstreamHeaders = new Headers();
  const range = request.headers.get('range');

  if (range) {
    upstreamHeaders.set('range', range);
  }

  const upstreamResponse = await fetch(downloadUrl, {
    headers: upstreamHeaders,
    cache: 'no-store',
  });

  if (!upstreamResponse.ok && upstreamResponse.status !== 206) {
    return NextResponse.json(
      { error: 'Failed to fetch media asset' },
      { status: upstreamResponse.status }
    );
  }

  const responseHeaders = new Headers({
  });
  const routeHeaders = getRouteHeaders();

  routeHeaders.forEach((value, key) => {
    responseHeaders.set(key, value);
  });

  for (const headerName of proxyResponseHeaders) {
    const headerValue = upstreamResponse.headers.get(headerName);

    if (headerValue) {
      responseHeaders.set(headerName, headerValue);
    }
  }

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}
