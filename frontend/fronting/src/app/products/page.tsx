'use client'

import { useState, useCallback } from 'react'
import { useSearch } from '@/hooks/useSearch'
import { ProductCard } from '@/components/ProductCard'
import { ProductFilters } from '@/components/ProductFilters'
import { 
  Box, 
  Container, 
  Grid, 
  Heading, 
  Text,
  Button,
  HStack,
  VStack,
  Spinner,
  useColorModeValue 
} from '@chakra-ui/react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

export default function ProductsPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12
  })

  const { 
    data, 
    isLoading, 
    isFetching,
    hasNextPage,
    hasPreviousPage,
    fetchNextPage,
    fetchPreviousPage
  } = useSearch(filters)

  const handleFilterChange = useCallback((newFilters: any) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset page when filters change
    }))
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }))
  }, [])

  return (
    <Container maxW="container.xl" py={8}>
      <Grid templateColumns={{ base: '1fr', lg: '280px 1fr' }} gap={8}>
        {/* Sidebar com filtros */}
        <Box>
          <ProductFilters
            onFilterChange={handleFilterChange}
            categories={[]} // Adicione suas categorias aqui
            initialFilters={filters}
          />
        </Box>

        {/* Lista de produtos */}
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="xl" mb={2}>Produtos</Heading>
            <Text color="gray.600">
              {data?.total || 0} produtos encontrados
            </Text>
          </Box>

          {/* Loading state */}
          {isLoading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <Spinner size="xl" />
            </Box>
          ) : (
            <>
              {/* Grid de produtos */}
              <Grid
                templateColumns={{
                  base: '1fr',
                  md: 'repeat(2, 1fr)',
                  lg: 'repeat(3, 1fr)',
                  xl: 'repeat(4, 1fr)'
                }}
                gap={6}
              >
                {data?.products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </Grid>

              {/* Paginação */}
              <HStack justify="center" spacing={4}>
                <Button
                  leftIcon={<FaChevronLeft />}
                  onClick={() => handlePageChange(filters.page - 1)}
                  isDisabled={!hasPreviousPage || isFetching}
                >
                  Anterior
                </Button>
                <Text>
                  Página {filters.page} de {Math.ceil((data?.total || 0) / filters.limit)}
                </Text>
                <Button
                  rightIcon={<FaChevronRight />}
                  onClick={() => handlePageChange(filters.page + 1)}
                  isDisabled={!hasNextPage || isFetching}
                >
                  Próxima
                </Button>
              </HStack>
            </>
          )}
        </VStack>
      </Grid>
    </Container>
  )
} 