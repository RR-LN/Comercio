'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  InputGroup,
  InputRightElement,
  IconButton,
  Alert,
  AlertIcon,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { ROUTES } from '@/utils/constants'

interface ResetPasswordForm {
  password: string
  confirmPassword: string
}

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { resetPassword } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()

  const token = searchParams.get('token')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>()

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.400')

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      toast({
        title: 'Token inválido',
        description: 'O link de redefinição de senha é inválido ou expirou',
        status: 'error',
        duration: 3000,
      })
      return
    }

    try {
      setIsLoading(true)
      await resetPassword(token, data.password)
      toast({
        title: 'Senha redefinida',
        description: 'Sua senha foi alterada com sucesso',
        status: 'success',
        duration: 5000,
      })
      router.push(ROUTES.LOGIN)
    } catch (error: any) {
      toast({
        title: 'Erro ao redefinir senha',
        description: error.message || 'Por favor, tente novamente',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <Container maxW="container.sm" py={20}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          Link de redefinição de senha inválido ou expirado
        </Alert>
      </Container>
    )
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
                Nova Senha
              </Heading>
              <Text color={textColor}>
                Digite sua nova senha abaixo
              </Text>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
              <VStack spacing={4} align="stretch">
                <FormControl isInvalid={!!errors.password}>
                  <FormLabel>Nova senha</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', {
                        required: 'Senha é obrigatória',
                        minLength: {
                          value: 6,
                          message: 'Senha deve ter no mínimo 6 caracteres',
                        },
                      })}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                        variant="ghost"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>
                    {errors.password?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.confirmPassword}>
                  <FormLabel>Confirmar nova senha</FormLabel>
                  <InputGroup>
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword', {
                        required: 'Confirmação de senha é obrigatória',
                        validate: value =>
                          value === watch('password') || 'As senhas não coincidem',
                      })}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        icon={showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        variant="ghost"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>
                    {errors.confirmPassword?.message}
                  </FormErrorMessage>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  width="100%"
                  isLoading={isLoading}
                >
                  Redefinir senha
                </Button>
              </VStack>
            </form>
          </VStack>
        </Box>
      </motion.div>
    </Container>
  )
} 