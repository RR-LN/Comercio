import { useCallback } from 'react'
import { CACHE_CONFIG } from '@/utils/constants'

interface CacheOptions {
  ttl?: number
  namespace?: string
}

export function useCache() {
  const setCache = useCallback((key: string, data: any, options: CacheOptions = {}) => {
    const { ttl = CACHE_CONFIG.TTL.DEFAULT, namespace = '' } = options
    const cacheKey = namespace ? `${namespace}:${key}` : key
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl
    }
    localStorage.setItem(cacheKey, JSON.stringify(cacheData))
  }, [])

  const getCache = useCallback((key: string, options: CacheOptions = {}) => {
    const { namespace = '' } = options
    const cacheKey = namespace ? `${namespace}:${key}` : key
    const cached = localStorage.getItem(cacheKey)

    if (!cached) return null

    const { data, timestamp, ttl } = JSON.parse(cached)
    const now = Date.now()

    if (now - timestamp > ttl) {
      localStorage.removeItem(cacheKey)
      return null
    }

    return data
  }, [])

  const clearCache = useCallback((namespace?: string) => {
    if (namespace) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`${namespace}:`)) {
          localStorage.removeItem(key)
        }
      })
    } else {
      localStorage.clear()
    }
  }, [])

  return {
    setCache,
    getCache,
    clearCache
  }
} 