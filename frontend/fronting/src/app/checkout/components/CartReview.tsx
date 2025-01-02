'use client'

import { memo } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Trash2, Minus, Plus, ArrowLeft, ArrowRight } from 'lucide-react'
import { CartItem } from '@/types'
import { formatCurrency } from '@/utils/format'

interface CartReviewProps {
  items: CartItem[]
  onNext: () => void
  onContinueShopping: () => void
}

export const CartReview = memo(function CartReview({
  items,
  onNext,
  onContinueShopping,
}: CartReviewProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <p className="text-muted-foreground">Seu carrinho está vazio</p>
        <Button asChild>
          <div onClick={onContinueShopping} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Continuar Comprando
          </div>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-10 text-center">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <CardFooter className="flex justify-between pt-6">
        <Button variant="ghost" onClick={onContinueShopping} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Continuar Comprando
        </Button>
        <Button onClick={onNext} className="gap-2">
          Próximo: Endereço
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </div>
  )
})
