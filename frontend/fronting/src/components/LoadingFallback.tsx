'use client'

import { memo } from 'react'
import { Box, Spinner, Text, VStack } from '@chakra-ui/react'

interface LoadingFallbackProps {
  message?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fullscreen?: boolean
}

export const LoadingFallback = memo(function LoadingFallback({
  message = 'Carregando...',
  size = 'xl',
  fullscreen = false
}: LoadingFallbackProps) {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minH={fullscreen ? '100vh' : '200px'}
      w="100%"
    >
      <VStack spacing={4}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size={size}
        />
        <Text color="gray.600">{message}</Text>
      </VStack>
    </Box>
  )
}) 