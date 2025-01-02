'use client'

import { memo } from 'react'
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react'
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

export const ErrorFallback = memo(function ErrorFallback({
  error,
  resetErrorBoundary
}: ErrorFallbackProps) {
  return (
    <Box
      role="alert"
      p={6}
      bg="white"
      borderRadius="lg"
      shadow="md"
      maxW="400px"
      mx="auto"
      my={8}
    >
      <VStack spacing={4} align="stretch">
        <Box color="red.500" fontSize="3xl" textAlign="center">
          <FaExclamationTriangle />
        </Box>
        <Heading size="md" textAlign="center">
          Algo deu errado
        </Heading>
        <Text color="gray.600" fontSize="sm">
          {error.message}
        </Text>
        <Button
          leftIcon={<FaRedo />}
          colorScheme="blue"
          onClick={resetErrorBoundary}
        >
          Tentar novamente
        </Button>
      </VStack>
    </Box>
  )
}) 