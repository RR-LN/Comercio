'use client'

import { useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Grid,
  Text,
  Button,
  useColorModeValue,
  HStack,
  VStack
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { InteractiveProductView } from './InteractiveProductView'
import { useCart } from '@/hooks/useCart'

interface QuickViewProps {
  isOpen: boolean
  onClose: () => void
  product: {
    id: string
    name: string
    price: number
    description: string
    images: string[]
    variants?: {
      color?: string[]
      size?: string[]
    }
  }
}

export const QuickView = ({ isOpen, onClose, product }: QuickViewProps) => {
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const { addToCart } = useCart()
  
  const bgColor = useColorModeValue('white', 'gray.800')

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader>{product.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={8}>
            <InteractiveProductView images={product.images} />
            
            <VStack align="stretch" spacing={6}>
              <Text fontSize="2xl" fontWeight="bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(product.price)}
              </Text>

              <Text>{product.description}</Text>

              {product.variants?.color && (
                <Box>
                  <Text fontWeight="semibold" mb={2}>Cores</Text>
                  <HStack>
                    {product.variants.color.map(color => (
                      <Button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        variant={selectedColor === color ? 'solid' : 'outline'}
                        bg={color}
                        _hover={{ bg: color }}
                      />
                    ))}
                  </HStack>
                </Box>
              )}

              {product.variants?.size && (
                <Box>
                  <Text fontWeight="semibold" mb={2}>Tamanhos</Text>
                  <HStack>
                    {product.variants.size.map(size => (
                      <Button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        variant={selectedSize === size ? 'solid' : 'outline'}
                      >
                        {size}
                      </Button>
                    ))}
                  </HStack>
                </Box>
              )}

              <Button
                colorScheme="brand"
                size="lg"
                onClick={() => {
                  addToCart({
                    productId: product.id,
                    color: selectedColor,
                    size: selectedSize,
                    quantity: 1
                  })
                  onClose()
                }}
              >
                Adicionar ao Carrinho
              </Button>
            </VStack>
          </Grid>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
} 