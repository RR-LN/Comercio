import { useEffect } from 'react'

export function useKeyboardShortcut(
  key: string,
  callback: (e: KeyboardEvent) => void
) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === key.toLowerCase()) {
        callback(event)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [key, callback])
}
