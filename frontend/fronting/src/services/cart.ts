import api from './api'
import { CartResponse } from '@/types/api'

export const cartService = {
  async getCart(): Promise<CartResponse> {
    const { data } = await api.get<CartResponse>('/cart/')
    return data
  },

  async addItem(productId: string, quantity: number): Promise<CartResponse> {
    const { data } = await api.post<CartResponse>('/cart/items/', {
      product_id: productId,
      quantity
    })
    return data
  },

  async removeItem(productId: string): Promise<void> {
    await api.delete(`/cart/items/${productId}/`)
  },

  async updateQuantity(productId: string, quantity: number): Promise<CartResponse> {
    const { data } = await api.patch<CartResponse>(`/cart/items/${productId}/`, {
      quantity
    })
    return data
  },

  async clearCart(): Promise<void> {
    await api.delete('/cart/')
  },

  async calculateShipping(zipCode: string): Promise<number> {
    const { data } = await api.post<{ shipping: number }>('/cart/shipping/', {
      zip_code: zipCode
    })
    return data.shipping
  },

  async applyDiscount(code: string): Promise<CartResponse> {
    const { data } = await api.post<CartResponse>('/cart/discount/', {
      code
    })
    return data
  }
} 