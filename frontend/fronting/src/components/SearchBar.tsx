'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useDebounce } from '@/hooks/useDebounce'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { useSearch } from '@/hooks/useSearch'
import { Product } from '@/types'
import { 
  Box, 
  Input, 
  InputGroup, 
  InputLeftElement, 
  InputRightElement,
  List,
  ListItem,
  Text,
  Spinner,
  useColorModeValue,
  Portal,
  IconButton,
  Kbd,
  VStack,
  HStack,
} from '@chakra-ui/react'
import { 
  FaSearch, 
  FaTimes, 
  FaHistory, 
  FaArrowRight,
  FaRegClock,
  FaRegStar,
} from 'react-icons/fa'
import styled from '@emotion/styled'

const SearchContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  max-width: 600px;
`

const SearchResults = styled(motion.div)`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 1000;
  margin-top: 4px;
`

const SearchHighlight = styled.span<{ isHighlighted: boolean }>`
  background-color: ${props => props.isHighlighted ? 'rgba(66, 153, 225, 0.2)' : 'transparent'};
  padding: 0.1em 0;
  border-radius: 2px;
`

interface SearchBarProps {
  onClose?: () => void
  isModal?: boolean
}

export function SearchBar({ onClose, isModal = false }: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('recentSearches') || '[]')
    }
    return []
  })
  
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedQuery = useDebounce(query, 300)
  
  const { data: searchResults, isLoading } = useSearch(debouncedQuery)
  
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  useOnClickOutside(containerRef, () => setIsOpen(false))

  const handleSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return

    // Atualiza buscas recentes
    const updatedSearches = [
      searchQuery,
      ...recentSearches.filter(s => s !== searchQuery)
    ].slice(0, 5)
    
    setRecentSearches(updatedSearches)
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches))
    
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    setIsOpen(false)
    if (onClose) onClose()
  }, [recentSearches, router, onClose])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query) {
      handleSearch(query)
    }
  }, [query, handleSearch])

  const clearSearch = useCallback(() => {
    setQuery('')
    inputRef.current?.focus()
  }, [])

  const removeRecentSearch = useCallback((searchTerm: string) => {
    const updatedSearches = recentSearches.filter(s => s !== searchTerm)
    setRecentSearches(updatedSearches)
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches))
  }, [recentSearches])

  const highlightMatch = useCallback((text: string, query: string) => {
    if (!query) return text

    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, i) => (
      <SearchHighlight key={i} isHighlighted={part.toLowerCase() === query.toLowerCase()}>
        {part}
      </SearchHighlight>
    ))
  }, [])

  const searchContent = useMemo(() => (
    <SearchResults
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      style={{ background: bg, borderColor }}
    >
      <Box p={4}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <Spinner />
          </Box>
        ) : (
          <VStack spacing={4} align="stretch">
            {/* Resultados da busca */}
            {searchResults?.products?.length > 0 && (
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.500" mb={2}>
                  Produtos Encontrados
                </Text>
                <List spacing={2}>
                  {searchResults.products.map((product: Product) => (
                    <ListItem
                      key={product.id}
                      p={2}
                      cursor="pointer"
                      borderRadius="md"
                      _hover={{ bg: hoverBg }}
                      onClick={() => router.push(`/product/${product.id}`)}
                    >
                      <HStack spacing={3}>
                        <FaRegStar />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">
                            {highlightMatch(product.name, query)}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {product.price.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            })}
                          </Text>
                        </VStack>
                      </HStack>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Buscas recentes */}
            {recentSearches.length > 0 && (
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.500" mb={2}>
                  Buscas Recentes
                </Text>
                <List spacing={2}>
                  {recentSearches.map((search, index) => (
                    <ListItem
                      key={index}
                      p={2}
                      cursor="pointer"
                      borderRadius="md"
                      _hover={{ bg: hoverBg }}
                    >
                      <HStack justify="space-between">
                        <HStack spacing={3} onClick={() => handleSearch(search)}>
                          <FaRegClock />
                          <Text>{highlightMatch(search, query)}</Text>
                        </HStack>
                        <IconButton
                          aria-label="Remover busca recente"
                          icon={<FaTimes />}
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeRecentSearch(search)
                          }}
                        />
                      </HStack>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Sugestões de busca */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="gray.500" mb={2}>
                Sugestões
              </Text>
              <List spacing={2}>
                {['Ofertas', 'Mais vendidos', 'Lançamentos'].map((suggestion, index) => (
                  <ListItem
                    key={index}
                    p={2}
                    cursor="pointer"
                    borderRadius="md"
                    _hover={{ bg: hoverBg }}
                    onClick={() => handleSearch(suggestion)}
                  >
                    <HStack spacing={3}>
                      <FaArrowRight />
                      <Text>{suggestion}</Text>
                    </HStack>
                  </ListItem>
                ))}
              </List>
            </Box>
          </VStack>
        )}
      </Box>
    </SearchResults>
  ), [isLoading, searchResults, recentSearches, query, bg, borderColor, hoverBg, handleSearch, removeRecentSearch, highlightMatch, router])

  return (
    <SearchContainer ref={containerRef}>
      <InputGroup size="lg">
        <InputLeftElement>
          <FaSearch />
        </InputLeftElement>
        <Input
          ref={inputRef}
          placeholder="Buscar produtos..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          bg={bg}
          borderColor={borderColor}
          _focus={{
            borderColor: 'blue.500',
            boxShadow: 'outline',
          }}
        />
        <InputRightElement width="4.5rem">
          {query && (
            <IconButton
              aria-label="Limpar busca"
              icon={<FaTimes />}
              size="sm"
              variant="ghost"
              onClick={clearSearch}
            />
          )}
        </InputRightElement>
      </InputGroup>

      <AnimatePresence>
        {isOpen && (query || recentSearches.length > 0) && (
          isModal ? searchContent : <Portal>{searchContent}</Portal>
        )}
      </AnimatePresence>

      {/* Keyboard shortcuts hint */}
      <Box
        position="absolute"
        right={4}
        top="100%"
        mt={2}
        display={{ base: 'none', md: 'flex' }}
        alignItems="center"
        gap={1}
        color="gray.500"
        fontSize="sm"
      >
        <Kbd>⌘</Kbd> <Text>+</Text> <Kbd>K</Kbd> <Text>para buscar</Text>
      </Box>
    </SearchContainer>
  )
}
