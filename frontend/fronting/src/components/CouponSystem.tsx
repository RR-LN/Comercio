'use client'

import { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  useToast,
  Badge,
  Collapse,
  useColorModeValue,
  IconButton,
  Divider
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTag, FaTimes, FaCopy } from 'react-icons/fa'
import { useCoupons } from '@/hooks/useCoupons'

interface CouponSystemProps {
  subtotal: number
  onApplyCoupon: (discount: number) => void
}

export const CouponSystem = ({ subtotal, onApplyCoupon }: CouponSystemProps) => {
  const [couponCode, setCouponCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showAvailable, setShowAvailable] = useState(false)
  const { availableCoupons, validateCoupon, applyCoupon } = useCoupons()
  const toast = useToast()

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      toast({
        title: 'Digite um código de cupom',
        status: 'warning',
        duration: 2000
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await validateCoupon(couponCode, subtotal)
      if (result.valid) {
        await applyCoupon(couponCode)
        onApplyCoupon(result.discount)
        toast({
          title: 'Cupom aplicado com sucesso!',
          description: `Desconto de ${result.discount}% aplicado`,
          status: 'success',
          duration: 3000
        })
        setCouponCode('')
      } else {
        toast({
          title: 'Cupom inválido',
          description: result.message,
          status: 'error',
          duration: 3000
        })
      }
    } catch (error) {
      toast({
        title: 'Erro ao aplicar cupom',
        description: 'Tente novamente mais tarde',
        status: 'error',
        duration: 3000
      })
    }
    setIsLoading(false)
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: 'Código copiado!',
      status: 'success',
      duration: 2000
    })
  }

  return (
    <Box p={4} bg={bgColor} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
      <VStack spacing={4} align="stretch">
        {/* Input do Cupom */}
        <HStack>
          <Input
            placeholder="Digite seu cupom"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            maxLength={20}
          />
          <Button
            leftIcon={<FaTag />}
            colorScheme="blue"
            isLoading={isLoading}
            onClick={handleApplyCoupon}
          >
            Aplicar
          </Button>
        </HStack>

        {/* Cupons Disponíveis */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAvailable(!showAvailable)}
        >
          {showAvailable ? 'Ocultar cupons' : 'Ver cupons disponíveis'}
        </Button>

        <Collapse in={showAvailable}>
          <VStack spacing={3} align="stretch">
            <AnimatePresence>
              {availableCoupons.map((coupon) => (
                <motion.div
                  key={coupon.code}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <Box
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                    borderStyle="dashed"
                    borderColor={borderColor}
                    position="relative"
                  >
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Badge colorScheme="green">{coupon.discount}% OFF</Badge>
                          {coupon.minValue && (
                            <Badge colorScheme="blue">
                              Mínimo: R$ {coupon.minValue}
                            </Badge>
                          )}
                        </HStack>
                        <Text fontSize="sm">{coupon.description}</Text>
                        <Text fontSize="xs" color="gray.500">
                          Válido até {new Date(coupon.expiresAt).toLocaleDateString()}
                        </Text>
                      </VStack>
                      
                      <IconButton
                        aria-label="Copiar código"
                        icon={<FaCopy />}
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(coupon.code)}
                      />
                    </HStack>

                    <Text
                      position="absolute"
                      top={-3}
                      right={4}
                      bg={bgColor}
                      px={2}
                      fontSize="sm"
                      fontWeight="bold"
                      color="blue.500"
                    >
                      {coupon.code}
                    </Text>
                  </Box>
                </motion.div>
              ))}
            </AnimatePresence>

            {availableCoupons.length === 0 && (
              <Text textAlign="center" color="gray.500">
                Nenhum cupom disponível no momento
              </Text>
            )}
          </VStack>
        </Collapse>
      </VStack>
    </Box>
  )
} 