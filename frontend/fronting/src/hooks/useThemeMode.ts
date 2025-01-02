import { useState, useEffect, useCallback } from 'react'
import { useTheme, createTheme } from '@mui/material/styles'
import { Theme } from '@mui/material'

export function useThemeMode() {
  const baseTheme = useTheme()
  const [mode, setMode] = useState<'light' | 'dark'>(
    typeof window !== 'undefined'
      ? (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
      : 'light'
  )

  const theme = createTheme({
    ...baseTheme,
    palette: {
      ...baseTheme.palette,
      mode,
    },
  })

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
    if (savedTheme) {
      setMode(savedTheme)
    }
  }, [])

  const toggleTheme = useCallback(() => {
    const newMode = mode === 'light' ? 'dark' : 'light'
    setMode(newMode)
    localStorage.setItem('theme', newMode)
  }, [mode])

  return {
    theme,
    mode,
    toggleTheme,
  }
}
