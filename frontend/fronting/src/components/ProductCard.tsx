'use client'

import { useState, memo, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Box,
  Badge,
  Button,
  Text,
  VStack,
  HStack,
  IconButton,
  useToast,
  useColorModeValue,
  Tooltip,
  Skeleton,
  Link,
} from '@chakra-ui/react'
import { FaHeart, FaShoppingCart, FaShare, FaEye } from 'react-icons/fa'
import { Product } from '@/types'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { formatCurrency } from '@/utils/format'

interface ProductCardProps {
  product: Product
  variant?: 'default' | 'compact' | 'horizontal'
  isLoading?: boolean
  showActions?: boolean
  onQuickView?: () => void
  onShare?: () => void
}

export const ProductCard = memo(function ProductCard({
  product,
  variant = 'default',
  isLoading = false,
  showActions = true,
  onQuickView,
  onShare
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const { addItem } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const toast = useToast()

  const isDark = useColorModeValue(false, true)
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.700', 'gray.100')
  const mutedColor = useColorModeValue('gray.600', 'gray.400')

  const handleAddToCart = useCallback(() => {
    addItem({ ...product, quantity: 1 })
    toast({
      title: 'Produto adicionado',
      description: 'O item foi adicionado ao seu carrinho',
      status: 'success',
      duration: 2000,
      isClosable: true,
    })
  }, [product, addItem, toast])

  const handleToggleWishlist = useCallback(() => {
    toggleWishlist(product)
    toast({
      title: isInWishlist(product.id) ? 'Removido dos favoritos' : 'Adicionado aos favoritos',
      status: 'success',
      duration: 2000,
      isClosable: true,
    })
  }, [product, toggleWishlist, isInWishlist, toast])

  const handleShare = useCallback(() => {
    if (onShare) {
      onShare()
    } else {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      }).catch(console.error)
    }
  }, [product, onShare])

  const cardHeight = variant === 'compact' ? '300px' : variant === 'horizontal' ? '200px' : '400px'
  const imageHeight = variant === 'compact' ? '150px' : variant === 'horizontal' ? '100%' : '250px'

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Box
          height={cardHeight}
          bg={bgColor}
          borderRadius="xl"
          overflow="hidden"
          borderWidth="1px"
          borderColor={borderColor}
          display={variant === 'horizontal' ? 'flex' : 'block'}
        >
          <Box
            position="relative"
            width={variant === 'horizontal' ? '200px' : '100%'}
            height={imageHeight}
          >
            <Skeleton height="100%" />
          </Box>
          <VStack
            p={4}
            flex="1"
            spacing={2}
          >
            <Skeleton height="20px" width="70%" />
            <Skeleton height="16px" width="40%" />
            <Skeleton height="24px" width="50%" />
            <Skeleton height="40px" width="100%" />
          </VStack>
        </Box>
      </motion.div>
    )
  }

  if (!product?.id) {
    return null;
  }

  return (
    <Link href={`/product/${product.id}`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ height: '100%' }}
      >
        <Box
          height={cardHeight}
          bg={bgColor}
          borderRadius="xl"
          overflow="hidden"
          borderWidth="1px"
          borderColor={borderColor}
          transition="all 0.3s ease"
          _hover={{
            transform: 'translateY(-4px)',
            boxShadow: 'xl'
          }}
          display={variant === 'horizontal' ? 'flex' : 'block'}
        >
          <Box
            position="relative"
            width={variant === 'horizontal' ? '200px' : '100%'}
            height={imageHeight}
            bg="gray.100"
          >
            {product.discount > 0 && (
              <Badge
                position="absolute"
                top={4}
                left={4}
                colorScheme="red"
                zIndex={1}
              >
                -{product.discount}%
              </Badge>
            )}

            {showActions && (
              <Box
                position="absolute"
                top={4}
                right={4}
                zIndex={1}
              >
                <AnimatePresence>
                  {isHovered && (
                    <VStack spacing={2}>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Tooltip label="Favoritar">
                          <IconButton
                            aria-label="Adicionar aos favoritos"
                            icon={<FaHeart />}
                            colorScheme={isInWishlist(product.id) ? 'red' : 'gray'}
                            onClick={handleToggleWishlist}
                            size="sm"
                          />
                        </Tooltip>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Tooltip label="Visualização rápida">
                          <IconButton
                            aria-label="Visualização rápida"
                            icon={<FaEye />}
                            onClick={onQuickView}
                            size="sm"
                          />
                        </Tooltip>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Tooltip label="Compartilhar">
                          <IconButton
                            aria-label="Compartilhar"
                            icon={<FaShare />}
                            onClick={handleShare}
                            size="sm"
                          />
                        </Tooltip>
                      </motion.div>
                    </VStack>
                  )}
                </AnimatePresence>
              </Box>
            )}

            <Skeleton isLoaded={imageLoaded} height="100%">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                style={{ objectFit: 'cover' }}
                onLoad={() => setImageLoaded(true)}
                priority={variant === 'default'}
              />
            </Skeleton>
          </Box>

          <VStack
            p={4}
            flex="1"
            spacing={1}
          >
            <Text
              fontSize="sm"
              color={mutedColor}
              textTransform="uppercase"
              letterSpacing="wide"
            >
              {product.category}
            </Text>

            <Text
              fontWeight="semibold"
              color={textColor}
              noOfLines={2}
            >
              {product.name}
            </Text>

            <HStack justify="space-between" align="baseline">
              <Text
                fontWeight="bold"
                color="blue.500"
                fontSize="xl"
              >
                {formatCurrency(product.price)}
              </Text>
              {product.oldPrice && (
                <Text
                  fontSize="sm"
                  color={mutedColor}
                  textDecoration="line-through"
                >
                  {formatCurrency(product.oldPrice)}
                </Text>
              )}
            </HStack>

            {product.rating && (
              <HStack>
                <Text color="yellow.400">★</Text>
                <Text fontSize="sm" color={mutedColor}>
                  {product.rating}
                </Text>
              </HStack>
            )}
          </VStack>

          <Button
            leftIcon={<FaShoppingCart />}
            colorScheme="blue"
            width="100%"
            onClick={handleAddToCart}
            isDisabled={!product.inStock}
          >
            {product.inStock ? 'Adicionar ao Carrinho' : 'Indisponível'}
          </Button>
        </Box>
      </motion.div>
    </Link>
  )
})
