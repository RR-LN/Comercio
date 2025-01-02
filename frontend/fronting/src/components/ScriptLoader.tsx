import { memo, useEffect, useRef } from 'react'

interface ScriptLoaderProps {
  src: string
  async?: boolean
  defer?: boolean
  onLoad?: () => void
  onError?: (error: Error) => void
  strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload'
}

export const ScriptLoader = memo(function ScriptLoader({
  src,
  async = true,
  defer = true,
  onLoad,
  onError,
  strategy = 'afterInteractive'
}: ScriptLoaderProps) {
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  useEffect(() => {
    if (strategy === 'beforeInteractive') return

    const loadScript = () => {
      const script = document.createElement('script')
      script.src = src
      script.async = async
      script.defer = defer

      script.onload = () => {
        onLoad?.()
      }

      script.onerror = () => {
        onError?.(new Error(`Failed to load script: ${src}`))
      }

      document.body.appendChild(script)
      scriptRef.current = script
    }

    if (strategy === 'lazyOnload') {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(loadScript)
      } else {
        setTimeout(loadScript, 1)
      }
    } else {
      loadScript()
    }

    return () => {
      if (scriptRef.current) {
        document.body.removeChild(scriptRef.current)
      }
    }
  }, [src, async, defer, onLoad, onError, strategy])

  return null
}) 