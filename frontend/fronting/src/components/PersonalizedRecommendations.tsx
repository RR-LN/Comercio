'use client'

import { useEffect, useState } from 'react'
import { Box, Grid, Heading, Text, useColorModeValue } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedProductCard } from './AnimatedProductCard'
import { useRecommendations } from '@/hooks/useRecommendations'

interface RecommendationsProps {
  userId: string
  currentProductId?: string
  category?: string
}

export const PersonalizedRecommendations = ({
  userId,
  currentProductId,
  category
}: RecommendationsProps) => {
  const { recommendations, isLoading } = useRecommendations({
    userId,
    currentProductId,
    category
  })

  const bgColor = useColorModeValue('gray.50', 'gray.900')

  return (
    <Box py={8} px={4} bg={bgColor} borderRadius="xl">
      <Heading size="lg" mb={6}>
        Recomendado para você
      </Heading>

      <AnimatePresence>
        <Grid
          templateColumns={{
            base: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)'
          }}
          gap={6}
        >
          {recommendations.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <AnimatedProductCard product={product} />
            </motion.div>
          ))}
        </Grid>
      </AnimatePresence>
    </Box>
  )
} 