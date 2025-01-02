'use client'

import { memo, useState } from 'react'
import Image from 'next/image'
import { Box, Skeleton } from '@chakra-ui/react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  quality?: number
  priority?: boolean
  sizes?: string
  className?: string
}

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  width,
  height,
  quality = 75,
  priority = false,
  sizes = '100vw',
  className,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setError(true)
  }

  return (
    <Box position="relative" className={className}>
      <Skeleton isLoaded={!isLoading}>
        <Image
          src={error ? '/images/fallback.jpg' : src}
          alt={alt}
          width={width}
          height={height}
          quality={quality}
          priority={priority}
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          style={{
            objectFit: 'cover',
            width: '100%',
            height: 'auto',
          }}
        />
      </Skeleton>
    </Box>
  )
}) 