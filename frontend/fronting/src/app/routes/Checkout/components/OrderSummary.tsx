'use client'

import Image from 'next/image'
import {
  Grid,
  Typography,
  Box,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material'
import { CartItem } from '@/types'
import { formatPrice } from '@/utils/helpers'

interface OrderSummaryProps {
  items: CartItem[]
  address: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  payment: {
    method: 'credit_card' | 'debit_card' | 'pix' | 'bank_slip'
    cardNumber?: string
    cardName?: string
    cardExpiry?: string
  }
}

export default function OrderSummary({ items, address, payment }: OrderSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 0 // Implementar cálculo de frete
  const total = subtotal + shipping

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'credit_card':
        return 'Cartão de Crédito'
      case 'pix':
        return 'PIX'
      case 'bank_slip':
        return 'Boleto'
      default:
        return method
    }
  }

  const formatCardNumber = (number?: string) => {
    if (!number) return ''
    return `•••• ${number.slice(-4)}`
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Resumo do Pedido
        </Typography>
      </Grid>

      {/* Itens do Pedido */}
      <Grid item xs={12}>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Itens do Pedido
          </Typography>
          <List disablePadding>
            {items.map((item) => (
              <ListItem key={item.id} sx={{ py: 1, px: 0 }}>
                <ListItemAvatar>
                  <Avatar variant="rounded" sx={{ width: 60, height: 60 }}>
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
                <Typography variant="body2">
                  {formatPrice(item.price * item.quantity)}
                </Typography>
              </ListItem>
            ))}
            <Divider sx={{ my: 2 }} />
            <ListItem sx={{ py: 1, px: 0 }}>
              <ListItemText primary="Subtotal" />
              <Typography variant="subtitle1">
                {formatPrice(subtotal)}
              </Typography>
            </ListItem>
            <ListItem sx={{ py: 1, px: 0 }}>
              <ListItemText primary="Frete" />
              <Typography variant="subtitle1">
                {shipping === 0 ? 'Grátis' : formatPrice(shipping)}
              </Typography>
            </ListItem>
            <ListItem sx={{ py: 1, px: 0 }}>
              <ListItemText primary="Total" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {formatPrice(total)}
              </Typography>
            </ListItem>
          </List>
        </Paper>
      </Grid>

      {/* Endereço de Entrega */}
      <Grid item xs={12} md={6}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Endereço de Entrega
          </Typography>
          <Typography variant="body2">
            {address.street}, {address.number}
            {address.complement && ` - ${address.complement}`}
            <br />
            {address.neighborhood}
            <br />
            {address.city} - {address.state}
            <br />
            CEP: {address.zipCode}
            <br />
            {address.country}
          </Typography>
        </Paper>
      </Grid>

      {/* Forma de Pagamento */}
      <Grid item xs={12} md={6}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Forma de Pagamento
          </Typography>
          <Typography variant="body2">
            {getPaymentMethodLabel(payment.method)}
            {payment.method === 'credit_card' && payment.cardNumber && (
              <>
                <br />
                {payment.cardName}
                <br />
                {formatCardNumber(payment.cardNumber)}
                <br />
                Validade: {payment.cardExpiry}
              </>
            )}
          </Typography>
        </Paper>
      </Grid>

      {/* Observações */}
      <Grid item xs={12}>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            * Após a confirmação do pedido, você receberá um e-mail com os detalhes da compra.
            {payment.method === 'pix' && (
              ' O QR Code para pagamento será exibido na próxima tela.'
            )}
            {payment.method === 'bank_slip' && (
              ' O boleto será gerado e enviado para seu e-mail.'
            )}
          </Typography>
        </Box>
      </Grid>
    </Grid>
  )
}
