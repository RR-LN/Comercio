'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Skeleton,
  Alert,
  Stack,
} from '@mui/material'
import {
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material'
import { useAuth } from '@/contexts/AuthContext'
import { useAsyncOperation } from '@/contexts/LoadingContext'
import { useNotification } from '@/contexts/NotificationContext'
import { orderService } from '@/services/api'
import { Order } from '@/types'
import { formatPrice } from '@/utils/helpers'

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

const StatusStep = ({ 
  icon: Icon, 
  title, 
  date, 
  isActive, 
  isCompleted,
  info 
}: { 
  icon: React.ElementType
  title: string
  date?: string
  isActive: boolean
  isCompleted: boolean
  info?: string
}) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: isCompleted ? 'success.main' : isActive ? 'primary.main' : 'grey.300',
        color: isCompleted || isActive ? 'white' : 'grey.600',
        mr: 2,
      }}
    >
      <Icon />
    </Box>
    <Box>
      <Typography variant="subtitle2">{title}</Typography>
      {date && (
        <Typography variant="body2" color="text.secondary">
          {date}
        </Typography>
      )}
      {info && (
        <Typography variant="body2" color="text.secondary">
          {info}
        </Typography>
      )}
    </Box>
  </Box>
)

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { withLoading } = useAsyncOperation()
  const { showNotification } = useNotification()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    loadOrder()
  }, [user, router])

  const loadOrder = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await withLoading(() =>
        orderService.getOrder(params?.id as string)
      )

      setOrder(response.orders[0])
    } catch (err) {
      setError('Erro ao carregar detalhes do pedido. Tente novamente mais tarde.')
      showNotification('Erro ao carregar pedido', 'error')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="text" width={300} />
        </Box>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
        </Grid>
      </Container>
    )
  }

  if (error || !order) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error || 'Pedido não encontrado'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/orders')}
        >
          Voltar para Meus Pedidos
        </Button>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/orders')}
          sx={{ mb: 2 }}
        >
          Voltar para Meus Pedidos
        </Button>
        <Typography variant="h4" gutterBottom>
          Pedido #{order.id.slice(-6).toUpperCase()}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography color="text.secondary">
            Realizado em {formatDate(order.createdAt)}
          </Typography>
          <Chip
            label={statusLabels[order.status]}
            color={statusColors[order.status]}
          />
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Detalhes do Pedido */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Itens do Pedido
            </Typography>
            <List>
              {order.items.map((item) => (
                <ListItem key={item.id} sx={{ py: 2 }}>
                  <ListItemAvatar>
                    <Avatar variant="rounded" sx={{ width: 80, height: 80 }}>
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.name}
                    secondary={`Quantidade: ${item.quantity}`}
                    sx={{ ml: 2 }}
                  />
                  <Typography>
                    {formatPrice(item.price * item.quantity)}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Status do Pedido */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Status do Pedido
            </Typography>
            <Stack spacing={2}>
              <StatusStep
                icon={ReceiptIcon}
                title="Pedido Realizado"
                date={formatDate(order.createdAt)}
                isActive={order.status === 'pending'}
                isCompleted={['processing', 'paid', 'shipped', 'delivered'].includes(order.status)}
              />
              <StatusStep
                icon={PaymentIcon}
                title="Pagamento Confirmado"
                date={order.status !== 'pending' ? formatDate(order.updatedAt) : undefined}
                isActive={order.status === 'paid'}
                isCompleted={['shipped', 'delivered'].includes(order.status)}
              />
              <StatusStep
                icon={ShippingIcon}
                title="Em Transporte"
                info={order.status === 'shipped' && order.trackingCode ? `Código de Rastreio: ${order.trackingCode}` : undefined}
                isActive={order.status === 'shipped'}
                isCompleted={order.status === 'delivered'}
              />
              <StatusStep
                icon={CheckCircleIcon}
                title="Entregue"
                date={order.status === 'delivered' ? formatDate(order.updatedAt) : undefined}
                isActive={false}
                isCompleted={order.status === 'delivered'}
              />
            </Stack>
          </Paper>
        </Grid>

        {/* Resumo e Informações Adicionais */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resumo do Pedido
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal</Typography>
                <Typography>{formatPrice(order.total)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Frete</Typography>
                <Typography>Grátis</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1">Total</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {formatPrice(order.total)}
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Endereço de Entrega
            </Typography>
            <Typography variant="body2">
              {order.shippingAddress.street}, {order.shippingAddress.number}
              {order.shippingAddress.complement && ` - ${order.shippingAddress.complement}`}
              <br />
              {order.shippingAddress.neighborhood}
              <br />
              {order.shippingAddress.city} - {order.shippingAddress.state}
              <br />
              CEP: {order.shippingAddress.zipCode}
            </Typography>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Forma de Pagamento
            </Typography>
            <Typography variant="body2">
              {order.paymentMethod === 'credit_card' && 'Cartão de Crédito'}
              {order.paymentMethod === 'pix' && 'PIX'}
              {order.paymentMethod === 'bank_slip' && 'Boleto Bancário'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}
