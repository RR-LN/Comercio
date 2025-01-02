'use client'

import { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Textarea,
  useToast,
  Progress,
  Avatar,
  IconButton,
  useColorModeValue
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaStar, FaThumbsUp, FaFlag } from 'react-icons/fa'
import { useAuth } from '@/contexts/AuthContext'

interface Rating {
  id: string
  userId: string
  userName: string
  userAvatar: string
  rating: number
  comment: string
  date: string
  helpful: number
  images?: string[]
}

interface RatingSystemProps {
  productId: string
  ratings: Rating[]
  averageRating: number
  totalRatings: number
  ratingCounts: Record<number, number>
  onAddRating: (rating: number, comment: string) => Promise<void>
  onMarkHelpful: (ratingId: string) => Promise<void>
  onReportRating: (ratingId: string) => Promise<void>
}

export const RatingSystem = ({
  productId,
  ratings,
  averageRating,
  totalRatings,
  ratingCounts,
  onAddRating,
  onMarkHelpful,
  onReportRating
}: RatingSystemProps) => {
  const [userRating, setUserRating] = useState(0)
  const [comment, setComment] = useState('')
  const [hoveredStar, setHoveredStar] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const toast = useToast()

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const handleSubmitRating = async () => {
    if (!user) {
      toast({
        title: 'Faça login para avaliar',
        status: 'warning',
        duration: 3000
      })
      return
    }

    if (userRating === 0) {
      toast({
        title: 'Selecione uma classificação',
        status: 'warning',
        duration: 3000
      })
      return
    }

    setIsSubmitting(true)
    try {
      await onAddRating(userRating, comment)
      setUserRating(0)
      setComment('')
      toast({
        title: 'Avaliação enviada com sucesso',
        status: 'success',
        duration: 3000
      })
    } catch (error) {
      toast({
        title: 'Erro ao enviar avaliação',
        status: 'error',
        duration: 3000
      })
    }
    setIsSubmitting(false)
  }

  return (
    <Box p={6} bg={bgColor} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
      {/* Resumo das Avaliações */}
      <HStack spacing={8} mb={8}>
        <VStack align="center" spacing={2}>
          <Text fontSize="4xl" fontWeight="bold">{averageRating.toFixed(1)}</Text>
          <HStack>
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                color={star <= averageRating ? 'gold' : 'gray.300'}
                size={20}
              />
            ))}
          </HStack>
          <Text color="gray.500">{totalRatings} avaliações</Text>
        </VStack>

        <VStack flex={1} spacing={2}>
          {[5, 4, 3, 2, 1].map((rating) => (
            <HStack key={rating} width="100%" spacing={4}>
              <Text fontSize="sm">{rating} estrelas</Text>
              <Progress
                value={(ratingCounts[rating] || 0) / totalRatings * 100}
                flex={1}
                size="sm"
                colorScheme="yellow"
                borderRadius="full"
              />
              <Text fontSize="sm" width="60px">
                {((ratingCounts[rating] || 0) / totalRatings * 100).toFixed(0)}%
              </Text>
            </HStack>
          ))}
        </VStack>
      </HStack>

      {/* Formulário de Avaliação */}
      <Box mb={8}>
        <Text fontWeight="bold" mb={4}>Avaliar Produto</Text>
        <VStack spacing={4} align="stretch">
          <HStack spacing={2}>
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.div
                key={star}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaStar
                  size={30}
                  style={{ cursor: 'pointer' }}
                  color={(hoveredStar || userRating) >= star ? 'gold' : 'gray.300'}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setUserRating(star)}
                />
              </motion.div>
            ))}
          </HStack>
          
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Compartilhe sua opinião sobre o produto..."
            rows={4}
          />
          
          <Button
            colorScheme="blue"
            isLoading={isSubmitting}
            onClick={handleSubmitRating}
          >
            Enviar Avaliação
          </Button>
        </VStack>
      </Box>

      {/* Lista de Avaliações */}
      <VStack spacing={4} align="stretch">
        {ratings.map((rating) => (
          <AnimatePresence key={rating.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Box
                p={4}
                borderWidth="1px"
                borderRadius="lg"
                borderColor={borderColor}
              >
                <HStack justify="space-between" mb={2}>
                  <HStack>
                    <Avatar size="sm" src={rating.userAvatar} name={rating.userName} />
                    <Text fontWeight="bold">{rating.userName}</Text>
                  </HStack>
                  <HStack>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        size={16}
                        color={star <= rating.rating ? 'gold' : 'gray.300'}
                      />
                    ))}
                  </HStack>
                </HStack>

                <Text mb={4}>{rating.comment}</Text>

                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.500">
                    {new Date(rating.date).toLocaleDateString()}
                  </Text>
                  <HStack>
                    <IconButton
                      aria-label="Marcar como útil"
                      icon={<FaThumbsUp />}
                      size="sm"
                      variant="ghost"
                      onClick={() => onMarkHelpful(rating.id)}
                    />
                    <Text fontSize="sm" color="gray.500">
                      {rating.helpful}
                    </Text>
                    <IconButton
                      aria-label="Reportar avaliação"
                      icon={<FaFlag />}
                      size="sm"
                      variant="ghost"
                      onClick={() => onReportRating(rating.id)}
                    />
                  </HStack>
                </HStack>
              </Box>
            </motion.div>
          </AnimatePresence>
        ))}
      </VStack>
    </Box>
  )
} 