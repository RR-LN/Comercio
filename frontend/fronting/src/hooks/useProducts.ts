import { useEffect, useState } from 'react'
import { productService } from '@/services/api/products'
import { ProductQueryParams } from '@/types'

export function useProducts(params?: ProductQueryParams) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getProducts(params)
        setProducts(data)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [params])

  return { products, loading, error }
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProduct(id),
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: FormData) => productService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products'])
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => 
      productService.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['products'])
      queryClient.invalidateQueries(['product', variables.id])
    },
  })
}