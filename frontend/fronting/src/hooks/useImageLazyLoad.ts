import { useState, useEffect, useCallback } from 'react'

interface UseImageLazyLoadOptions {
  threshold?: number
  rootMargin?: string
  quality?: number
  sizes?: string[]
}

export function useImageLazyLoad(src: string, options: UseImageLazyLoadOptions = {}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [currentSrc, setCurrentSrc] = useState<string>('')

  const {
    threshold = 0.1,
    rootMargin = '50px',
    quality = 75,
    sizes = ['640w', '750w', '828w', '1080w', '1200w', '1920w']
  } = options

  const generateSrcSet = useCallback(() => {
    return sizes
      .map(size => {
        const width = parseInt(size)
        return `${src}?w=${width}&q=${quality} ${size}`
      })
      .join(', ')
  }, [src, quality, sizes])

  useEffect(() => {
    if (!src) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = new Image()
            img.src = src
            img.srcset = generateSrcSet()
            img.sizes = '100vw'
            
            img.onload = () => {
              setCurrentSrc(img.currentSrc)
              setIsLoaded(true)
            }
            
            img.onerror = () => {
              setError(new Error('Failed to load image'))
            }
            
            observer.disconnect()
          }
        })
      },
      {
        threshold,
        rootMargin
      }
    )

    const element = document.createElement('div')
    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [src, generateSrcSet, threshold, rootMargin])

  return {
    isLoaded,
    error,
    currentSrc: currentSrc || src,
    srcSet: generateSrcSet()
  }
} 