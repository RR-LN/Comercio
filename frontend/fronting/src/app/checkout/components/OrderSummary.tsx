'use client'

import { memo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CartItem } from '@/types'
import { formatCurrency } from '@/utils/format'

interface OrderSummaryProps {
  items: CartItem[]
  shipping: any
  payment: any
}

export const OrderSummary = memo(function OrderSummary({
  items,
  shipping,
  payment,
}: OrderSummaryProps) {
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
  const shippingCost = 0 // Implementar cálculo de frete
  const discount = 0 // Implementar desconto
  const total = subtotal + shippingCost - discount

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo do Pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex justify-between">
              <span>
                {item.name} ({item.quantity}x)
              </span>
              <span className="font-medium">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Frete</span>
            <span>
              {shippingCost === 0 ? 'Grátis' : formatCurrency(shippingCost)}
            </span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Desconto</span>
              <span className="text-green-500">
                -{formatCurrency(discount)}
              </span>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>

        {shipping.zipCode && (
          <div className="space-y-2">
            <h3 className="font-medium">Endereço de Entrega</h3>
            <p className="text-sm text-muted-foreground">
              {shipping.street}, {shipping.number}
              {shipping.complement && ` - ${shipping.complement}`}
              <br />
              {shipping.neighborhood}
              <br />
              {shipping.city} - {shipping.state}
              <br />
              CEP: {shipping.zipCode}
            </p>
          </div>
        )}

        {payment.method && (
          <div className="space-y-2">
            <h3 className="font-medium">Forma de Pagamento</h3>
            <p className="text-sm text-muted-foreground">
              {payment.method === 'credit_card' && 'Cartão de Crédito'}
              {payment.method === 'pix' && 'PIX'}
              {payment.method === 'bank_slip' && 'Boleto Bancário'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
