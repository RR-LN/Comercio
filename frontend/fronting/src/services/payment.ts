import api from './api'
import { PaymentMethod } from '@/types'

interface CreatePaymentIntentResponse {
  clientSecret: string
  paymentIntentId: string
}

interface PaymentMethodData {
  type: PaymentMethod
  card?: {
    number: string
    expMonth: number
    expYear: number
    cvc: string
  }
  billingDetails: {
    name: string
    email: string
    phone?: string
    address: {
      line1: string
      line2?: string
      city: string
      state: string
      postalCode: string
      country: string
    }
  }
}

export const paymentService = {
  // Stripe
  async createPaymentIntent(amount: number, currency: string = 'BRL'): Promise<CreatePaymentIntentResponse> {
    const { data } = await api.post<CreatePaymentIntentResponse>('/payments/create-intent', {
      amount,
      currency
    })
    return data
  },

  async confirmCardPayment(
    clientSecret: string,
    paymentMethod: PaymentMethodData
  ): Promise<any> {
    const { data } = await api.post('/payments/confirm-card-payment', {
      clientSecret,
      paymentMethod
    })
    return data
  },

  // PayPal
  async createPayPalOrder(amount: number): Promise<{ orderId: string }> {
    const { data } = await api.post('/payments/paypal/create-order', { amount })
    return data
  },

  async capturePayPalOrder(orderId: string): Promise<any> {
    const { data } = await api.post(`/payments/paypal/capture-order/${orderId}`)
    return data
  },

  // Validações
  async validateCard(cardNumber: string): Promise<boolean> {
    const { data } = await api.post('/payments/validate-card', { cardNumber })
    return data.isValid
  },

  async validateCPF(cpf: string): Promise<boolean> {
    const { data } = await api.post('/payments/validate-cpf', { cpf })
    return data.isValid
  },

  // Webhooks
  async handleStripeWebhook(event: any): Promise<void> {
    await api.post('/payments/stripe-webhook', event)
  },

  async handlePayPalWebhook(event: any): Promise<void> {
    await api.post('/payments/paypal-webhook', event)
  }
} 