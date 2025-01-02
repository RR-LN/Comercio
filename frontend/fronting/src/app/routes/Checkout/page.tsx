'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Divider,
} from '@mui/material'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import { useAsyncOperation } from '@/contexts/LoadingContext'
import { ROUTES } from '@/utils/constants'
import { formatPrice } from '@/utils/helpers'
import AddressForm from './components/AddressForm'
import PaymentForm from './components/PaymentForm'
import OrderSummary from './components/OrderSummary'

const steps = ['Endereço de Entrega', 'Forma de Pagamento', 'Revisão do Pedido']

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { state: cartState, clearCart } = useCart()
  const { showNotification } = useNotification()
  const { withLoading } = useAsyncOperation()
  const [activeStep, setActiveStep] = useState(0)
  const [checkoutData, setCheckoutData] = useState({
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Brasil',
    },
    payment: {
      method: 'credit_card',
      cardNumber: '',
      cardName: '',
      cardExpiry: '',
      cardCvv: '',
    },
  })

  // Redireciona para o carrinho se estiver vazio
  if (cartState.items.length === 0) {
    router.push(ROUTES.CART)
    return null
  }

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1)
  }

  const handleAddressSubmit = (addressData: typeof checkoutData.address) => {
    setCheckoutData((prev) => ({
      ...prev,
      address: addressData,
    }))
    handleNext()
  }

  const handlePaymentSubmit = (paymentData: typeof checkoutData.payment) => {
    setCheckoutData((prev) => ({
      ...prev,
      payment: paymentData,
    }))
    handleNext()
  }

  const handlePlaceOrder = async () => {
    try {
      await withLoading(async () => {
        // TODO: Integrar com API de pagamento
        // Simula processamento do pedido
        await new Promise((resolve) => setTimeout(resolve, 2000))
        
        // Limpa o carrinho após o sucesso
        await clearCart()
        
        showNotification('Pedido realizado com sucesso!', 'success')
        router.push('/orders/success') // Redireciona para página de sucesso
      })
    } catch (error) {
      showNotification('Erro ao processar pedido', 'error')
    }
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <AddressForm
            initialData={checkoutData.address}
            onSubmit={handleAddressSubmit}
          />
        )
      case 1:
        return (
          <PaymentForm
            initialData={checkoutData.payment}
            onSubmit={handlePaymentSubmit}
          />
        )
      case 2:
        return (
          <OrderSummary
            items={cartState.items}
            address={checkoutData.address}
            payment={checkoutData.payment}
          />
        )
      default:
        return null
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Checkout
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {renderStepContent()}
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Resumo do Pedido
              </Typography>

              <Box sx={{ mb: 2 }}>
                {cartState.items.map((item) => (
                  <Box key={item.id} sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">
                        {item.quantity}x {item.name}
                      </Typography>
                      <Typography variant="body2">
                        {formatPrice(item.price * item.quantity)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal</Typography>
                  <Typography>
                    {formatPrice(
                      cartState.items.reduce((total, item) => total + item.price * item.quantity, 0)
                    )}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Frete</Typography>
                  <Typography>Grátis</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">
                  {formatPrice(
                    cartState.items.reduce((total, item) => total + item.price * item.quantity, 0)
                  )}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                {activeStep > 0 && (
                  <Button onClick={handleBack} variant="outlined" sx={{ flex: 1 }}>
                    Voltar
                  </Button>
                )}
                {activeStep === steps.length - 1 ? (
                  <Button
                    onClick={handlePlaceOrder}
                    variant="contained"
                    color="primary"
                    sx={{ flex: 1 }}
                  >
                    Finalizar Pedido
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    variant="contained"
                    color="primary"
                    sx={{ flex: 1 }}
                  >
                    Próximo
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}
