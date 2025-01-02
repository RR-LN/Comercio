type MessageHandler = (data: any) => void
type ErrorHandler = (error: any) => void

class WebSocketService {
  private socket: WebSocket | null = null
  private messageHandlers: Map<string, MessageHandler[]> = new Map()
  private errorHandlers: ErrorHandler[] = []
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout = 1000 // 1 segundo inicial

  constructor(private baseUrl: string) {}

  connect(token: string) {
    if (this.socket?.readyState === WebSocket.OPEN) return

    this.socket = new WebSocket(`${this.baseUrl}?token=${token}`)

    this.socket.onopen = () => {
      console.log('WebSocket conectado')
      this.reconnectAttempts = 0
      this.reconnectTimeout = 1000
    }

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        const { type, payload } = data

        const handlers = this.messageHandlers.get(type)
        if (handlers) {
          handlers.forEach(handler => handler(payload))
        }
      } catch (error) {
        console.error('Erro ao processar mensagem WebSocket:', error)
      }
    }

    this.socket.onerror = (error) => {
      console.error('Erro WebSocket:', error)
      this.errorHandlers.forEach(handler => handler(error))
    }

    this.socket.onclose = () => {
      console.log('WebSocket desconectado')
      this.handleReconnect()
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        console.log(`Tentativa de reconexão ${this.reconnectAttempts + 1}`)
        this.reconnectAttempts++
        this.reconnectTimeout *= 2 // Exponential backoff
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
        if (token) this.connect(token)
      }, this.reconnectTimeout)
    }
  }

  subscribe(type: string, handler: MessageHandler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, [])
    }
    this.messageHandlers.get(type)?.push(handler)
  }

  unsubscribe(type: string, handler: MessageHandler) {
    const handlers = this.messageHandlers.get(type)
    if (handlers) {
      this.messageHandlers.set(
        type,
        handlers.filter(h => h !== handler)
      )
    }
  }

  onError(handler: ErrorHandler) {
    this.errorHandlers.push(handler)
  }

  send(type: string, payload: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }))
    } else {
      console.error('WebSocket não está conectado')
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }
}

export const wsService = new WebSocketService(
  process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws'
) 