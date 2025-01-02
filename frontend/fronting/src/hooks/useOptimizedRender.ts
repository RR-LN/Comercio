import { useCallback, useRef, useEffect, useState } from 'react'

interface UseOptimizedRenderOptions {
  debounceTime?: number
  throttleTime?: number
  maxUpdates?: number
  batchSize?: number
}

export function useOptimizedRender<T>(
  data: T[],
  options: UseOptimizedRenderOptions = {}
) {
  const {
    debounceTime = 150,
    throttleTime = 100,
    maxUpdates = 60,
    batchSize = 20
  } = options

  const [visibleData, setVisibleData] = useState<T[]>([])
  const updateCountRef = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const lastUpdateRef = useRef(Date.now())

  const debouncedUpdate = useCallback((newData: T[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      const now = Date.now()
      if (now - lastUpdateRef.current >= throttleTime) {
        updateCountRef.current++
        if (updateCountRef.current <= maxUpdates) {
          setVisibleData(newData)
          lastUpdateRef.current = now
        }
      }
    }, debounceTime)
  }, [debounceTime, throttleTime, maxUpdates])

  const batchRender = useCallback((items: T[]) => {
    let currentBatch = 0
    const totalBatches = Math.ceil(items.length / batchSize)

    const processBatch = () => {
      if (currentBatch < totalBatches) {
        const start = currentBatch * batchSize
        const end = start + batchSize
        setVisibleData(prev => [...prev, ...items.slice(start, end)])
        currentBatch++
        requestAnimationFrame(processBatch)
      }
    }

    setVisibleData([])
    requestAnimationFrame(processBatch)
  }, [batchSize])

  useEffect(() => {
    if (data.length <= batchSize) {
      debouncedUpdate(data)
    } else {
      batchRender(data)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, batchSize, debouncedUpdate, batchRender])

  return visibleData
}

// Exemplo de uso:
/*
function ProductList({ products }) {
  const visibleProducts = useOptimizedRender(products, {
    batchSize: 10,
    debounceTime: 200
  })

  return (
    <div>
      {visibleProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
*/ 