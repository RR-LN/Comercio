'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Container,
  Grid,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Slider,
  Paper,
  Chip,
  IconButton,
  SelectChangeEvent,
  Pagination,
} from '@mui/material'
import {
  FilterList as FilterListIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { ProductCard } from '@/components/ProductCard'
import { useAsyncOperation } from '@/contexts/LoadingContext'
import { useNotification } from '@/contexts/NotificationContext'
import { productService } from '@/services/api'
import { Product, ProductsResponse, Category } from '@/types/api'
import { formatPrice } from '@/utils/helpers'

const sortOptions = [
  { value: 'newest', label: 'Mais Recentes' },
  { value: 'price_asc', label: 'Menor Preço' },
  { value: 'price_desc', label: 'Maior Preço' },
  { value: 'name_asc', label: 'Nome (A-Z)' },
  { value: 'name_desc', label: 'Nome (Z-A)' },
]

const ITEMS_PER_PAGE = 12

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const { withLoading } = useAsyncOperation()
  const { showNotification } = useNotification()

  // Estado dos produtos e paginação
  const [products, setProducts] = useState<Product[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  // Estado dos filtros
  const [sortBy, setSortBy] = useState('newest')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [category, setCategory] = useState<string>('')
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  // Estado do filtro mobile
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    // Carrega as categorias ao montar o componente
    const loadCategories = async () => {
      try {
        const categoriesData = await withLoading(async () => {
          const response = await productService.getCategories()
          return response
        })
        setCategories(categoriesData)
      } catch (error) {
        showNotification('Erro ao carregar categorias', 'error')
      }
    }

    loadCategories()

    // Configura filtros iniciais baseados nos parâmetros da URL
    const initialCategory = searchParams?.get('category') || ''
    const initialSearch = searchParams?.get('search') || ''
    setCategory(initialCategory)
    setSearchTerm(initialSearch)
  }, [searchParams, showNotification, withLoading])

  useEffect(() => {
    loadProducts()
  }, [currentPage, sortBy, priceRange, category, searchTerm])

  const loadProducts = async () => {
    try {
      const response = await withLoading(async () => {
        const result = await productService.getProducts({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          sort: sortBy,
          category,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          search: searchTerm,
        })
        return result as ProductsResponse
      })
      
      setProducts(response.products)
      setTotalProducts(response.total)
    } catch (error) {
      showNotification('Erro ao carregar produtos', 'error')
    }
  }

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value)
    setCurrentPage(1)
  }

  const handlePriceChange = (_event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as [number, number])
    setCurrentPage(1)
  }

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setCategory(event.target.value)
    setCurrentPage(1)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page)
  }

  const clearFilters = () => {
    setSortBy('newest')
    setPriceRange([0, 1000])
    setCategory('')
    setSearchTerm('')
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE)

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Filtros para Desktop */}
        <Grid
          item
          xs={12}
          md={3}
          sx={{ display: { xs: showFilters ? 'block' : 'none', md: 'block' } }}
        >
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Filtros</Typography>
              <IconButton onClick={clearFilters} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Buscar"
                value={searchTerm}
                onChange={handleSearchChange}
                size="small"
              />
            </Box>

            <FormControl fullWidth size="small" sx={{ mb: 3 }}>
              <InputLabel>Categoria</InputLabel>
              <Select value={category} onChange={handleCategoryChange} label="Categoria">
                <MenuItem value="">Todas</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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

            <FormControl fullWidth size="small">
              <InputLabel>Ordenar por</InputLabel>
              <Select value={sortBy} onChange={handleSortChange} label="Ordenar por">
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        </Grid>

        {/* Lista de Produtos */}
        <Grid item xs={12} md={9}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">Produtos</Typography>
              <IconButton
                sx={{ display: { md: 'none' } }}
                onClick={() => setShowFilters(!showFilters)}
              >
                <FilterListIcon />
              </IconButton>
            </Box>

            {/* Chips de filtros ativos */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {category && (
                <Chip
                  label={`Categoria: ${categories.find(c => c.id === category)?.name}`}
                  onDelete={() => setCategory('')}
                />
              )}
              {searchTerm && (
                <Chip
                  label={`Busca: ${searchTerm}`}
                  onDelete={() => setSearchTerm('')}
                />
              )}
              {(priceRange[0] > 0 || priceRange[1] < 1000) && (
                <Chip
                  label={`Preço: ${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}`}
                  onDelete={() => setPriceRange([0, 1000])}
                />
              )}
            </Box>
          </Box>

          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item key={product.id} xs={12} sm={6} md={4}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>

          {products.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Nenhum produto encontrado
              </Typography>
            </Box>
          )}

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
        </Grid>
      </Grid>
    </Container>
  )
}
