'use client'

import { memo } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { ProductCard } from './ProductCard'
import { 
  Grid,
  Spinner,
  Text,
  VStack,
  Button,
  useToast 
} from '@chakra-ui/react'
import { FaSync } from 'react-icons/fa'

interface ProductListProps {
  category?: string
  featured?: boolean
  limit?: number
}

export const ProductList = memo(function ProductList({
  category,
  featured,
  limit
}: ProductListProps) {
  const { 
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useProducts({ 
    category,
    featured,
    limit,
  })

  const toast = useToast()

  if (isLoading) {
    return (
      <VStack py={8}>
        <Spinner size="xl" />
        <Text>Carregando produtos...</Text>
      </VStack>
    )
  }

  if (isError) {
    return (
      <VStack py={8} spacing={4}>
        <Text color="red.500">
          Erro ao carregar produtos: {error.message}
        </Text>
        <Button
          leftIcon={<FaSync />}
          onClick={() => refetch()}
        >
          Tentar novamente
        </Button>
      </VStack>
    )
  }

  return (
    <Grid
      templateColumns={{
        base: '1fr',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
        lg: 'repeat(4, 1fr)'
      }}
      gap={6}
    >
      {data?.products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </Grid>
  )
}) 