import { useEffect, useCallback, useState } from 'react'
import { useToast } from '@chakra-ui/react'
import { wsService } from '@/services/websocket'
import { useAuth } from '@/contexts/AuthContext'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useWebSocket } from '@/hooks/useWebSocket'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

export function useNotifications() {
  const { user } = useAuth()
  const toast = useToast()
  const ws = useWebSocket()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return
      try {
        const response = await fetch(`/api/notifications/${user.id}`)
        if (!response.ok) throw new Error('Failed to fetch notifications')
        const data = await response.json()
        setNotifications(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [user])

  // Marcar como lida
  const markAsRead = async (notificationId: string) => {
    const response = await fetch('/api/notifications/mark-read', {
      method: 'POST',
      body: JSON.stringify({ notificationId }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to mark notification as read');

    // Update local state to mark the notification as read
    setNotifications(notifications.map(notification => notification.id === notificationId ? { ...notification, read: true } : notification));
  };

  // Deletar notificação
  const deleteNotification = async (notificationId: string) => {
    const response = await fetch('/api/notifications/delete', {
      method: 'DELETE',
      body: JSON.stringify({ notificationId }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to delete notification');

    // Update local state to remove the deleted notification
    setNotifications(notifications.filter(notification => notification.id !== notificationId));
  };

  // Escutar por novas notificações via WebSocket
  useEffect(() => {
    if (!user || !ws) return

    ws.on('notification', (newNotification: Notification) => {
      setNotifications([newNotification, ...notifications])
    })

    return () => {
      ws.off('notification')
    }
  }, [user, ws, notifications])

  return {
    notifications,
    markAsRead,
    deleteNotification,
    isLoading: loading
  }
}