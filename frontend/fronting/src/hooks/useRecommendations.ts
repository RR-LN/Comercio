import { useQuery } from '@tanstack/react-query'
import { Product } from '@/types'

interface RecommendationsParams {
  userId: string
  currentProductId?: string
  category?: string
  limit?: number
}

export function useRecommendations({
  userId,
  currentProductId,
  category,
  limit = 4
}: RecommendationsParams) {
  return useQuery({
    queryKey: ['recommendations', userId, currentProductId, category],
    queryFn: async () => {
      const params = new URLSearchParams({
        userId,
        ...(currentProductId && { currentProductId }),
        ...(category && { category }),
        limit: limit.toString()
      })

      const response = await fetch(`/api/recommendations?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations')
      }

      return response.json() as Promise<Product[]>
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
} 