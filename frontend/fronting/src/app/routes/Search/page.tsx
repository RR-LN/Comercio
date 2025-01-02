'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Chip,
  Pagination,
  Skeleton,
  Alert,
  Stack,
} from '@mui/material'
import { ProductCard } from '@/components/ProductCard'
import { useAsyncOperation } from '@/contexts/LoadingContext'
import { useNotification } from '@/contexts/NotificationContext'
import { productService } from '@/services/api'
import { Product } from '@/types'
import { SORT_OPTIONS, PAGINATION } from '@/utils/constants'
import { formatPrice } from '@/utils/helpers'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const { withLoading } = useAsyncOperation()
  const { showNotification } = useNotification()
  const [products, setProducts] = useState<Product[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('featured')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const query = searchParams?.get('q') || ''

  useEffect(() => {
    if (query) {
      loadProducts()
    }
  }, [query, currentPage, sortBy, priceRange])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await withLoading(() =>
        productService.searchProducts(query)
      )

      let filteredProducts = response.products

      // Apply price filter
      filteredProducts = filteredProducts.filter(
        (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
      )

      // Apply sorting
      filteredProducts.sort((a, b) => {
        switch (sortBy) {
          case 'price_asc':
            return a.price - b.price
          case 'price_desc':
            return b.price - a.price
          case 'name_asc':
            return a.name.localeCompare(b.name)
          case 'name_desc':
            return b.name.localeCompare(a.name)
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          default:
            return 0
        }
      })

      // Apply pagination
      const startIndex = (currentPage - 1) * PAGINATION.ITEMS_PER_PAGE
      const paginatedProducts = filteredProducts.slice(
        startIndex,
        startIndex + PAGINATION.ITEMS_PER_PAGE
      )

      setProducts(paginatedProducts)
      setTotalProducts(filteredProducts.length)
    } catch (err) {
      setError('Erro ao carregar produtos. Tente novamente mais tarde.')
      showNotification('Erro ao carregar produtos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSortChange = (event: any) => {
    setSortBy(event.target.value)
    setCurrentPage(1)
  }

  const handlePriceChange = (_event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as [number, number])
    setCurrentPage(1)
  }

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page)
  }

  const clearFilters = () => {
    setSortBy('featured')
    setPriceRange([0, 1000])
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(totalProducts / PAGINATION.ITEMS_PER_PAGE)

  if (!query) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">
          Digite algo na barra de pesquisa para buscar produtos.
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Sidebar com Filtros */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Filtros
            </Typography>

            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Ordenar por</InputLabel>
                <Select value={sortBy} onChange={handleSortChange} label="Ordenar por">
                  {SORT_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>Faixa de Preço</Typography>
              <Slider
                value={priceRange}
                onChange={handlePriceChange}
                valueLabelDisplay="auto"
                min={0}
                max={1000}
                valueLabelFormat={(value) => formatPrice(value)}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">{formatPrice(priceRange[0])}</Typography>
                <Typography variant="body2">{formatPrice(priceRange[1])}</Typography>
              </Box>
            </Box>

            {(sortBy !== 'featured' || priceRange[0] > 0 || priceRange[1] < 1000) && (
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{ cursor: 'pointer' }}
                  onClick={clearFilters}
                >
                  Limpar Filtros
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Lista de Produtos */}
        <Grid item xs={12} md={9}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Resultados para "{query}"
            </Typography>
            {totalProducts > 0 && (
              <Typography color="text.secondary">
                {totalProducts} {totalProducts === 1 ? 'produto encontrado' : 'produtos encontrados'}
              </Typography>
            )}
          </Box>

          {/* Chips de Filtros Ativos */}
          {(sortBy !== 'featured' || priceRange[0] > 0 || priceRange[1] < 1000) && (
            <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
              {sortBy !== 'featured' && (
                <Chip
                  label={`Ordenado por: ${
                    SORT_OPTIONS.find((option) => option.value === sortBy)?.label
                  }`}
                  onDelete={() => setSortBy('featured')}
                />
              )}
              {(priceRange[0] > 0 || priceRange[1] < 1000) && (
                <Chip
                  label={`Preço: ${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}`}
                  onDelete={() => setPriceRange([0, 1000])}
                />
              )}
            </Stack>
          )}

          {error ? (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          ) : loading ? (
            <Grid container spacing={3}>
              {Array.from(new Array(6)).map((_, index) => (
                <Grid item key={index} xs={12} sm={6} md={4}>
                  <Skeleton variant="rectangular" height={300} />
                </Grid>
              ))}
            </Grid>
          ) : products.length === 0 ? (
            <Alert severity="info">
              Nenhum produto encontrado com os filtros selecionados.
            </Alert>
          ) : (
            <>
              <Grid container spacing={3}>
                {products.map((product) => (
                  <Grid item key={product.id} xs={12} sm={6} md={4}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  )
}
