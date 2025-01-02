import { useState, useCallback } from 'react'
import { CartItem } from '@/types'

export function useCartState() {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = useCallback((newItem: CartItem) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === newItem.id)
      
      if (existingItem) {
        return currentItems.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        )
      }

      return [...currentItems, newItem]
    })
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    )
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== productId))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  return {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  }
} 