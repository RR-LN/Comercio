'use client'

import { useState, useCallback } from 'react'
import {
  Box,
  VStack,
  Heading,
  Input,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Select,
  Checkbox,
  Button,
  Text,
  useColorModeValue,
  Collapse,
  useDisclosure
} from '@chakra-ui/react'
import { FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import { SORT_OPTIONS } from '@/utils/constants'

interface ProductFiltersProps {
  onFilterChange: (filters: any) => void
  categories: Array<{ id: string; name: string }>
  initialFilters?: any
}

export function ProductFilters({ onFilterChange, categories, initialFilters = {} }: ProductFiltersProps) {
  const [filters, setFilters] = useState(initialFilters)
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true })
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const handleFilterChange = useCallback((key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }, [filters, onFilterChange])

  const handleReset = useCallback(() => {
    setFilters({})
    onFilterChange({})
  }, [onFilterChange])

  return (
    <Box
      p={4}
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <VStack spacing={4} align="stretch">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Heading size="md" display="flex" alignItems="center" gap={2}>
            <FaFilter />
            Filtros
          </Heading>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            rightIcon={isOpen ? <FaChevronUp /> : <FaChevronDown />}
          >
            {isOpen ? 'Ocultar' : 'Mostrar'}
          </Button>
        </Box>

        <Collapse in={isOpen}>
          <VStack spacing={4} align="stretch">
            {/* Busca */}
            <Box>
              <Text mb={2} fontWeight="medium">Buscar</Text>
              <Input
                placeholder="Digite para buscar..."
                value={filters.query || ''}
                onChange={(e) => handleFilterChange('query', e.target.value)}
              />
            </Box>

            {/* Categorias */}
            <Box>
              <Text mb={2} fontWeight="medium">Categoria</Text>
              <Select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">Todas as categorias</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </Box>

            {/* Faixa de Preço */}
            <Box>
              <Text mb={2} fontWeight="medium">Faixa de Preço</Text>
              <RangeSlider
                defaultValue={[filters.minPrice || 0, filters.maxPrice || 1000]}
                min={0}
                max={1000}
                step={10}
                onChange={([min, max]) => {
                  handleFilterChange('minPrice', min)
                  handleFilterChange('maxPrice', max)
                }}
              >
                <RangeSliderTrack>
                  <RangeSliderFilledTrack />
                </RangeSliderTrack>
                <RangeSliderThumb index={0} />
                <RangeSliderThumb index={1} />
              </RangeSlider>
              <Box display="flex" justifyContent="space-between">
                <Text>R$ {filters.minPrice || 0}</Text>
                <Text>R$ {filters.maxPrice || 1000}</Text>
              </Box>
            </Box>

            {/* Ordenação */}
            <Box>
              <Text mb={2} fontWeight="medium">Ordenar por</Text>
              <Select
                value={filters.sort || ''}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Box>

            {/* Filtros adicionais */}
            <Box>
              <Text mb={2} fontWeight="medium">Filtros adicionais</Text>
              <VStack align="start">
                <Checkbox
                  isChecked={filters.inStock}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                >
                  Em estoque
                </Checkbox>
                <Checkbox
                  isChecked={filters.onSale}
                  onChange={(e) => handleFilterChange('onSale', e.target.checked)}
                >
                  Em promoção
                </Checkbox>
                <Checkbox
                  isChecked={filters.freeShipping}
                  onChange={(e) => handleFilterChange('freeShipping', e.target.checked)}
                >
                  Frete grátis
                </Checkbox>
              </VStack>
            </Box>

            {/* Botão de Reset */}
            <Button
              variant="outline"
              colorScheme="red"
              size="sm"
              onClick={handleReset}
            >
              Limpar Filtros
            </Button>
          </VStack>
        </Collapse>
      </VStack>
    </Box>
  )
} 