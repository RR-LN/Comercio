import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { STORAGE_KEYS } from '@/utils/constants'

class ApiService {
  private api: AxiosInstance
  private wsConnection: WebSocket | null = null

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
            const response = await this.api.post('/auth/token/refresh/', {
              refresh: refreshToken,
            })

            const { access: newToken } = response.data

            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken)
            originalRequest.headers.Authorization = `Bearer ${newToken}`

            return this.api(originalRequest)
          } catch (refreshError) {
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  // Métodos HTTP básicos
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<T>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<T>(url, data, config)
    return response.data
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.patch<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<T>(url, config)
    return response.data
  }

  // WebSocket
  connectWebSocket(token: string) {
    if (this.wsConnection?.readyState === WebSocket.OPEN) return

    this.wsConnection = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`
    )

    this.wsConnection.onopen = () => {
      console.log('WebSocket conectado')
    }

    this.wsConnection.onclose = () => {
      console.log('WebSocket desconectado')
      setTimeout(() => this.connectWebSocket(token), 3000) // Reconexão
    }

    this.wsConnection.onerror = (error) => {
      console.error('Erro WebSocket:', error)
    }

    return this.wsConnection
  }

  disconnectWebSocket() {
    if (this.wsConnection) {
      this.wsConnection.close()
      this.wsConnection = null
    }
  }
}

export const apiService = new ApiService() 