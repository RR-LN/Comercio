.'use client'

import { memo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { CheckCircle, ShoppingBag, Mail, MessageCircle, Home } from 'lucide-react'
import { formatCurrency } from '@/utils/format'
import { ROUTES } from '@/utils/constants'

interface ConfirmationStepProps {
  orderData: {
    orderId?: string
    total?: number
    shipping: any
    payment: any
  }
  onFinish: () => void
}

export const ConfirmationStep = memo(function ConfirmationStep({
  orderData,
  onFinish,
}: ConfirmationStepProps) {
  const getPaymentMethodText = () => {
    switch (orderData.payment.method) {
      case 'credit_card':
        return `Cartão de crédito terminado em ${orderData.payment.cardNumber?.slice(-4)}`
      case 'pix':
        return 'PIX (Pagamento Instantâneo)'
      case 'bank_slip':
        return 'Boleto Bancário'
      default:
        return 'Forma de pagamento não especificada'
    }
  }

  return (
    <div className="space-y-8">
      {/* Sucesso */}
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="mt-4 text-green-500">
            Pedido Confirmado!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Seu pedido #{orderData.orderId} foi realizado com sucesso
          </p>
        </CardContent>
      </Card>

      {/* Detalhes do Pedido */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <div>
              <span className="font-medium">Valor Total:</span>
              <span className="ml-2">{formatCurrency(orderData.total || 0)}</span>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Home className="h-5 w-5 text-primary" />
            <div>
              <span className="font-medium">Endereço de Entrega:</span>
              <div className="text-muted-foreground mt-1">
                {orderData.shipping.street}, {orderData.shipping.number}
                {orderData.shipping.complement && ` - ${orderData.shipping.complement}`}
                <br />
                {orderData.shipping.neighborhood}
                <br />
                {orderData.shipping.city} - {orderData.shipping.state}
                <br />
                CEP: {orderData.shipping.zipCode}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <CheckCircle className="h-5 w-5 text-primary" />
            <div>
              <span className="font-medium">Forma de Pagamento:</span>
              <span className="ml-2">{getPaymentMethodText()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Próximos Passos */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Mail className="h-5 w-5 text-primary" />
            <span>Você receberá um e-mail com os detalhes do pedido</span>
          </div>

          {orderData.payment.method === 'bank_slip' && (
            <div className="flex items-center gap-4">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>O boleto será enviado para seu e-mail</span>
            </div>
          )}

          <div className="flex items-center gap-4">
            <MessageCircle className="h-5 w-5 text-primary" />
            <span>Acompanhe seu pedido pelo WhatsApp</span>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="space-y-4">
        <Button
          className="w-full"
          size="lg"
          onClick={onFinish}
        >
          Acompanhar Pedido
        </Button>

        <Button
          asChild
          variant="outline"
          className="w-full"
        >
          <Link href={ROUTES.PRODUCTS}>
            Continuar Comprando
          </Link>
        </Button>
      </div>

      {/* Suporte */}
      <p className="text-sm text-muted-foreground text-center">
        Precisa de ajuda? Entre em contato com nosso{' '}
        <Button
          variant="link"
          className="h-auto p-0"
          onClick={() => {/* Implementar chat/suporte */}}
        >
          suporte
        </Button>
      </p>
    </div>
  )
})
