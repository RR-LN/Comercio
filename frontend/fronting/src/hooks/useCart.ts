import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface CartItem {
  id: string
  productId: string
  quantity: number
  color?: string
  size?: string
}

export function useCart() {
  const { user } = useAuth()
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) return
      try {
        const response = await fetch(`/api/cart/${user.id}`)
        if (!response.ok) throw new Error('Failed to fetch cart')
        const data = await response.json()
        setCart(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [user])

  const addToCart = async (item: Omit<CartItem, 'id'>) => {
    const response = await fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user?.id, ...item }),
    })
    if (!response.ok) throw new Error('Failed to add to cart')
    const newItem = await response.json()
    setCart(prevCart => [...prevCart, newItem])
  }

  return {
    cart,
    loading,
    error,
    addToCart,
  }
}