'use client'

import { Box, useColorModeValue } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  onClick?: () => void
  isHoverable?: boolean
  isClickable?: boolean
  className?: string
}

export function Card({
  children,
  onClick,
  isHoverable = true,
  isClickable = false,
  className = '',
}: CardProps) {
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <motion.div
      whileHover={isHoverable ? { y: -4 } : undefined}
      whileTap={isClickable ? { scale: 0.98 } : undefined}
    >
      <Box
        bg={bg}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="xl"
        overflow="hidden"
        boxShadow="lg"
        transition="all 0.2s"
        onClick={onClick}
        cursor={isClickable ? 'pointer' : 'default'}
        className={className}
      >
        {children}
      </Box>
    </motion.div>
  )
} 