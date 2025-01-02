'use client'

import { memo } from 'react'
import { useOrders } from '@/hooks/useOrders'
import {
  VStack,
  Box,
  Text,
  Badge,
  Button,
  Spinner,
  useToast,
} from '@chakra-ui/react'
import { formatCurrency } from '@/utils/format'

export const OrderHistory = memo(function OrderHistory() {
  const { 
    data: orders,
    isLoading,
    isError,
    error
  } = useOrders()

  const { mutate: cancelOrder } = useCancelOrder()
  const toast = useToast()

  const handleCancel = (orderId: string) => {
    cancelOrder(
      { id: orderId },
      {
        onSuccess: () => {
          toast({
            title: 'Pedido cancelado com sucesso',
            status: 'success',
          })
        },
        onError: (error) => {
          toast({
            title: 'Erro ao cancelar pedido',
            description: error.message,
            status: 'error',
          })
        }
      }
    )
  }

  if (isLoading) return <Spinner />
  if (isError) return <Text color="red.500">{error.message}</Text>

  return (
    <VStack spacing={4} align="stretch">
      {orders?.map(order => (
        <Box
          key={order.id}
          p={4}
          borderWidth="1px"
          borderRadius="lg"
        >
          <Text fontWeight="bold">
            Pedido #{order.id}
          </Text>
          <Text>
            Total: {formatCurrency(order.total)}
          </Text>
          <Badge colorScheme={getStatusColor(order.status)}>
            {getStatusText(order.status)}
          </Badge>
          
          {order.status === 'pending' && (
            <Button
              size="sm"
              colorScheme="red"
              onClick={() => handleCancel(order.id)}
            >
              Cancelar Pedido
            </Button>
          )}
        </Box>
      ))}
    </VStack>
  )
}) 