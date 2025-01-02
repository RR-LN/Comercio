import { useCallback, useRef, useEffect } from 'react'
import { logger } from '@/lib/monitoring/logger'
import { userEventMonitor } from '@/lib/monitoring/userEventMonitor'

interface InteractionMetrics {
  type: string
  target: string
  duration: number
  success: boolean
  error?: any
  metadata?: Record<string, any>
}

interface InteractionOptions {
  threshold?: number // Limite de tempo para considerar interação lenta (ms)
  trackMetadata?: boolean
  retryCount?: number
  retryDelay?: number
}

export function useInteractionMonitoring(
  componentName: string, 
  options: InteractionOptions = {}
) {
  const {
    threshold = 100,
    trackMetadata = true,
    retryCount = 3,
    retryDelay = 1000
  } = options

  const metricsRef = useRef<InteractionMetrics[]>([])
  const interactionStartRef = useRef<number>()
  const retryAttemptsRef = useRef<Record<string, number>>({})

  const startInteraction = useCallback((type: string, target: string, metadata?: Record<string, any>) => {
    interactionStartRef.current = performance.now()
    const interactionId = `${type}-${target}-${Date.now()}`

    // Registrar início da interação
    userEventMonitor.trackEvent('interaction_start', target, {
      type,
      componentName,
      metadata: trackMetadata ? metadata : undefined
    })

    return {
      end: (success: boolean = true) => {
        if (!interactionStartRef.current) return

        const duration = performance.now() - interactionStartRef.current
        const metrics: InteractionMetrics = {
          type,
          target,
          duration,
          success,
          metadata: trackMetadata ? metadata : undefined
        }

        metricsRef.current.push(metrics)

        // Registrar fim da interação
        userEventMonitor.trackEvent('interaction_end', target, {
          type,
          duration,
          success,
          componentName,
          metadata: trackMetadata ? metadata : undefined
        })

        // Analisar performance
        if (duration > threshold) {
          logger.warn('Slow interaction detected', {
            component: componentName,
            ...metrics
          })
        }
      },
      fail: (error: any) => {
        trackError(type, target, error, metadata)
      }
    }
  }, [componentName, threshold, trackMetadata])

  const trackError = useCallback(async (
    type: string, 
    target: string, 
    error: any, 
    metadata?: Record<string, any>
  ) => {
    const retryKey = `${type}-${target}`
    const attempts = retryAttemptsRef.current[retryKey] || 0

    const metrics: InteractionMetrics = {
      type,
      target,
      duration: interactionStartRef.current 
        ? performance.now() - interactionStartRef.current 
        : 0,
      success: false,
      error,
      metadata: trackMetadata ? metadata : undefined
    }

    metricsRef.current.push(metrics)

    // Registrar erro
    userEventMonitor.trackEvent('interaction_error', target, {
      type,
      error: error.message,
      attempts,
      componentName,
      metadata: trackMetadata ? metadata : undefined
    })

    logger.error('Interaction error', {
      component: componentName,
      attempts,
      ...metrics
    })

    // Tentar novamente se possível
    if (attempts < retryCount) {
      retryAttemptsRef.current[retryKey] = attempts + 1
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempts + 1)))
      return true // Indica que deve tentar novamente
    }

    return false // Não tentar mais
  }, [componentName, retryCount, retryDelay, trackMetadata])

  // Limpar tentativas de retry periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      retryAttemptsRef.current = {}
    }, 3600000) // 1 hora

    return () => clearInterval(interval)
  }, [])

  const getMetrics = useCallback((timeWindow?: number) => {
    const metrics = metricsRef.current
    if (!timeWindow) return metrics

    const cutoff = Date.now() - timeWindow
    return metrics.filter(m => new Date(m.timestamp).getTime() > cutoff)
  }, [])

  const getStats = useCallback(() => {
    const metrics = metricsRef.current
    const total = metrics.length
    if (total === 0) return null

    const successful = metrics.filter(m => m.success).length
    const failed = total - successful
    const avgDuration = metrics.reduce((sum, m) => sum + m.duration, 0) / total
    const slowInteractions = metrics.filter(m => m.duration > threshold).length

    return {
      total,
      successful,
      failed,
      successRate: `${((successful / total) * 100).toFixed(2)}%`,
      avgDuration: `${avgDuration.toFixed(2)}ms`,
      slowInteractions,
      byType: metrics.reduce((acc, m) => {
        acc[m.type] = (acc[m.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
  }, [threshold])

  return {
    startInteraction,
    trackError,
    getMetrics,
    getStats
  }
}

// Exemplo de uso:
/*
function MyComponent() {
  const { startInteraction } = useInteractionMonitoring('MyComponent', {
    threshold: 200,
    retryCount: 2
  })

  const handleSubmit = async (data: FormData) => {
    const interaction = startInteraction('submit', 'form', { formData: data })
    
    try {
      await submitForm(data)
      interaction.end(true)
    } catch (error) {
      const shouldRetry = await interaction.fail(error)
      if (shouldRetry) {
        // Tentar novamente
        handleSubmit(data)
      }
    }
  }

  return <form onSubmit={handleSubmit}>...</form>
}
*/ 