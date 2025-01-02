'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react'
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa'
import { ROUTES } from '@/utils/constants'

export default function EmailSentPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.400')

  return (
    <Container maxW="container.sm" py={20}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          p={8}
          bg={bgColor}
          borderRadius="xl"
          boxShadow="xl"
          borderWidth="1px"
          borderColor={borderColor}
          className="cultural-border"
        >
          <VStack spacing={6}>
            <Box
              as={motion.div}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              <Icon
                as={FaEnvelope}
                w={16}
                h={16}
                color="blue.500"
              />
            </Box>

            <Heading
              className="cultural-heading"
              bgGradient="linear(to-r, var(--color-mozambique-red), var(--color-egypt-gold))"
              bgClip="text"
              textAlign="center"
            >
              Verifique seu E-mail
            </Heading>

            <Text color={textColor} textAlign="center">
              Enviamos um link de verificação para
              {email && (
                <Text as="span" fontWeight="bold" color="blue.500">
                  {' '}{email}
                </Text>
              )}
            </Text>

            <Text color={textColor} textAlign="center">
              Clique no link enviado para seu e-mail para ativar sua conta e começar a usar nossa plataforma.
            </Text>

            <VStack spacing={4} width="100%">
              <Text color={textColor} fontSize="sm">
                Não recebeu o e-mail? Verifique sua pasta de spam ou
              </Text>
              <Button
                variant="link"
                color="blue.500"
                onClick={() => {/* Implementar reenvio */}}
              >
                clique aqui para reenviar
              </Button>
            </VStack>

            <Button
              as={Link}
              href={ROUTES.LOGIN}
              leftIcon={<FaArrowLeft />}
              variant="ghost"
              size="sm"
            >
              Voltar para Login
            </Button>
          </VStack>
        </Box>
      </motion.div>
    </Container>
  )
} 