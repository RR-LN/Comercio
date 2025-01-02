'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  CircularProgress,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { FaCheckCircle, FaTimesCircle, FaEnvelope } from 'react-icons/fa'
import { ROUTES } from '@/utils/constants'

export default function VerifyEmailPage() {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const { verifyEmail, resendVerificationEmail } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.400')

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setVerificationStatus('error')
        setErrorMessage('Token de verificação não encontrado')
        return
      }

      try {
        await verifyEmail(token)
        setVerificationStatus('success')
        setTimeout(() => {
          router.push(ROUTES.LOGIN)
        }, 3000)
      } catch (error: any) {
        setVerificationStatus('error')
        setErrorMessage(error.message || 'Erro ao verificar e-mail')
      }
    }

    verifyToken()
  }, [token, verifyEmail, router])

  const handleResendEmail = async () => {
    if (!email) {
      toast({
        title: 'Erro',
        description: 'E-mail não encontrado',
        status: 'error',
        duration: 3000,
      })
      return
    }

    try {
      await resendVerificationEmail(email)
      toast({
        title: 'E-mail enviado',
        description: 'Um novo link de verificação foi enviado para seu e-mail',
        status: 'success',
        duration: 5000,
      })
    } catch (error: any) {
      toast({
        title: 'Erro ao enviar e-mail',
        description: error.message || 'Por favor, tente novamente',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const renderContent = () => {
    switch (verificationStatus) {
      case 'loading':
        return (
          <VStack spacing={6}>
            <CircularProgress isIndeterminate color="blue.500" size="50px" />
            <Text color={textColor}>
              Verificando seu e-mail...
            </Text>
          </VStack>
        )

      case 'success':
        return (
          <VStack spacing={6}>
            <Box
              as={motion.div}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              <FaCheckCircle size={60} color="var(--chakra-colors-green-500)" />
            </Box>
            <Heading size="lg" textAlign="center">
              E-mail Verificado!
            </Heading>
            <Text color={textColor} textAlign="center">
              Sua conta foi verificada com sucesso. Você será redirecionado para a página de login em alguns segundos.
            </Text>
            <Button
              as={Link}
              href={ROUTES.LOGIN}
              colorScheme="blue"
              size="lg"
              width="100%"
            >
              Ir para Login
            </Button>
          </VStack>
        )

      case 'error':
        return (
          <VStack spacing={6}>
            <Box
              as={motion.div}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              <FaTimesCircle size={60} color="var(--chakra-colors-red-500)" />
            </Box>
            <Heading size="lg" textAlign="center">
              Verificação Falhou
            </Heading>
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {errorMessage}
            </Alert>
            {email && (
              <VStack spacing={4} width="100%">
                <Text color={textColor} textAlign="center">
                  Não recebeu o e-mail de verificação?
                </Text>
                <Button
                  leftIcon={<FaEnvelope />}
                  colorScheme="blue"
                  variant="outline"
                  onClick={handleResendEmail}
                >
                  Reenviar e-mail
                </Button>
              </VStack>
            )}
            <Button
              as={Link}
              href={ROUTES.LOGIN}
              variant="ghost"
              size="sm"
            >
              Voltar para Login
            </Button>
          </VStack>
        )
    }
  }

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
          {renderContent()}
        </Box>
      </motion.div>
    </Container>
  )
} 