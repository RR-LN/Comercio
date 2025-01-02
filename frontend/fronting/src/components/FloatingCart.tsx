'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Image,
  useColorModeValue,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaShoppingCart, FaTrash, FaPlus, FaMinus } from 'react-icons/fa'
import { useCart } from '@/hooks/useCart'
import { formatCurrency } from '@/utils/format'

export const FloatingCart = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { cart, removeFromCart, updateQuantity, total } = useCart()
  const [isAnimating, setIsAnimating] = useState(false)

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    if (cart.length > 0) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 500)
      return () => clearTimeout(timer)
    }
  }, [cart.length])

  return (
    <>
      <Box
        as={motion.div}
        position="fixed"
        bottom={4}
        right={4}
        zIndex={1000}
        animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
      >
        <Button
          leftIcon={<FaShoppingCart />}
          colorScheme="blue"
          onClick={onOpen}
          size="lg"
          borderRadius="full"
          shadow="lg"
        >
          {cart.length} {cart.length === 1 ? 'item' : 'itens'}
        </Button>
      </Box>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Seu Carrinho</DrawerHeader>

          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Box
                      p={4}
                      borderWidth="1px"
                      borderRadius="lg"
                      borderColor={borderColor}
                    >
                      <HStack spacing={4}>
                        <Image
                          src={item.image}
                          alt={item.name}
                          boxSize="80px"
                          objectFit="cover"
                          borderRadius="md"
                        />
                        
                        <VStack flex={1} align="start" spacing={1}>
                          <Text fontWeight="bold">{item.name}</Text>
                          <Text color="gray.500">
                            {formatCurrency(item.price)}
                          </Text>
                          
                          <HStack>
                            <IconButton
                              aria-label="Diminuir quantidade"
                              icon={<FaMinus />}
                              size="sm"
                              isDisabled={item.quantity <= 1}
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            />
                            <Text>{item.quantity}</Text>
                            <IconButton
                              aria-label="Aumentar quantidade"
                              icon={<FaPlus />}
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            />
                          </HStack>
                        </VStack>

                        <IconButton
                          aria-label="Remover item"
                          icon={<FaTrash />}
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => removeFromCart(item.id)}
                        />
                      </HStack>
                    </Box>
                  </motion.div>
                ))}
              </AnimatePresence>

              {cart.length === 0 && (
                <Box textAlign="center" py={8}>
                  <Text color="gray.500">Seu carrinho está vazio</Text>
                </Box>
              )}

              {cart.length > 0 && (
                <Box
                  position="sticky"
                  bottom={0}
                  bg={bgColor}
                  p={4}
                  borderTopWidth="1px"
                  borderColor={borderColor}
                >
                  <VStack spacing={4}>
                    <HStack justify="space-between" width="100%">
                      <Text fontWeight="bold">Total</Text>
                      <Text fontWeight="bold">{formatCurrency(total)}</Text>
                    </HStack>
                    <Button colorScheme="blue" width="100%" size="lg">
                      Finalizar Compra
                    </Button>
                  </VStack>
                </Box>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
} 