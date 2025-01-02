'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/utils/constants'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Steps, Step } from '@/components/ui/steps'
import { Separator } from '@/components/ui/separator'
import { ShoppingCart, MapPin, CreditCard, Check } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { CartReview } from './components/CartReview'
import { ShippingForm } from './components/ShippingForm'
import { PaymentForm } from './components/PaymentForm'
import { ConfirmationStep } from './components/ConfirmationStep'
import { OrderSummary } from './components/OrderSummary'

const steps = [
  { title: 'Carrinho', icon: ShoppingCart },
  { title: 'Endereço', icon: MapPin },
  { title: 'Pagamento', icon: CreditCard },
  { title: 'Confirmação', icon: Check },
]

export default function CheckoutPage() {
  const [activeStep, setActiveStep] = useState(0)
  const [orderData, setOrderData] = useState({
    shipping: {},
    payment: {},
  })
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const handleShippingSubmit = (data: any) => {
    setOrderData(prev => ({ ...prev, shipping: data }))
    setActiveStep(2)
  }

  const handlePaymentSubmit = async (data: any) => {
    try {
      setOrderData(prev => ({ ...prev, payment: data }))
      setActiveStep(3)
    } catch (error: any) {
      toast({
        title: 'Erro no pagamento',
        description: error.message,
      })
    }
  }

  const handleFinishOrder = async () => {
    try {
      await clearCart()
      router.push(ROUTES.ORDERS)
    } catch (error: any) {
      toast({
        title: 'Erro ao finalizar pedido',
        description: error.message,
      })
    }
  }

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <CartReview
            items={items}
            onNext={() => setActiveStep(1)}
            onContinueShopping={() => router.push(ROUTES.PRODUCTS)}
          />
        )
      case 1:
        return (
          <ShippingForm
            defaultValues={user?.address}
            onSubmit={handleShippingSubmit}
            onBack={() => setActiveStep(0)}
          />
        )
      case 2:
        return (
          <PaymentForm
            amount={total}
            onSubmit={handlePaymentSubmit}
            onBack={() => setActiveStep(1)}
          />
        )
      case 3:
        return (
          <ConfirmationStep
            orderData={orderData}
            onFinish={handleFinishOrder}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-center">Finalizar Compra</h1>

        <Steps activeStep={activeStep}>
          {steps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              icon={step.icon}
            />
          ))}
        </Steps>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          <Card>
            <CardHeader>
              <CardTitle>{steps[activeStep].title}</CardTitle>
            </CardHeader>
            <CardContent>
              {renderStep()}
            </CardContent>
          </Card>

          <div className="sticky top-4">
            <OrderSummary
              items={items}
              shipping={orderData.shipping}
              payment={orderData.payment}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
