import axios from 'axios'
import { authService } from './auth'
import { STORAGE_KEYS } from '@/utils/constants'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
})

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Se o erro for 401 e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
        if (token && authService.isTokenValid(token)) {
          const response = await authService.refreshToken(token)
          originalRequest.headers.Authorization = `Bearer ${response.token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Se o refresh falhar, faz logout
        await authService.logout()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api
