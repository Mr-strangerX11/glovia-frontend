"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

// CDN hostnames that Next.js should optimize (reliable, always-available)
const OPTIMIZED_HOSTNAMES = [
  'res.cloudinary.com',
  'd2731avvelbbmh.cloudfront.net',
  'da052c6adely1.cloudfront.net',
  'images.unsplash.com',
];

function shouldOptimize(src: ImageProps['src']): boolean {
  if (typeof src !== 'string') return true;
  try {
    const { hostname } = new URL(src);
    return OPTIMIZED_HOSTNAMES.some((h) => hostname === h);
  } catch {
    // relative path — let Next.js handle it
    return true;
  }
}

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
}

export function SafeImage({
  src,
  fallbackSrc = "/placeholder.jpg",
  alt,
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  const activeSrc = failed ? fallbackSrc : imgSrc;

  // Bypass the Next.js optimizer for external URLs that aren't on a trusted CDN.
  // This prevents the server from fetching broken upstream URLs and logging 404 errors.
  // The browser loads the image directly; onError handles failures client-side.
  const unoptimized = props.unoptimized ?? !shouldOptimize(activeSrc);

  return (
    <Image
      {...props}
      src={activeSrc}
      alt={alt}
      unoptimized={unoptimized}
      onError={() => {
        if (!failed) {
          setFailed(true);
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}
