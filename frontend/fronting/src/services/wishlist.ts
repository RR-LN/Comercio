import { api } from '@/lib/api'
import { Product } from '@/types'

interface WishlistResponse {
  items: Product[]
}

class WishlistService {
  async getWishlist(): Promise<WishlistResponse> {
    try {
      // Temporariamente retorna uma lista vazia até ter a API
      return { items: [] }
      // Quando tiver API:
      // const response = await api.get('/wishlist')
      // return response.data
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      return { items: [] }
    }
  }

  async addItem(productId: string): Promise<void> {
    try {
      // Implementar quando tiver API
      // await api.post('/wishlist/items', { productId })
      console.log('Added to wishlist:', productId)
    } catch (error) {
      console.error('Error adding item to wishlist:', error)
      throw error
    }
  }

  async removeItem(productId: string): Promise<void> {
    try {
      // Implementar quando tiver API
      // await api.delete(`/wishlist/items/${productId}`)
      console.log('Removed from wishlist:', productId)
    } catch (error) {
      console.error('Error removing item from wishlist:', error)
      throw error
    }
  }

  async clearWishlist(): Promise<void> {
    try {
      // Implementar quando tiver API
      // await api.delete('/wishlist/items')
      console.log('Wishlist cleared')
    } catch (error) {
      console.error('Error clearing wishlist:', error)
      throw error
    }
  }
}

export const wishlistService = new WishlistService() 