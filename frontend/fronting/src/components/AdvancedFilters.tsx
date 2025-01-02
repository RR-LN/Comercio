'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  Heading,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Checkbox,
  Text,
  Collapse,
  Button,
  useColorModeValue,
  HStack,
  Badge
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaFilter, FaTimes } from 'react-icons/fa'

interface FilterOptions {
  priceRange: [number, number]
  categories: string[]
  brands: string[]
  ratings: number[]
  attributes: Record<string, string[]>
}

interface AdvancedFiltersProps {
  initialFilters: FilterOptions
  onFilterChange: (filters: FilterOptions) => void
  availableFilters: {
    maxPrice: number
    minPrice: number
    categories: Array<{ id: string; name: string; count: number }>
    brands: Array<{ id: string; name: string; count: number }>
    attributes: Record<string, Array<{ value: string; count: number }>>
  }
}

export const AdvancedFilters = ({
  initialFilters,
  onFilterChange,
  availableFilters
}: AdvancedFiltersProps) => {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    let count = 0
    if (filters.categories.length) count++
    if (filters.brands.length) count++
    if (filters.ratings.length) count++
    if (filters.priceRange[0] > availableFilters.minPrice) count++
    if (filters.priceRange[1] < availableFilters.maxPrice) count++
    Object.values(filters.attributes).forEach(attrs => {
      if (attrs.length) count++
    })
    setActiveFiltersCount(count)
  }, [filters, availableFilters])

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  const clearFilters = () => {
    const resetFilters: FilterOptions = {
      priceRange: [availableFilters.minPrice, availableFilters.maxPrice],
      categories: [],
      brands: [],
      ratings: [],
      attributes: {}
    }
    setFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      p={4}
      bg={bgColor}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <HStack justify="space-between" mb={4}>
        <Heading size="md">Filtros</Heading>
        {activeFiltersCount > 0 && (
          <HStack>
            <Badge colorScheme="blue">{activeFiltersCount} ativos</Badge>
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<FaTimes />}
              onClick={clearFilters}
            >
              Limpar
            </Button>
          </HStack>
        )}
      </HStack>

      <VStack spacing={6} align="stretch">
        {/* Filtro de Preço */}
        <Box>
          <Heading size="sm" mb={3}>Faixa de Preço</Heading>
          <RangeSlider
            defaultValue={filters.priceRange}
            min={availableFilters.minPrice}
            max={availableFilters.maxPrice}
            onChange={(val) => handleFilterChange({ priceRange: val as [number, number] })}
          >
            <RangeSliderTrack>
              <RangeSliderFilledTrack />
            </RangeSliderTrack>
            <RangeSliderThumb index={0} />
            <RangeSliderThumb index={1} />
          </RangeSlider>
          <HStack justify="space-between" mt={2}>
            <Text fontSize="sm">R$ {filters.priceRange[0]}</Text>
            <Text fontSize="sm">R$ {filters.priceRange[1]}</Text>
          </HStack>
        </Box>

        {/* Filtro de Categorias */}
        <Box>
          <Heading size="sm" mb={3}>Categorias</Heading>
          <VStack align="stretch">
            {availableFilters.categories.map(category => (
              <Checkbox
                key={category.id}
                isChecked={filters.categories.includes(category.id)}
                onChange={(e) => {
                  const newCategories = e.target.checked
                    ? [...filters.categories, category.id]
                    : filters.categories.filter(id => id !== category.id)
                  handleFilterChange({ categories: newCategories })
                }}
              >
                <HStack justify="space-between" width="100%">
                  <Text>{category.name}</Text>
                  <Badge>{category.count}</Badge>
                </HStack>
              </Checkbox>
            ))}
          </VStack>
        </Box>

        {/* Filtro de Marcas */}
        <Box>
          <Heading size="sm" mb={3}>Marcas</Heading>
          <VStack align="stretch">
            {availableFilters.brands.map(brand => (
              <Checkbox
                key={brand.id}
                isChecked={filters.brands.includes(brand.id)}
                onChange={(e) => {
                  const newBrands = e.target.checked
                    ? [...filters.brands, brand.id]
                    : filters.brands.filter(id => id !== brand.id)
                  handleFilterChange({ brands: newBrands })
                }}
              >
                <HStack justify="space-between" width="100%">
                  <Text>{brand.name}</Text>
                  <Badge>{brand.count}</Badge>
                </HStack>
              </Checkbox>
            ))}
          </VStack>
        </Box>

        {/* Atributos Dinâmicos */}
        {Object.entries(availableFilters.attributes).map(([attribute, values]) => (
          <Box key={attribute}>
            <Heading size="sm" mb={3}>{attribute}</Heading>
            <VStack align="stretch">
              {values.map(({ value, count }) => (
                <Checkbox
                  key={value}
                  isChecked={filters.attributes[attribute]?.includes(value)}
                  onChange={(e) => {
                    const currentAttrs = filters.attributes[attribute] || []
                    const newAttrs = e.target.checked
                      ? [...currentAttrs, value]
                      : currentAttrs.filter(v => v !== value)
                    handleFilterChange({
                      attributes: {
                        ...filters.attributes,
                        [attribute]: newAttrs
                      }
                    })
                  }}
                >
                  <HStack justify="space-between" width="100%">
                    <Text>{value}</Text>
                    <Badge>{count}</Badge>
                  </HStack>
                </Checkbox>
              ))}
            </VStack>
          </Box>
        ))}
      </VStack>
    </Box>
  )
} 