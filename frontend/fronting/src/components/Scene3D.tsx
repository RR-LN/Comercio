'use client'

import { Box, Text, useColorModeValue } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const AnimatedBox = motion(Box)

export default function Scene3D() {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const textColor = useColorModeValue('gray.600', 'gray.300')

  return (
    <AnimatedBox
      className="w-full h-96 rounded-xl overflow-hidden"
      bg={bgColor}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      gap={4}
    >
      <Text fontSize="xl" color={textColor}>
        Visualização 3D em desenvolvimento
      </Text>
      <Text fontSize="sm" color={textColor}>
        Em breve, uma experiência interativa incrível!
      </Text>
    </AnimatedBox>
  )
} 