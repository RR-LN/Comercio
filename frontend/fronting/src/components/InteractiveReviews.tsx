'use client'

import { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  Button,
  Avatar,
  useColorModeValue
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaStar } from 'react-icons/fa'

interface Review {
  id: string
  user: {
    name: string
    avatar: string
  }
  rating: number
  comment: string
  date: string
  helpful: number
}

export const InteractiveReviews = ({ reviews }: { reviews: Review[] }) => {
  const [filter, setFilter] = useState<number | null>(null)
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set())

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // ... resto do código continua igual
} 