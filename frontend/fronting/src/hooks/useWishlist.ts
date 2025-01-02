import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'

interface WishlistItem {
  productId: string
  addedAt: string
}

export function useWishlist() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: wishlist = [] } = useQuery<WishlistItem[]>({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/wishlist/${user?.id}`)
      if (!response.ok) throw new Error('Failed to fetch wishlist')
      return response.json()
    },
    enabled: !!user
  })

  const addToWishlist = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch('/api/wishlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, productId })
      })
      if (!response.ok) throw new Error('Failed to add to wishlist')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['wishlist', user?.id])
    }
  })

  const removeFromWishlist = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch('/api/wishlist/remove', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, productId })
      })
      if (!response.ok) throw new Error('Failed to remove from wishlist')
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['wishlist', user?.id])
    }
  })

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.productId === productId)
  }

  return {
    wishlist,
    addToWishlist: addToWishlist.mutate,
    removeFromWishlist: removeFromWishlist.mutate,
    isInWishlist,
    isLoading: addToWishlist.isLoading || removeFromWishlist.isLoading
  }
} 