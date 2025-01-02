import { apiService } from './base'

export const paymentService = {
  // Stripe
  async createStripePaymentIntent(amount: number): Promise<{
    clientSecret: string;
    paymentIntentId: string;
  }> {
    return apiService.post('/payments/stripe/create-intent/', { amount })
  },

  async confirmStripePayment(paymentIntentId: string): Promise<void> {
    return apiService.post('/payments/stripe/confirm/', { paymentIntentId })
  },

  // PayPal
  async createPayPalOrder(amount: number): Promise<{
    orderId: string;
  }> {
    return apiService.post('/payments/paypal/create-order/', { amount })
  },

  async capturePayPalPayment(orderId: string): Promise<void> {
    return apiService.post('/payments/paypal/capture/', { orderId })
  },

  // Métodos genéricos
  async getPaymentMethods(): Promise<Array<{
    id: string;
    name: string;
    type: 'credit_card' | 'paypal' | 'pix' | 'bank_slip';
    enabled: boolean;
  }>> {
    return apiService.get('/payments/methods/')
  },

  async processPayment(orderId: string, method: string, data: any): Promise<{
    success: boolean;
    transactionId: string;
  }> {
    return apiService.post(`/payments/process/${orderId}/`, {
      method,
      ...data
    })
  }
} 