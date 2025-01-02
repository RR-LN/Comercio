import api from './api'
import { Product, ProductsResponse, ProductQueryParams } from '@/types'
import { CACHE_CONFIG } from '@/utils/constants'

export const productService = {
  async getProducts(params?: ProductQueryParams): Promise<ProductsResponse> {
    const { data } = await api.get<ProductsResponse>('/products/', { 
      params,
      headers: {
        'Cache-Control': `max-age=${CACHE_CONFIG.TTL.PRODUCTS}`
      }
    })
    return data
  },

  async getProduct(id: string): Promise<Product> {
    const { data } = await api.get<Product>(`/products/${id}/`, {
      headers: {
        'Cache-Control': `max-age=${CACHE_CONFIG.TTL.PRODUCTS}`
      }
    })
    return data
  },

  async getFeaturedProducts(): Promise<ProductsResponse> {
    const { data } = await api.get<ProductsResponse>('/products/featured/', {
      headers: {
        'Cache-Control': `max-age=${CACHE_CONFIG.TTL.PRODUCTS}`
      }
    })
    return data
  },

  async searchProducts(query: string): Promise<ProductsResponse> {
    const { data } = await api.get<ProductsResponse>('/products/search/', {
      params: { query }
    })
    return data
  },

  async getProductsByCategory(categoryId: string): Promise<ProductsResponse> {
    const { data } = await api.get<ProductsResponse>(`/categories/${categoryId}/products/`)
    return data
  },

  async getRelatedProducts(productId: string): Promise<ProductsResponse> {
    const { data } = await api.get<ProductsResponse>(`/products/${productId}/related/`)
    return data
  }
} 