'use client'

import { useQuery } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/useDebounce'
import { productService } from '@/services/products'
import { ProductsResponse, ProductQueryParams } from '@/types/api'

interface UseSearchOptions {
  initialData?: ProductsResponse
  enabled?: boolean
  staleTime?: number
  cacheTime?: number
}

export function useSearch(
  searchParams: ProductQueryParams,
  options: UseSearchOptions = {}
) {
  const queryClient = useQueryClient()
  const debouncedQuery = useDebounce(searchParams.query, 300)

  const queryKey = ['products', { ...searchParams, query: debouncedQuery }]

  return useQuery({
    queryKey,
    queryFn: () => productService.getProducts({
      ...searchParams,
      query: debouncedQuery
    }),
    initialData: options.initialData,
    enabled: options.enabled ?? true,
    staleTime: options.staleTime ?? 1000 * 60 * 5, // 5 minutos
    cacheTime: options.cacheTime ?? 1000 * 60 * 30, // 30 minutos
    keepPreviousData: true,
    
    // Prefetch próxima página
    onSuccess: (data: ProductsResponse) => {
      if (data.nextPage) {
        const nextPage = (searchParams.page || 1) + 1
        queryClient.prefetchQuery({
          queryKey: ['products', { ...searchParams, page: nextPage }],
          queryFn: () => productService.getProducts({
            ...searchParams,
            page: nextPage
          })
        })
      }
    }
  })
}
