'use client'

import { Box, Container, Grid, Heading, Text, VStack, useColorModeValue, Icon } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FaDrum, FaMask, FaPyramid, FaLeaf, FaSun, FaMoon } from 'react-icons/fa'

const MotionBox = motion(Box)

interface CulturalFeature {
  icon: any
  title: string
  description: string
  culture: 'mozambique' | 'egypt' | 'modern'
}

const culturalFeatures: CulturalFeature[] = [
  {
    icon: FaDrum,
    title: 'Timbila',
    description: 'Instrumento tradicional moçambicano, símbolo da nossa música',
    culture: 'mozambique'
  },
  {
    icon: FaPyramid,
    title: 'Pirâmides',
    description: 'A grandeza da arquitetura egípcia milenar',
    culture: 'egypt'
  },
  {
    icon: FaMask,
    title: 'Mapiko',
    description: 'Dança tradicional com máscaras do norte de Moçambique',
    culture: 'mozambique'
  },
  {
    icon: FaSun,
    title: 'Rá',
    description: 'O deus sol egípcio, símbolo de vida e poder',
    culture: 'egypt'
  },
  {
    icon: FaLeaf,
    title: 'Capulana',
    description: 'Tecido tradicional moçambicano com cores vibrantes',
    culture: 'mozambique'
  },
  {
    icon: FaMoon,
    title: 'Khonsu',
    description: 'Deus egípcio da lua e do tempo',
    culture: 'egypt'
  }
]

export function CulturalSection() {
  const bgGradient = useColorModeValue(
    'linear(to-b, rgba(246, 227, 206, 0.5), rgba(255, 255, 255, 0.8))',
    'linear(to-b, rgba(26, 32, 44, 0.8), rgba(45, 55, 72, 0.8))'
  )

  const getCultureColor = (culture: string) => {
    switch (culture) {
      case 'mozambique':
        return 'var(--color-mozambique-green)'
      case 'egypt':
        return 'var(--color-egypt-gold)'
      default:
        return 'var(--color-modern-accent)'
    }
  }

  return (
    <Box
      position="relative"
      py={20}
      className="cultural-pattern"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgGradient,
        zIndex: -1
      }}
    >
      <Container maxW="container.xl">
        <VStack spacing={12}>
          <Heading
            className="cultural-heading"
            fontSize={{ base: '3xl', md: '5xl' }}
            textAlign="center"
            bgGradient="linear(to-r, var(--color-mozambique-red), var(--color-egypt-gold))"
            bgClip="text"
          >
            Nossa Herança Cultural
          </Heading>

          <Grid
            templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
            gap={8}
          >
            {culturalFeatures.map((feature, index) => (
              <MotionBox
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                p={6}
                bg={useColorModeValue('white', 'gray.800')}
                borderRadius="xl"
                boxShadow="xl"
                borderLeft="4px solid"
                borderColor={getCultureColor(feature.culture)}
                _hover={{
                  transform: 'translateY(-5px)',
                  boxShadow: '2xl',
                }}
                className="float-animation"
              >
                <VStack align="start" spacing={4}>
                  <Icon
                    as={feature.icon}
                    w={8}
                    h={8}
                    color={getCultureColor(feature.culture)}
                  />
                  <Heading size="md" fontFamily="'Playfair Display', serif">
                    {feature.title}
                  </Heading>
                  <Text color={useColorModeValue('gray.600', 'gray.300')}>
                    {feature.description}
                  </Text>
                </VStack>
              </MotionBox>
            ))}
          </Grid>
        </VStack>
      </Container>
    </Box>
  )
} 