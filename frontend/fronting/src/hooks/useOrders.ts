import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderService } from '@/services/api/orders'
import { CreateOrderData } from '@/types'

export function useOrders(params?: any) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderService.getOrders(params),
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrder(id),
    enabled: !!id,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateOrderData) => orderService.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['orders'])
    },
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      orderService.cancelOrder(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['orders'])
      queryClient.invalidateQueries(['order', variables.id])
    },
  })
} 