import { apiService } from './base'
import { Product, PaginatedResponse, ProductQueryParams } from '@/types'

export const productService = {
  // Listar produtos com paginação e filtros
  async getProducts(params?: ProductQueryParams): Promise<PaginatedResponse<Product>> {
    return apiService.get('/products/', { params })
  },

  // Obter produto por ID
  async getProduct(id: string): Promise<Product> {
    return apiService.get(`/products/${id}/`)
  },

  // Produtos em destaque
  async getFeaturedProducts(): Promise<Product[]> {
    return apiService.get('/products/featured/')
  },

  // Buscar produtos
  async searchProducts(query: string): Promise<PaginatedResponse<Product>> {
    return apiService.get('/products/search/', { params: { query } })
  },

  // Produtos por categoria
  async getProductsByCategory(categoryId: string): Promise<PaginatedResponse<Product>> {
    return apiService.get(`/categories/${categoryId}/products/`)
  },

  // Produtos relacionados
  async getRelatedProducts(productId: string): Promise<Product[]> {
    return apiService.get(`/products/${productId}/related/`)
  },

  // Criar produto (admin)
  async createProduct(data: FormData): Promise<Product> {
    return apiService.post('/products/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Atualizar produto (admin)
  async updateProduct(id: string, data: FormData): Promise<Product> {
    return apiService.patch(`/products/${id}/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Excluir produto (admin)
  async deleteProduct(id: string): Promise<void> {
    return apiService.delete(`/products/${id}/`)
  },

  // Upload de imagem do produto
  async uploadProductImage(productId: string, file: File): Promise<string> {
    const formData = new FormData()
    formData.append('image', file)
    const response = await apiService.post(`/products/${productId}/upload-image/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.imageUrl
  }
} 