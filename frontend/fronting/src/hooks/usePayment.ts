import { useMutation, useQuery } from '@tanstack/react-query'
import { paymentService } from '@/services/api/payment'
import { useToast } from '@chakra-ui/react'

export function usePayment() {
  const toast = useToast()

  // Stripe
  const { mutate: createStripeIntent } = useMutation({
    mutationFn: (amount: number) => paymentService.createStripePaymentIntent(amount),
    onError: (error) => {
      toast({
        title: 'Erro ao processar pagamento',
        description: error.message,
        status: 'error'
      })
    }
  })

  const { mutate: confirmStripePayment } = useMutation({
    mutationFn: (paymentIntentId: string) => paymentService.confirmStripePayment(paymentIntentId)
  })

  // PayPal
  const { mutate: createPayPalOrder } = useMutation({
    mutationFn: (amount: number) => paymentService.createPayPalOrder(amount),
    onError: (error) => {
      toast({
        title: 'Erro ao criar ordem PayPal',
        description: error.message,
        status: 'error'
      })
    }
  })

  const { mutate: capturePayPalPayment } = useMutation({
    mutationFn: (orderId: string) => paymentService.capturePayPalPayment(orderId)
  })

  // Métodos genéricos
  const { data: paymentMethods } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => paymentService.getPaymentMethods()
  })

  const { mutate: processPayment } = useMutation({
    mutationFn: ({ orderId, method, data }: {
      orderId: string;
      method: string;
      data: any;
    }) => paymentService.processPayment(orderId, method, data),
    onSuccess: () => {
      toast({
        title: 'Pagamento processado com sucesso',
        status: 'success'
      })
    },
    onError: (error) => {
      toast({
        title: 'Erro ao processar pagamento',
        description: error.message,
        status: 'error'
      })
    }
  })

  return {
    // Stripe
    createStripeIntent,
    confirmStripePayment,
    
    // PayPal
    createPayPalOrder,
    capturePayPalPayment,
    
    // Genéricos
    paymentMethods,
    processPayment
  }
} 