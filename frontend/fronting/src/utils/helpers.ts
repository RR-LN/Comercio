import { Product, CartItem } from '@/types'

// Formata preço para o formato brasileiro
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price)
}

// Calcula o total do carrinho
export const calculateCartTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0)
}

// Filtra produtos por categoria
export const filterProductsByCategory = (products: Product[], category?: string): Product[] => {
  if (!category) return products
  return products.filter(product => product.category === category)
}

// Ordena produtos por diferentes critérios
export const sortProducts = (products: Product[], sortBy: string): Product[] => {
  const sortedProducts = [...products]
  
  switch (sortBy) {
    case 'price-asc':
      return sortedProducts.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return sortedProducts.sort((a, b) => b.price - a.price)
    case 'name':
      return sortedProducts.sort((a, b) => a.name.localeCompare(b.name))
    default:
      return sortedProducts
  }
}

// Verifica se um produto está no carrinho
export const isInCart = (cartItems: CartItem[], productId: string): boolean => {
  return cartItems.some(item => item.id === productId)
}

// Gera URL amigável (slug)
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

// Valida email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Trunca texto com reticências
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

// Gera array de números para paginação
export const generatePagination = (currentPage: number, totalPages: number): number[] => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5]
  }

  if (currentPage >= totalPages - 2) {
    return Array.from({ length: 5 }, (_, i) => totalPages - 4 + i)
  }

  return [
    currentPage - 2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    currentPage + 2
  ]
}
