'use client'

import { createContext, useContext, useReducer, useCallback } from 'react'
import { Backdrop, CircularProgress } from '@mui/material'

interface LoadingState {
  isLoading: boolean
  loadingCount: number
}

type LoadingAction =
  | { type: 'START_LOADING' }
  | { type: 'STOP_LOADING' }

interface LoadingContextType {
  isLoading: boolean
  startLoading: () => void
  stopLoading: () => void
  withLoading: <T>(operation: () => Promise<T>) => Promise<T>
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

const initialState: LoadingState = {
  isLoading: false,
  loadingCount: 0,
}

function loadingReducer(state: LoadingState, action: LoadingAction): LoadingState {
  switch (action.type) {
    case 'START_LOADING':
      return {
        ...state,
        loadingCount: state.loadingCount + 1,
        isLoading: true,
      }
    case 'STOP_LOADING':
      const newCount = Math.max(0, state.loadingCount - 1)
      return {
        ...state,
        loadingCount: newCount,
        isLoading: newCount > 0,
      }
    default:
      return state
  }
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(loadingReducer, initialState)

  const startLoading = useCallback(() => {
    dispatch({ type: 'START_LOADING' })
  }, [])

  const stopLoading = useCallback(() => {
    dispatch({ type: 'STOP_LOADING' })
  }, [])

  const withLoading = useCallback(async <T,>(operation: () => Promise<T>): Promise<T> => {
    try {
      startLoading()
      return await operation()
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading])

  return (
    <LoadingContext.Provider
      value={{
        isLoading: state.isLoading,
        startLoading,
        stopLoading,
        withLoading,
      }}
    >
      {children}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        }}
        open={state.isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

// Hook utilitário para operações assíncronas
export function useAsyncOperation() {
  const { withLoading } = useLoading()
  return { withLoading }
}
