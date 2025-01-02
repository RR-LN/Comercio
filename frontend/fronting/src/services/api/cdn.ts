import { apiService } from './base'

export const cdnService = {
  // Upload de imagem
  async uploadImage(file: File, path: string): Promise<{
    url: string;
    key: string;
  }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('path', path)

    return apiService.post('/cdn/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Upload múltiplo
  async uploadMultiple(files: File[], path: string): Promise<Array<{
    url: string;
    key: string;
  }>> {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })
    formData.append('path', path)

    return apiService.post('/cdn/upload-multiple/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Excluir arquivo
  async deleteFile(key: string): Promise<void> {
    return apiService.delete(`/cdn/delete/${key}/`)
  },

  // Otimizar imagem
  async optimizeImage(key: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
  }): Promise<{
    url: string;
    key: string;
  }> {
    return apiService.post(`/cdn/optimize/${key}/`, options)
  },

  // Gerar URL assinada
  async getSignedUrl(key: string, expiresIn = 3600): Promise<{
    url: string;
    expiresAt: string;
  }> {
    return apiService.get(`/cdn/signed-url/${key}/`, {
      params: { expiresIn }
    })
  }
} 