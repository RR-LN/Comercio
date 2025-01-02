'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  IconButton,
  Button,
  TextField,
  Divider,
  Alert,
} from '@mui/material'
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material'
import { useCart } from '@/contexts/CartContext'
import { useNotification } from '@/contexts/NotificationContext'
import { useAsyncOperation } from '@/contexts/LoadingContext'
import { ROUTES } from '@/utils/constants'
import { formatPrice } from '@/utils/helpers'

import { LoadingProvider } from '@/contexts/LoadingContext'

export default function CartPage() {
  return (
    <LoadingProvider>
      <CartContent />
    </LoadingProvider>
  )
}

function CartContent() {
  const { state: cartState, updateQuantity, removeItem } = useCart()
  const { showNotification } = useNotification()
  const { withLoading } = useAsyncOperation()
  const [couponCode, setCouponCode] = useState('')

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    try {
      if (newQuantity < 1) return
      await withLoading(async () => {
        await updateQuantity(productId, newQuantity)
      })
    } catch (error) {
      showNotification('Erro ao atualizar quantidade', 'error')
    }
  }

  const handleRemoveItem = async (productId: string) => {
    try {
      await withLoading(async () => {
        await removeItem(productId)
      })
      showNotification('Item removido do carrinho', 'success')
    } catch (error) {
      showNotification('Erro ao remover item', 'error')
    }
  }

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      showNotification('Digite um cupom válido', 'warning')
      return
    }
    // TODO: Implementar lógica de cupom
    showNotification('Funcionalidade em desenvolvimento', 'info')
  }

  const calculateSubtotal = () => {
    return cartState.items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const calculateShipping = () => {
    // TODO: Implementar cálculo de frete
    return 0
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping()
  }

  if (cartState.items.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ShoppingCartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Seu carrinho está vazio
          </Typography>
          <Typography color="text.secondary" paragraph>
            Adicione produtos ao seu carrinho para continuar comprando.
          </Typography>
          <Button
            component={Link}
            href={ROUTES.PRODUCTS}
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 2 }}
          >
            Ver Produtos
          </Button>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Carrinho de Compras
      </Typography>

      <Grid container spacing={4}>
        {/* Lista de Itens */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            {cartState.items.map((item) => (
              <Box key={item.id}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={3} sm={2}>
                    <Box sx={{ position: 'relative', paddingTop: '100%' }}>
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={9} sm={10}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1">{item.name}</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {formatPrice(item.price * item.quantity)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {formatPrice(item.price)} cada
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveItem(item.id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Resumo do Pedido */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resumo do Pedido
            </Typography>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Cupom de desconto"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Button
                fullWidth
                variant="outlined"
                onClick={handleApplyCoupon}
                disabled={!couponCode.trim()}
              >
                Aplicar Cupom
              </Button>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal</Typography>
                <Typography>{formatPrice(calculateSubtotal())}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Frete</Typography>
                <Typography>{formatPrice(calculateShipping())}</Typography>
              </Box>
              {calculateShipping() === 0 && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Frete grátis para esta compra!
                </Alert>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6">{formatPrice(calculateTotal())}</Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              component={Link}
              href={ROUTES.CHECKOUT}
            >
              Finalizar Compra
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}