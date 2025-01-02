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
  InputGroup,
  InputRightElement,
  IconButton,
  Divider,
  HStack,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { FaEye, FaEyeSlash, FaGoogle, FaFacebook } from 'react-icons/fa'
import { ROUTES } from '@/utils/constants'

interface LoginForm {
  email: string
  password: string
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const toast = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>()

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.400')

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true)
      await login(data)
      router.push(ROUTES.HOME)
    } catch (error: any) {
      toast({
        title: 'Erro ao fazer login',
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
                Bem-vindo de volta
              </Heading>
              <Text color={textColor}>
                Entre com sua conta para continuar
              </Text>
            </Box>

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

                <FormControl isInvalid={!!errors.password}>
                  <FormLabel>Senha</FormLabel>
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

                <Box textAlign="right">
                  <Link href={ROUTES.FORGOT_PASSWORD}>
                    <Text
                      as="span"
                      color="blue.500"
                      _hover={{ textDecoration: 'underline' }}
                      fontSize="sm"
                    >
                      Esqueceu sua senha?
                    </Text>
                  </Link>
                </Box>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  width="100%"
                  isLoading={isLoading}
                >
                  Entrar
                </Button>
              </VStack>
            </form>

            <VStack spacing={4} width="100%">
              <HStack width="100%">
                <Divider />
                <Text color={textColor} whiteSpace="nowrap" fontSize="sm">
                  ou continue com
                </Text>
                <Divider />
              </HStack>

              <HStack spacing={4} width="100%">
                <Button
                  variant="outline"
                  leftIcon={<FaGoogle />}
                  width="100%"
                  onClick={() => {/* Implementar login com Google */}}
                >
                  Google
                </Button>
                <Button
                  variant="outline"
                  leftIcon={<FaFacebook />}
                  width="100%"
                  onClick={() => {/* Implementar login com Facebook */}}
                >
                  Facebook
                </Button>
              </HStack>
            </VStack>

            <Text color={textColor}>
              Não tem uma conta?{' '}
              <Link href={ROUTES.REGISTER}>
                <Text
                  as="span"
                  color="blue.500"
                  _hover={{ textDecoration: 'underline' }}
                >
                  Registre-se
                </Text>
              </Link>
            </Text>
          </VStack>
        </Box>
      </motion.div>
    </Container>
  )
} 