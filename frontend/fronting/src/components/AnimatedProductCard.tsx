'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  isNew?: boolean
  isOnSale?: boolean
}

interface AnimatedProductCardProps {
  product: Product
}

export const AnimatedProductCard = ({ product }: AnimatedProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false)

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="product-card group"
    >
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-lg mb-4">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-2">
            {product.isNew && (
              <span className="badge-new">Novo</span>
            )}
            {product.isOnSale && (
              <span className="badge-sale">-{discount}%</span>
            )}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent"
          >
            <div className="flex justify-center gap-2">
              <button className="btn-primary py-1 px-3 text-sm">
                Comprar Agora
              </button>
              <button className="btn-secondary py-1 px-3 text-sm">
                + Carrinho
              </button>
            </div>
          </motion.div>
        </div>

        <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-2">
          <span className="price-tag">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(product.price)}
          </span>
          
          {product.originalPrice && (
            <span className="price-tag-original">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(product.originalPrice)}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  )
}