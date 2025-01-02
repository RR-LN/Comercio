'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

type ThemeModeContextType = {
  mode: 'light' | 'dark'
  toggleTheme: () => void
}

const ThemeModeContext = createContext<ThemeModeContextType | undefined>(undefined)

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode') as 'light' | 'dark'
    if (savedMode) setMode(savedMode)
  }, [])

  const toggleTheme = useCallback(() => {
    setMode(prev => {
      const newMode = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme-mode', newMode)
      return newMode
    })
  }, [])

  return (
    <ThemeModeContext.Provider value={{ mode, toggleTheme }}>
      {children}
    </ThemeModeContext.Provider>
  )
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext)
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider')
  }
  return context
} 