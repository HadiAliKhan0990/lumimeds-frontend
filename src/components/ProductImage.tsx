'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useWindowWidth } from '@/hooks/useWindowWidth';
import AsyncImgLoader from '@/components/AsyncImgLoader';

interface Props {
  image: string;
  className?: string;
  alt?: string;
  centered?: boolean;
  imageClassName?: string;
}

export function ProductImage({ image, className, alt = 'Product Preview', centered = true, imageClassName = '' }: Readonly<Props>) {
  const { windowWidth } = useWindowWidth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleImageError = () => {
    setError(true);
  };

  if (!image || error) {
    return (
      <div
        className={`${className} placeholder-glow overflow-hidden ${windowWidth > 768 && centered ? 'mx-auto' : ''}`}
      >
        <div className='placeholder w-100 h-100' />
      </div>
    );
  }

  return (
    <div className={`${className} tw-relative tw-overflow-hidden ${windowWidth > 768 && centered ? 'mx-auto' : ''}`}>
      {isLoading && <AsyncImgLoader />}
      <Image
        src={image}
        alt={alt}
        fill
        className={`tw-object-contain ${imageClassName}`}
        onError={handleImageError}
        onLoad={() => setIsLoading(false)}
        style={{
          opacity: isLoading ? 0.5 : 1,
          visibility: isLoading ? 'hidden' : 'visible',
        }}
      />
    </div>
  );
}
