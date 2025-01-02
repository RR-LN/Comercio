// src/app/providers.tsx

'use client'

import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider } from '@chakra-ui/react'
import { AuthProvider } from '@/contexts/AuthContext'
import theme from '@/lib/theme'
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <CacheProvider>
        <ChakraProvider theme={theme}>
          <AuthProvider>{children}</AuthProvider>
        </ChakraProvider>
      </CacheProvider>
    </QueryClientProvider>
  )
}