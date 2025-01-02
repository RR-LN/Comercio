import { createContext, Dispatch, SetStateAction, useState } from 'react'

interface MyAppContextProps {
  mode: 'light' | 'dark'
  toggleTheme: () => void
}

const MyAppContext = createContext<MyAppContextProps>({
  mode: 'light',
  toggleTheme: () => {},
})

export const MyAppContextProvider: React.FC = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>(
    typeof window !== 'undefined' ? localStorage.getItem('theme') || 'light' : 'light'
  )

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light'
    setMode(newMode)
    localStorage.setItem('theme', newMode)
  }

  return (
    <MyAppContext.Provider value={{ mode, toggleTheme }}>
      {children}
    </MyAppContext.Provider>
  )
}

export default MyAppContext
