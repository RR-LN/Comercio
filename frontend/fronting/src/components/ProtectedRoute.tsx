'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/utils/constants'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireGuest?: boolean
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true,
  requireGuest = false 
}: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !isAuthenticated) {
        router.push(`${ROUTES.LOGIN}?redirect=${window.location.pathname}`)
      } else if (requireGuest && isAuthenticated) {
        router.push(ROUTES.HOME)
      }
    }
  }, [isAuthenticated, loading, requireAuth, requireGuest, router])

  if (loading) {
    return <div>Carregando...</div>
  }

  if (requireAuth && !isAuthenticated) {
    return null
  }

  if (requireGuest && isAuthenticated) {
    return null
  }

  return <>{children}</>
}
