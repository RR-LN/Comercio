'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
} from '@mui/material'
import {
  CheckCircleOutline as CheckIcon,
  ShoppingBag as ShoppingBagIcon,
  Home as HomeIcon,
} from '@mui/icons-material'
import { ROUTES } from '@/utils/constants'
import { useAuth } from '@/contexts/AuthContext'

export default function OrderSuccessPage() {
  const router = useRouter()
  const { user } = useAuth()

  // Redireciona para home se não houver usuário autenticado
  useEffect(() => {
    if (!user) {
      router.push(ROUTES.HOME)
    }
  }, [user, router])

  if (!user) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: 'center',
          backgroundColor: 'transparent',
        }}
      >
        <CheckIcon
          sx={{
            fontSize: 80,
            color: 'success.main',
            mb: 2,
          }}
        />

        <Typography variant="h4" gutterBottom>
          Pedido Realizado com Sucesso!
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
          Obrigado por sua compra! Enviamos um e-mail com todos os detalhes do seu pedido.
        </Typography>

        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography variant="body2" color="text.secondary" paragraph>
            Você pode acompanhar o status do seu pedido na área "Meus Pedidos".
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={() => router.push(ROUTES.HOME)}
          >
            Voltar para Home
          </Button>
          <Button
            variant="contained"
            startIcon={<ShoppingBagIcon />}
            onClick={() => router.push('/orders')}
          >
            Meus Pedidos
          </Button>
        </Box>
      </Paper>

      {/* Informações Adicionais */}
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Informações Importantes:
          </Typography>
          <Typography variant="body2" color="text.secondary" component="div">
            <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
              <li>Você receberá atualizações sobre o status do seu pedido por e-mail.</li>
              <li>O prazo de entrega começa a contar após a confirmação do pagamento.</li>
              <li>
                Em caso de dúvidas, entre em contato com nosso suporte através do e-mail{' '}
                <a href="mailto:suporte@minhaloja.com" style={{ color: 'inherit' }}>
                  suporte@minhaloja.com
                </a>
              </li>
            </ul>
          </Typography>
        </Paper>
      </Box>

      {/* Promoções */}
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Typography variant="subtitle2" gutterBottom>
            🎉 Oferta Especial
          </Typography>
          <Typography variant="body2" paragraph>
            Ganhe 10% de desconto na sua próxima compra usando o cupom:
          </Typography>
          <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
            VOLTA10
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}
