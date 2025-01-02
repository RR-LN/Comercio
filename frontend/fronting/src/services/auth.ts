import api from './api'
import { AuthResponse, LoginCredentials, RegisterData, User } from '@/types'
import { STORAGE_KEYS } from '@/utils/constants'
import { jwtDecode } from 'jwt-decode'

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/token/', credentials)
    this.setAuthData(data)
    return data
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register/', userData)
    this.setAuthData(data)
    return data
  },

  async logout(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
    api.defaults.headers.common['Authorization'] = ''
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/token/refresh/', { refresh: refreshToken })
    this.setAuthData(data)
    return data
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>('/auth/me/')
    return data
  },

  setAuthData(authData: AuthResponse): void {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, authData.token)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authData.user))
    api.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`
  },

  getAuthData(): { token: string | null; user: User | null } {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    const userStr = localStorage.getItem(STORAGE_KEYS.USER)
    
    return {
      token,
      user: userStr ? JSON.parse(userStr) : null
    }
  },

  isTokenValid(token: string): boolean {
    try {
      const decoded: any = jwt_decode(token)
      const currentTime = Date.now() / 1000
      return decoded.exp > currentTime
    } catch {
      return false
    }
  }
} 