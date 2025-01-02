import { apiService } from './base'

export const uploadService = {
  // Upload de imagem genérico
  async uploadImage(file: File, path: string): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('image', file)
    return apiService.post(`/upload/${path}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Upload de múltiplas imagens
  async uploadMultipleImages(files: File[], path: string): Promise<{ urls: string[] }> {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('images', file)
    })
    return apiService.post(`/upload/${path}/multiple/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Upload de avatar do usuário
  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData()
    formData.append('avatar', file)
    return apiService.post('/users/upload-avatar/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Excluir imagem
  async deleteImage(path: string): Promise<void> {
    return apiService.delete(`/upload/${path}/`)
  },

  // Otimizar imagem
  async optimizeImage(file: File, options?: {
    width?: number
    height?: number
    quality?: number
    format?: 'jpeg' | 'png' | 'webp'
  }): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('image', file)
    return apiService.post('/upload/optimize/', formData, {
      params: options,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }
} 