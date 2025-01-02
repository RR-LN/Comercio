'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { Product } from '@/types'
import { wishlistService } from '@/services/wishlist'
import { useToast } from '@chakra-ui/react'

interface WishlistContextType {
  items: Product[]
  loading: boolean
  error: string | null
  addItem: (product: Product) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  clearWishlist: () => Promise<void>
  isInWishlist: (productId: string) => boolean
}

// Inicializar com valores padrão
const WishlistContext = createContext<WishlistContextType>({
  items: [],
  loading: false,
  error: null,
  addItem: async () => {},
  removeItem: async () => {},
  clearWishlist: async () => {},
  isInWishlist: () => false
})

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setLoading(true)
        const data = await wishlistService.getWishlist()
        setItems(data.items)
      } catch (error: any) {
        setError(error.message)
        toast({
          title: 'Erro',
          description: 'Erro ao carregar lista de desejos',
          status: 'error',
          duration: 3000
        })
      } finally {
        setLoading(false)
      }
    }

    loadWishlist()
  }, [toast])

  const addItem = useCallback(async (product: Product) => {
    try {
      setLoading(true)
      await wishlistService.addItem(product.id)
      setItems(current => [...current, product])
      toast({
        title: 'Sucesso',
        description: 'Produto adicionado à lista de desejos',
        status: 'success',
        duration: 2000
      })
    } catch (error: any) {
      setError(error.message)
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar à lista de desejos',
        status: 'error',
        duration: 2000
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const removeItem = useCallback(async (productId: string) => {
    try {
      setLoading(true)
      await wishlistService.removeItem(productId)
      setItems(current => current.filter(item => item.id !== productId))
      toast({
        title: 'Sucesso',
        description: 'Produto removido da lista de desejos',
        status: 'success',
        duration: 2000
      })
    } catch (error: any) {
      setError(error.message)
      toast({
        title: 'Erro',
        description: 'Erro ao remover da lista de desejos',
        status: 'error',
        duration: 2000
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const clearWishlist = useCallback(async () => {
    try {
      setLoading(true)
      await wishlistService.clearWishlist()
      setItems([])
      toast({
        title: 'Sucesso',
        description: 'Lista de desejos limpa com sucesso',
        status: 'success',
        duration: 2000
      })
    } catch (error: any) {
      setError(error.message)
      toast({
        title: 'Erro',
        description: 'Erro ao limpar lista de desejos',
        status: 'error',
        duration: 2000
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const isInWishlist = useCallback((productId: string) => {
    return items.some(item => item.id === productId)
  }, [items])

  return (
    <WishlistContext.Provider
      value={{
        items,
        loading,
        error,
        addItem,
        removeItem,
        clearWishlist,
        isInWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  return useContext(WishlistContext)
} 