'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useProduct } from '@/hooks/useProduct'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { formatCurrency } from '@/utils/format'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Heart, ShoppingCart, Star, Truck, Shield } from 'lucide-react'

export default function ProductPage({ params }: { params: { id: string } }) {
  const [quantity, setQuantity] = useState(1)
  const { data: product, isLoading } = useProduct(params.id)
  const { addItem } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  const handleAddToCart = () => {
    if (product) {
      addItem({ ...product, quantity })
      // Implementar notificação de sucesso
    }
  }

  if (isLoading) return <div>Carregando...</div>
  if (!product) return <div>Produto não encontrado</div>

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative h-[500px] rounded-lg overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex gap-2 mb-2">
              {product.isNew && (
                <Badge variant="secondary">Novo</Badge>
              )}
              {product.discount && product.discount > 0 && (
                <Badge variant="destructive">-{product.discount}%</Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span>{product.rating}</span>
              <span className="text-muted-foreground">(150 avaliações)</span>
            </div>

            <div className="text-2xl font-bold text-primary">
              {formatCurrency(product.price)}
            </div>
            {product.oldPrice && (
              <div className="text-muted-foreground line-through">
                {formatCurrency(product.oldPrice)}
              </div>
            )}
          </div>

          <div>
            <p className="text-muted-foreground mb-4">
              {product.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Button onClick={handleAddToCart} className="flex-1">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Adicionar ao Carrinho
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)}
              >
                <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'text-red-500 fill-red-500' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                <CardTitle className="text-sm">Entrega Grátis</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <CardTitle className="text-sm">Garantia de 1 ano</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="specs">Especificações</TabsTrigger>
              <TabsTrigger value="reviews">Avaliações</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">
                    {product.description}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="specs">
              <Card>
                <CardContent className="pt-6">
                  {/* Add specifications here */}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reviews">
              <Card>
                <CardContent className="pt-6">
                  {/* Add reviews here */}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
