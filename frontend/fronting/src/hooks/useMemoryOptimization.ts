import { useEffect, useRef } from 'react'

interface MemoryOptions {
  maxCacheSize?: number
  cleanupInterval?: number
  maxInactiveTime?: number
}

export function useMemoryOptimization(options: MemoryOptions = {}) {
  const {
    maxCacheSize = 50 * 1024 * 1024, // 50MB
    cleanupInterval = 60000, // 1 minuto
    maxInactiveTime = 300000 // 5 minutos
  } = options

  const cacheRef = useRef(new Map())
  const lastAccessRef = useRef(new Map())

  useEffect(() => {
    const cleanup = () => {
      const now = Date.now()
      let totalSize = 0

      // Remover itens inativos
      for (const [key, lastAccess] of lastAccessRef.current.entries()) {
        if (now - lastAccess > maxInactiveTime) {
          cacheRef.current.delete(key)
          lastAccessRef.current.delete(key)
        }
      }

      // Calcular tamanho total
      for (const value of cacheRef.current.values()) {
        totalSize += getObjectSize(value)
      }

      // Se exceder o limite, remover itens mais antigos
      if (totalSize > maxCacheSize) {
        const sortedEntries = Array.from(lastAccessRef.current.entries())
          .sort(([, a], [, b]) => a - b)

        for (const [key] of sortedEntries) {
          cacheRef.current.delete(key)
          lastAccessRef.current.delete(key)
          totalSize = Array.from(cacheRef.current.values())
            .reduce((sum, value) => sum + getObjectSize(value), 0)

          if (totalSize <= maxCacheSize) break
        }
      }
    }

    const interval = setInterval(cleanup, cleanupInterval)
    return () => clearInterval(interval)
  }, [maxCacheSize, cleanupInterval, maxInactiveTime])

  const getObjectSize = (obj: any): number => {
    const str = JSON.stringify(obj)
    return str ? str.length * 2 : 0 // Aproximação do tamanho em bytes
  }

  const set = (key: string, value: any) => {
    cacheRef.current.set(key, value)
    lastAccessRef.current.set(key, Date.now())
  }

  const get = (key: string) => {
    const value = cacheRef.current.get(key)
    if (value !== undefined) {
      lastAccessRef.current.set(key, Date.now())
    }
    return value
  }

  const clear = () => {
    cacheRef.current.clear()
    lastAccessRef.current.clear()
  }

  return { set, get, clear }
} 