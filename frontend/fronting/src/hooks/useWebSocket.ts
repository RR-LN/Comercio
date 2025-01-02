import { useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@chakra-ui/react'

interface UseWebSocketOptions {
  onMessage?: (data: any) => void
  onError?: (error: any) => void
  onClose?: () => void
  onOpen?: () => void
  autoReconnect?: boolean
  reconnectAttempts?: number
  reconnectInterval?: number
}

export function useWebSocket(path: string, options: UseWebSocketOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttemptsRef = useRef(0)
  const { user } = useAuth()
  const toast = useToast()

  const {
    onMessage,
    onError,
    onClose,
    onOpen,
    autoReconnect = true,
    reconnectAttempts = 5,
    reconnectInterval = 3000
  } = options

  const connect = useCallback(() => {
    if (!user) return

    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}${path}`)

    ws.onopen = () => {
      console.log('WebSocket conectado')
      reconnectAttemptsRef.current = 0
      onOpen?.()
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage?.(data)
      } catch (error) {
        console.error('Erro ao processar mensagem:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      onError?.(error)
    }

    ws.onclose = () => {
      console.log('WebSocket fechado')
      onClose?.()

      if (autoReconnect && reconnectAttemptsRef.current < reconnectAttempts) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++
          connect()
        }, reconnectInterval)
      } else if (reconnectAttemptsRef.current >= reconnectAttempts) {
        toast({
          title: 'Erro de conexão',
          description: 'Não foi possível reconectar ao servidor',
          status: 'error'
        })
      }
    }

    wsRef.current = ws
  }, [path, user, onMessage, onError, onClose, onOpen, autoReconnect, reconnectAttempts, reconnectInterval, toast])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    } else {
      console.error('WebSocket não está conectado')
    }
  }, [])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return {
    send,
    disconnect,
    reconnect: connect,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN
  }
} 