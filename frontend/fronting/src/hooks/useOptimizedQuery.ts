import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { useCallback } from 'react'

interface UseOptimizedQueryOptions<T> extends UseQueryOptions<T> {
  prefetch?: boolean
  staleTime?: number
  cacheTime?: number
  retryDelay?: number
}

export function useOptimizedQuery<T>(
  key: string[],
  fetcher: () => Promise<T>,
  options: UseOptimizedQueryOptions<T> = {}
) {
  const {
    prefetch = false,
    staleTime = 1000 * 60 * 5, // 5 minutos
    cacheTime = 1000 * 60 * 30, // 30 minutos
    retryDelay = 1000,
    ...restOptions
  } = options

  const optimizedFetcher = useCallback(async () => {
    try {
      // Tentar obter do cache primeiro
      const cachedData = localStorage.getItem(`query_${key.join('_')}`)
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData)
        if (Date.now() - timestamp < staleTime) {
          return data as T
        }
      }

      // Se não estiver no cache ou estiver stale, fazer requisição
      const data = await fetcher()

      // Salvar no cache
      localStorage.setItem(
        `query_${key.join('_')}`,
        JSON.stringify({
          data,
          timestamp: Date.now()
        })
      )

      return data
    } catch (error) {
      // Se falhar, tentar usar cache mesmo que stale
      const cachedData = localStorage.getItem(`query_${key.join('_')}`)
      if (cachedData) {
        const { data } = JSON.parse(cachedData)
        return data as T
      }
      throw error
    }
  }, [key, fetcher, staleTime])

  return useQuery({
    queryKey: key,
    queryFn: optimizedFetcher,
    staleTime,
    cacheTime,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, retryDelay),
    ...restOptions
  })
} 