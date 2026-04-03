import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

function toRemotePattern(urlString: string | undefined) {
  if (!urlString) {
    return null;
  }

  try {
    const url = new URL(urlString);

    return {
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
      hostname: url.hostname,
    } satisfies RemotePattern;
  } catch {
    return null;
  }
}

const backblazeEndpointPattern = toRemotePattern(process.env.BACKBLAZE_ENDPOINT);
const backblazePublicPattern = toRemotePattern(process.env.BACKBLAZE_PUBLIC_ENDPOINT);
const remotePatterns: RemotePattern[] = [
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
  },
  {
    protocol: 'https',
    hostname: 'res.cloudinary.com',
  },
];

if (backblazeEndpointPattern) {
  remotePatterns.push(backblazeEndpointPattern);
}

if (backblazePublicPattern) {
  remotePatterns.push(backblazePublicPattern);
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
