import { apiService } from './base'
import { Order, PaginatedResponse, OrderStatus, CreateOrderData } from '@/types'

export const orderService = {
  // Listar pedidos do usuário
  async getOrders(params?: {
    page?: number
    limit?: number
    status?: OrderStatus
  }): Promise<PaginatedResponse<Order>> {
    return apiService.get('/orders/', { params })
  },

  // Obter pedido por ID
  async getOrder(id: string): Promise<Order> {
    return apiService.get(`/orders/${id}/`)
  },

  // Criar novo pedido
  async createOrder(data: CreateOrderData): Promise<Order> {
    return apiService.post('/orders/', data)
  },

  // Atualizar status do pedido (admin)
  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    return apiService.patch(`/orders/${id}/status/`, { status })
  },

  // Cancelar pedido
  async cancelOrder(id: string, reason?: string): Promise<Order> {
    return apiService.post(`/orders/${id}/cancel/`, { reason })
  },

  // Calcular frete
  async calculateShipping(zipCode: string, items: Array<{ id: string; quantity: number }>): Promise<{
    price: number
    estimatedDays: number
  }> {
    return apiService.post('/orders/calculate-shipping/', { zipCode, items })
  },

  // Aplicar cupom de desconto
  async applyDiscount(orderId: string, code: string): Promise<{
    discountValue: number
    total: number
  }> {
    return apiService.post(`/orders/${orderId}/apply-discount/`, { code })
  },

  // Gerar boleto
  async generateBankSlip(orderId: string): Promise<{
    bankSlipUrl: string
    dueDate: string
  }> {
    return apiService.post(`/orders/${orderId}/generate-bank-slip/`)
  },

  // Gerar QR Code PIX
  async generatePixQRCode(orderId: string): Promise<{
    qrCodeUrl: string
    qrCodeData: string
  }> {
    return apiService.post(`/orders/${orderId}/generate-pix/`)
  },

  // Confirmar pagamento (webhook)
  async confirmPayment(orderId: string, paymentData: any): Promise<Order> {
    return apiService.post(`/orders/${orderId}/confirm-payment/`, paymentData)
  }
} 