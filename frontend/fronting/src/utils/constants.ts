// Rotas da aplicação
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  PROFILE: '/profile',
  DASHBOARD: '/dashboard',
  WISHLIST: '/wishlist'
} as const

// Estados brasileiros
export const brazilianStates = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
] as const

// Status de pedido
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  PAID: 'paid',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const

// Métodos de pagamento
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  PIX: 'pix',
  BANK_SLIP: 'bank_slip',
} as const

// Configurações de paginação
export const PAGINATION = {
  ITEMS_PER_PAGE: 12,
  MAX_PAGES_SHOWN: 5,
} as const

// Opções de ordenação
export const SORT_OPTIONS = [
  { value: 'featured', label: 'Em Destaque' },
  { value: 'price_asc', label: 'Menor Preço' },
  { value: 'price_desc', label: 'Maior Preço' },
  { value: 'name_asc', label: 'Nome (A-Z)' },
  { value: 'name_desc', label: 'Nome (Z-A)' },
  { value: 'newest', label: 'Mais Recentes' },
] as const

// Configurações de API
export const API_CONFIG = {
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const

// Configurações de cache
export const CACHE_CONFIG = {
  TTL: {
    PRODUCTS: 5 * 60 * 1000, // 5 minutos
    CATEGORIES: 60 * 60 * 1000, // 1 hora
    USER: 30 * 60 * 1000, // 30 minutos
  },
} as const

// Configurações de validação
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 3,
  PHONE_REGEX: /^\(\d{2}\) \d{4,5}-\d{4}$/,
  EMAIL_REGEX: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  CPF_REGEX: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  CEP_REGEX: /^\d{5}-\d{3}$/,
} as const

// Mensagens de erro
export const ERROR_MESSAGES = {
  GENERIC: 'Ocorreu um erro. Por favor, tente novamente.',
  NETWORK: 'Erro de conexão. Verifique sua internet.',
  NOT_FOUND: 'Recurso não encontrado.',
  VALIDATION: 'Por favor, verifique os dados informados.',
  AUTH: {
    INVALID_CREDENTIALS: 'Email ou senha inválidos.',
    SESSION_EXPIRED: 'Sessão expirada. Por favor, faça login novamente.',
    UNAUTHORIZED: 'Você não tem permissão para acessar este recurso.',
  },
} as const

// Add this new constant for storage keys
export const STORAGE_KEYS = {
  CART: 'cart',
  USER: 'user',
  AUTH_TOKEN: 'auth_token',
  PREFERENCES: 'preferences'
} as const
