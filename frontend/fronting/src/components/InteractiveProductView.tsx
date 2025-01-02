'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Box,
  Image,
  HStack,
  IconButton,
  useColorModeValue,
  AspectRatio,
  Skeleton
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaChevronLeft, FaChevronRight, FaExpand } from 'react-icons/fa'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Thumbs, Zoom } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'
import 'swiper/css/zoom'

interface InteractiveProductViewProps {
  images: string[]
  alt?: string
}

export const InteractiveProductView = ({
  images,
  alt = 'Product image'
}: InteractiveProductViewProps) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    const preloadImages = async () => {
      const promises = images.map(src => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.src = src
          img.onload = resolve
          img.onerror = reject
        })
      })

      try {
        await Promise.all(promises)
        setIsLoading(false)
      } catch (error) {
        console.error('Error preloading images:', error)
        setIsLoading(false)
      }
    }

    preloadImages()
  }, [images])

  const handleZoom = () => {
    setIsZoomed(!isZoomed)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !containerRef.current) return

    const { left, top, width, height } = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100

    containerRef.current.style.transformOrigin = `${x}% ${y}%`
  }

  return (
    <Box>
      <Box
        position="relative"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        cursor={isZoomed ? 'zoom-out' : 'zoom-in'}
        onClick={handleZoom}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AspectRatio ratio={1}>
              <Box
                position="relative"
                overflow="hidden"
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderColor}
              >
                {isLoading ? (
                  <Skeleton height="100%" width="100%" />
                ) : (
                  <Image
                    src={images[currentIndex]}
                    alt={`${alt} ${currentIndex + 1}`}
                    objectFit="cover"
                    width="100%"
                    height="100%"
                    transform={isZoomed ? 'scale(2.5)' : 'scale(1)'}
                    transition="transform 0.3s"
                  />
                )}
              </Box>
            </AspectRatio>
          </motion.div>
        </AnimatePresence>

        <HStack
          position="absolute"
          bottom={4}
          left="50%"
          transform="translateX(-50%)"
          spacing={2}
          bg={bgColor}
          p={2}
          borderRadius="full"
          boxShadow="md"
        >
          <IconButton
            aria-label="Previous image"
            icon={<FaChevronLeft />}
            size="sm"
            isDisabled={currentIndex === 0}
            onClick={(e) => {
              e.stopPropagation()
              setCurrentIndex(prev => prev - 1)
            }}
          />
          
          <Box px={2}>
            {currentIndex + 1} / {images.length}
          </Box>

          <IconButton
            aria-label="Next image"
            icon={<FaChevronRight />}
            size="sm"
            isDisabled={currentIndex === images.length - 1}
            onClick={(e) => {
              e.stopPropagation()
              setCurrentIndex(prev => prev + 1)
            }}
          />

          <IconButton
            aria-label="Toggle zoom"
            icon={<FaExpand />}
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleZoom()
            }}
          />
        </HStack>
      </Box>

      {/* Thumbnails */}
      <Box mt={4}>
        <Swiper
          spaceBetween={10}
          slidesPerView="auto"
          threshold={5}
          modules={[Navigation, Thumbs]}
          watchSlidesProgress
          onSwiper={setThumbsSwiper}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index} style={{ width: 'auto' }}>
              <Box
                as="button"
                onClick={() => setCurrentIndex(index)}
                position="relative"
                width="60px"
                height="60px"
                borderRadius="md"
                overflow="hidden"
                borderWidth="2px"
                borderColor={index === currentIndex ? 'blue.500' : borderColor}
                opacity={index === currentIndex ? 1 : 0.6}
                transition="all 0.2s"
                _hover={{ opacity: 1 }}
              >
                <Image
                  src={image}
                  alt={`${alt} thumbnail ${index + 1}`}
                  objectFit="cover"
                  width="100%"
                  height="100%"
                />
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </Box>
  )
} 