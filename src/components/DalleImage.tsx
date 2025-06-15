'use client';

import Image from 'next/image';
import { useState } from 'react';

interface DalleImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  onError?: () => void;
  fallbackSrc?: string;
}

export default function DalleImage({
  src,
  alt,
  fill = false,
  className = '',
  priority = false,
  quality = 75,
  sizes,
  onError,
  fallbackSrc = '/mainfoodimage.jpg'
}: DalleImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      console.log('Image failed to load, using fallback:', src);
      setImageSrc(fallbackSrc);
      setHasError(true);
      if (onError) onError();
    }
  };

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill={fill}
      className={className}
      priority={priority}
      quality={quality}
      sizes={sizes}
      onError={handleError}
      onLoad={() => {
        if (hasError) {
          console.log('Fallback image loaded successfully');
        } else {
          console.log('Original image loaded successfully:', src);
        }
      }}
      // Add unoptimized for external images that might fail
      unoptimized={imageSrc.includes('blob.core.windows.net')}
    />
  );
} 