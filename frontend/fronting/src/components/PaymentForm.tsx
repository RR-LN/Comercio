'use client'

import { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Input,
  Select,
  Button,
  Text,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react'
import { usePayment } from '@/hooks/usePayment'
import { useForm } from 'react-hook-form'
import { PaymentMethod } from '@/types'
import { formatCurrency } from '@/utils/format'

interface PaymentFormProps {
  amount: number
  onSuccess: () => void
  onError: (error: any) => void
}

export function PaymentForm({ amount, onSuccess, onError }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card')
  const { loading, processPayment } = usePayment()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const bgColor = useColorModeValue('white', 'gray.800')

  const onSubmit = async (data: any) => {
    try {
      await processPayment(paymentMethod, {
        type: paymentMethod,
        card: paymentMethod === 'credit_card' ? {
          number: data.cardNumber,
          expMonth: parseInt(data.expMonth),
          expYear: parseInt(data.expYear),
          cvc: data.cvc
        } : undefined,
        billingDetails: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: {
            line1: data.address,
            city: data.city,
            state: data.state,
            postalCode: data.zipCode,
            country: 'BR'
          }
        }
      })
      onSuccess()
    } catch (error) {
      onError(error)
    }
  }

  return (
    <Box
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      p={6}
      bg={bgColor}
      borderRadius="lg"
      shadow="md"
    >
      <VStack spacing={6} align="stretch">
        {/* Valor total */}
        <Box>
          <Text fontSize="lg" fontWeight="bold">
            Total a pagar: {formatCurrency(amount)}
          </Text>
        </Box>

        <Divider />

        {/* Método de pagamento */}
        <FormControl>
          <FormLabel>Método de pagamento</FormLabel>
          <Select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
          >
            <option value="credit_card">Cartão de Crédito</option>
            <option value="paypal">PayPal</option>
          </Select>
        </FormControl>

        {paymentMethod === 'credit_card' && (
          <>
            {/* Dados do cartão */}
            <FormControl isInvalid={!!errors.cardNumber}>
              <FormLabel>Número do cartão</FormLabel>
              <Input
                {...register('cardNumber', {
                  required: 'Número do cartão é obrigatório',
                  pattern: {
                    value: /^[0-9]{16}$/,
                    message: 'Número do cartão inválido'
                  }
                })}
                placeholder="1234 5678 9012 3456"
              />
              <FormErrorMessage>
                {errors.cardNumber?.message as string}
              </FormErrorMessage>
            </FormControl>

            <HStack>
              <FormControl isInvalid={!!errors.expMonth}>
                <FormLabel>Mês</FormLabel>
                <Input
                  {...register('expMonth', {
                    required: 'Mês é obrigatório'
                  })}
                  placeholder="MM"
                />
                <FormErrorMessage>
                  {errors.expMonth?.message as string}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.expYear}>
                <FormLabel>Ano</FormLabel>
                <Input
                  {...register('expYear', {
                    required: 'Ano é obrigatório'
                  })}
                  placeholder="AAAA"
                />
                <FormErrorMessage>
                  {errors.expYear?.message as string}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.cvc}>
                <FormLabel>CVC</FormLabel>
                <Input
                  {...register('cvc', {
                    required: 'CVC é obrigatório'
                  })}
                  placeholder="123"
                />
                <FormErrorMessage>
                  {errors.cvc?.message as string}
                </FormErrorMessage>
              </FormControl>
            </HStack>
          </>
        )}

        {/* Dados pessoais */}
        <FormControl isInvalid={!!errors.name}>
          <FormLabel>Nome completo</FormLabel>
          <Input
            {...register('name', {
              required: 'Nome é obrigatório'
            })}
          />
          <FormErrorMessage>
            {errors.name?.message as string}
          </FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.email}>
          <FormLabel>E-mail</FormLabel>
          <Input
            {...register('email', {
              required: 'E-mail é obrigatório',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'E-mail inválido'
              }
            })}
          />
          <FormErrorMessage>
            {errors.email?.message as string}
          </FormErrorMessage>
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          size="lg"
          isLoading={loading}
          loadingText="Processando..."
        >
          Finalizar Pagamento
        </Button>
      </VStack>
    </Box>
  )
} 