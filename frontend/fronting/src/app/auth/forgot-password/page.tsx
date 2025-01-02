'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Alert,
  AlertIcon,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { FaArrowLeft } from 'react-icons/fa'
import { ROUTES } from '@/utils/constants'

interface ForgotPasswordForm {
  email: string
}

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { requestPasswordReset } = useAuth()
  const router = useRouter()
  const toast = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>()

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.400')

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      setIsLoading(true)
      await requestPasswordReset(data.email)
      setEmailSent(true)
      toast({
        title: 'E-mail enviado',
        description: 'Verifique sua caixa de entrada para redefinir sua senha',
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
    } finally {
      setIsLoading(false)
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
          <VStack spacing={6}>
            <Box textAlign="center">
              <Heading
                className="cultural-heading"
                bgGradient="linear(to-r, var(--color-mozambique-red), var(--color-egypt-gold))"
                bgClip="text"
                mb={2}
              >
                Recuperar Senha
              </Heading>
              <Text color={textColor}>
                Digite seu e-mail para receber as instruções
              </Text>
            </Box>

            {emailSent ? (
              <VStack spacing={4}>
                <Alert status="success" borderRadius="md">
                  <AlertIcon />
                  E-mail enviado com sucesso! Verifique sua caixa de entrada.
                </Alert>
                <Text color={textColor} textAlign="center">
                  Não recebeu o e-mail?{' '}
                  <Button
                    variant="link"
                    color="blue.500"
                    onClick={() => setEmailSent(false)}
                    isLoading={isLoading}
                  >
                    Tentar novamente
                  </Button>
                </Text>
              </VStack>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
                <VStack spacing={4} align="stretch">
                  <FormControl isInvalid={!!errors.email}>
                    <FormLabel>E-mail</FormLabel>
                    <Input
                      type="email"
                      {...register('email', {
                        required: 'E-mail é obrigatório',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'E-mail inválido',
                        },
                      })}
                    />
                    <FormErrorMessage>
                      {errors.email?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    width="100%"
                    isLoading={isLoading}
                  >
                    Enviar instruções
                  </Button>
                </VStack>
              </form>
            )}

            <Button
              as={Link}
              href={ROUTES.LOGIN}
              variant="ghost"
              leftIcon={<FaArrowLeft />}
              size="sm"
            >
              Voltar para o login
            </Button>
          </VStack>
        </Box>
      </motion.div>
    </Container>
  )
} 