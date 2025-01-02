// Base Types
export interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: 'user' | 'admin'
  createdAt: Date
  updatedAt: Date
  address?: Address
}

export interface UserUpdateData extends Partial<User> {
  passwordUpdate?: {
    currentPassword: string
    newPassword: string
  }
}

export interface Address {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  isNew?: boolean
  discount?: number
  oldPrice?: number
  rating?: number
}

export interface CartItem extends Product {
  quantity: number
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  shippingAddress: Address
  trackingCode?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface WishlistItem {
  id: string
  userId: string
  productId: string
  product: Product
  addedAt: Date
}

export interface WishlistResponse {
  items: WishlistItem[];
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CartResponse {
  items: CartItem[];
  total: number;
  subtotal: number;
  shipping: number;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  sort?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest';
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  startDate?: string;
  endDate?: string;
}

export interface Review {
  id: string
  userId: string
  productId: string
  rating: number
  comment: string
  createdAt: Date
  updatedAt: Date
  user?: {
    name: string
    avatar?: string
  }
}

// Enums as Types
export type OrderStatus = 
  | 'pending'
  | 'processing'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'refunded'

export type PaymentMethod = 
  | 'credit_card'
  | 'debit_card'
  | 'pix'
  | 'bank_slip'

// Utility Types
export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  totalPages: number
  hasMore: boolean
}

export interface ApiResponse<T> {
  data: T
  message?: string
  status: number
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  status: number
  statusCode?: number
}

// Auth Types
export interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
  phone?: string
}

export interface ResetPasswordData {
  token: string
  password: string
  confirmPassword: string
}
