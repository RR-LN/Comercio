'use client'

import { useState, useEffect } from 'react'
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Pagination,
  Skeleton,
  Alert,
} from '@mui/material'
import {
  Visibility as VisibilityIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useAsyncOperation } from '@/contexts/LoadingContext'
import { useNotification } from '@/contexts/NotificationContext'
import { orderService } from '@/services/api'
import { Order, OrdersResponse } from '@/types/api'
import { formatPrice } from '@/utils/helpers'

const ITEMS_PER_PAGE = 10

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  pending: 'warning',
  processing: 'info',
  paid: 'primary',
  shipped: 'secondary',
  delivered: 'success',
  cancelled: 'error',
}

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  processing: 'Processando',
  paid: 'Pago',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

export default function OrdersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { withLoading } = useAsyncOperation()
  const { showNotification } = useNotification()
  const [orders, setOrders] = useState<Order[]>([])
  const [totalOrders, setTotalOrders] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    loadOrders()
  }, [user, currentPage, router])

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await withLoading<OrdersResponse>(() =>
        orderService.getOrders({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        })
      )

      setOrders(response.orders)
      setTotalOrders(response.total)
    } catch (err) {
      setError('Erro ao carregar pedidos. Tente novamente mais tarde.')
      showNotification('Erro ao carregar pedidos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page)
  }

  const handleViewOrder = (orderId: string) => {
    router.push(`/orders/${orderId}`)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  if (!user) {
    return null
  }

  const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE)

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Meus Pedidos
        </Typography>
        <Typography color="text.secondary">
          Acompanhe o status e histórico dos seus pedidos
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Número do Pedido</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from(new Array(5)).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                  </TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <ReceiptIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Nenhum pedido encontrado
                    </Typography>
                    <Typography color="text.secondary" paragraph>
                      Você ainda não realizou nenhum pedido.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => router.push('/products')}
                    >
                      Começar a Comprar
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>#{order.id.slice(-6).toUpperCase()}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <Chip
                        label={statusLabels[order.status]}
                        color={statusColors[order.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {formatPrice(order.total)}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleViewOrder(order.id)}
                        size="small"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </Paper>
    </Container>
  )
}
