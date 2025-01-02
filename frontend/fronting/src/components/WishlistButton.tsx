'use client'

import { useState } from 'react'
import { IconButton, useToast } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaHeart } from 'react-icons/fa'
import { useWishlist } from '@/hooks/useWishlist'

interface WishlistButtonProps {
  productId: string
  size?: 'sm' | 'md' | 'lg'
}

export const WishlistButton = ({ productId, size = 'md' }: WishlistButtonProps) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [isAnimating, setIsAnimating] = useState(false)
  const toast = useToast()

  const handleClick = async () => {
    setIsAnimating(true)
    try {
      if (isInWishlist(productId)) {
        await removeFromWishlist(productId)
        toast({
          title: 'Removido da lista de desejos',
          status: 'info',
          duration: 2000
        })
      } else {
        await addToWishlist(productId)
        toast({
          title: 'Adicionado à lista de desejos',
          status: 'success',
          duration: 2000
        })
      }
    } catch (error) {
      toast({
        title: 'Erro ao atualizar lista de desejos',
        status: 'error',
        duration: 2000
      })
    }
    setIsAnimating(false)
  }

  return (
    <AnimatePresence>
      <motion.div
        whileTap={{ scale: 0.9 }}
        animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
      >
        <IconButton
          aria-label="Adicionar à lista de desejos"
          icon={<FaHeart />}
          size={size}
          variant="ghost"
          color={isInWishlist(productId) ? 'red.500' : 'gray.400'}
          onClick={handleClick}
          _hover={{
            color: 'red.500',
            transform: 'scale(1.1)'
          }}
          transition="all 0.2s"
        />
      </motion.div>
    </AnimatePresence>
  )
} 