import { User, Product, CartItem, WishlistItem, Order } from './index'

// Category Type
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  parentId?: string
}

// Request Types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  cpf: string
}

export interface UpdateProfileRequest {
  name?: string
  email?: string
  phone?: string
  address?: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
}

export interface UpdatePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export interface CreateOrderRequest {
  items: Array<{
    productId: string
    quantity: number
  }>
  shippingAddress: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
  paymentMethod: 'credit_card' | 'debit_card' | 'pix' | 'bank_slip'
  cardInfo?: {
    number: string
    name: string
    expiry: string
    cvv: string
  }
}

// Response Types
export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

export interface RefreshTokenResponse {
  token: string
  refreshToken: string
}

export interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  totalPages: number
  nextPage?: boolean
}

export interface CartResponse {
  items: CartItem[]
  total: number
  subtotal: number
  shipping: number
}

export interface OrdersResponse {
  orders: Order[]
  total: number
  page: number
  totalPages: number
}

export interface WishlistResponse {
  items: WishlistItem[]
}

// Query Parameters Types
export interface ProductQueryParams {
  page?: number
  limit?: number
  sort?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest'
  category?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  query?: string
  filters?: Record<string, any>
}

export interface OrderQueryParams {
  page?: number
  limit?: number
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  startDate?: string
  endDate?: string
}

// Error Types
export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  status: number
}

// Re-export types from index
export type { Product }
export type { CartItem } from './index'
export type { Order } from './index'
export type { WishlistItem } from './index'

export interface ApiResponse<T> {
  data: T
  message?: string
  status: number
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
