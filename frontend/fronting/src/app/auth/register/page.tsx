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
  Grid,
  Checkbox,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { ROUTES } from '@/utils/constants'

interface RegisterForm {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register: registerUser } = useAuth()
  const router = useRouter()
  const toast = useToast()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>()

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.400')

  const onSubmit = async (data: RegisterForm) => {
    try {
      setIsLoading(true)
      await registerUser(data)
      toast({
        title: 'Conta criada com sucesso!',
        description: 'Verifique seu e-mail para ativar sua conta.',
        status: 'success',
        duration: 5000,
      })
      router.push(ROUTES.LOGIN)
    } catch (error: any) {
      toast({
        title: 'Erro ao criar conta',
        description: error.message || 'Por favor, tente novamente',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container maxW="container.md" py={20}>
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
                Crie sua conta
              </Heading>
              <Text color={textColor}>
                Preencha os dados abaixo para começar
              </Text>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
              <VStack spacing={4} align="stretch">
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                  <FormControl isInvalid={!!errors.name}>
                    <FormLabel>Nome completo</FormLabel>
                    <Input
                      {...register('name', {
                        required: 'Nome é obrigatório',
                        minLength: {
                          value: 3,
                          message: 'Nome deve ter no mínimo 3 caracteres',
                        },
                      })}
                    />
                    <FormErrorMessage>
                      {errors.name?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.phone}>
                    <FormLabel>Telefone</FormLabel>
                    <Input
                      {...register('phone', {
                        required: 'Telefone é obrigatório',
                        pattern: {
                          value: /^\(\d{2}\) \d{4,5}-\d{4}$/,
                          message: 'Telefone inválido',
                        },
                      })}
                      placeholder="(00) 00000-0000"
                    />
                    <FormErrorMessage>
                      {errors.phone?.message}
                    </FormErrorMessage>
                  </FormControl>
                </Grid>

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

                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
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

                  <FormControl isInvalid={!!errors.confirmPassword}>
                    <FormLabel>Confirmar senha</FormLabel>
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
                </Grid>

                <FormControl isInvalid={!!errors.acceptTerms}>
                  <Checkbox
                    {...register('acceptTerms', {
                      required: 'Voc�� deve aceitar os termos',
                    })}
                  >
                    Li e aceito os{' '}
                    <Link href="/terms">
                      <Text
                        as="span"
                        color="blue.500"
                        _hover={{ textDecoration: 'underline' }}
                      >
                        termos de uso
                      </Text>
                    </Link>{' '}
                    e{' '}
                    <Link href="/privacy">
                      <Text
                        as="span"
                        color="blue.500"
                        _hover={{ textDecoration: 'underline' }}
                      >
                        política de privacidade
                      </Text>
                    </Link>
                  </Checkbox>
                  <FormErrorMessage>
                    {errors.acceptTerms?.message}
                  </FormErrorMessage>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  width="100%"
                  isLoading={isLoading}
                >
                  Criar conta
                </Button>
              </VStack>
            </form>

            <Text color={textColor}>
              Já tem uma conta?{' '}
              <Link href={ROUTES.LOGIN}>
                <Text
                  as="span"
                  color="blue.500"
                  _hover={{ textDecoration: 'underline' }}
                >
                  Faça login
                </Text>
              </Link>
            </Text>
          </VStack>
        </Box>
      </motion.div>
    </Container>
  )
} 