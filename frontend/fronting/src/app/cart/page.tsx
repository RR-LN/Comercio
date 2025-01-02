'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import { formatCurrency } from '@/utils/format'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Trash2, Minus, Plus, ArrowLeft, CreditCard } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCart()
  
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const shipping = subtotal > 100 ? 0 : 15
  const total = subtotal + shipping

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    updateQuantity(productId, newQuantity)
  }

  const handleRemoveItem = (productId: string) => {
    removeItem(productId)
    toast({
      title: 'Item removido',
      description: 'O item foi removido do seu carrinho',
    })
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-2xl font-bold">Seu carrinho está vazio</h1>
          <p className="text-muted-foreground">Adicione alguns produtos para começar</p>
          <Button asChild>
            <Link href="/products" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Continuar Comprando
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        {/* Cart Items */}
        <div>
          <h1 className="text-2xl font-bold mb-6">Carrinho de Compras</h1>
          <div className="space-y-4">
            {items.map(item => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-[100px_1fr] gap-4">
                    {/* Product Image */}
                    <div className="relative h-24 rounded-md overflow-hidden">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col justify-between">
                      <div>
                        <h2 className="font-medium">{item.name}</h2>
                        <p className="text-primary font-medium">
                          {formatCurrency(item.price)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                            type="number"
                            min={1}
                            max={99}
                            className="w-20 text-center"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span>{shipping === 0 ? 'Grátis' : formatCurrency(shipping)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span className="text-lg">{formatCurrency(total)}</span>
                </div>
              </div>

              <Button asChild className="w-full gap-2">
                <Link href="/checkout">
                  <CreditCard className="h-4 w-4" />
                  Finalizar Compra
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full gap-2">
                <Link href="/products">
                  <ArrowLeft className="h-4 w-4" />
                  Continuar Comprando
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
