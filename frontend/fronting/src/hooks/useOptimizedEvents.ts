import { useCallback, useRef, useEffect } from 'react'

interface EventOptions {
  throttle?: number
  debounce?: number
  maxListeners?: number
  capture?: boolean
  passive?: boolean
}

export function useOptimizedEvents(
  eventMap: Record<string, (event: Event) => void>,
  options: EventOptions = {}
) {
  const {
    throttle = 100,
    debounce = 150,
    maxListeners = 10,
    capture = false,
    passive = true
  } = options

  const listenersRef = useRef(new Map())
  const timeoutRef = useRef<NodeJS.Timeout>()
  const lastCallRef = useRef<Record<string, number>>({})

  const createOptimizedHandler = useCallback((
    eventName: string,
    handler: (event: Event) => void
  ) => {
    return (event: Event) => {
      const now = Date.now()
      const last = lastCallRef.current[eventName] || 0

      // Throttle
      if (now - last < throttle) {
        return
      }

      // Debounce
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        handler(event)
        lastCallRef.current[eventName] = now
      }, debounce)
    }
  }, [throttle, debounce])

  useEffect(() => {
    // Verificar limite de listeners
    if (listenersRef.current.size >= maxListeners) {
      console.warn(`Maximum number of event listeners (${maxListeners}) exceeded`)
      return
    }

    // Adicionar listeners otimizados
    Object.entries(eventMap).forEach(([eventName, handler]) => {
      const optimizedHandler = createOptimizedHandler(eventName, handler)
      listenersRef.current.set(eventName, optimizedHandler)

      window.addEventListener(eventName, optimizedHandler, {
        capture,
        passive
      })
    })

    // Cleanup
    return () => {
      listenersRef.current.forEach((handler, eventName) => {
        window.removeEventListener(eventName, handler, {
          capture
        })
      })
      listenersRef.current.clear()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [eventMap, createOptimizedHandler, maxListeners, capture, passive])
} 