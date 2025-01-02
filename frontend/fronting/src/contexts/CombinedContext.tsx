'use client'

import { ReactNode } from 'react'
import { AuthProvider } from './AuthContext'
import { CartProvider } from './CartContext'
import { WishlistProvider } from './WishlistContext'
import { ThemeModeProvider } from './ThemeModeContext'
import { NotificationProvider } from './NotificationContext'

interface CombinedProviderProps {
  children: ReactNode
}

export function CombinedProvider({ children }: CombinedProviderProps) {
  return (
    <ThemeModeProvider>
      <NotificationProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeModeProvider>
  )
} 