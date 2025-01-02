'use client'

import { useState } from 'react'
import {
  Box,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  StepSeparator,
  useSteps,
  Button,
  HStack,
  VStack,
  useColorModeValue,
  useToast
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaArrowLeft, FaArrowRight, FaCheck } from 'react-icons/fa'
import { AddressForm } from './checkout/AddressForm'
import { PaymentForm } from './checkout/PaymentForm'
import { OrderSummary } from './checkout/OrderSummary'
import { OrderConfirmation } from './checkout/OrderConfirmation'
import { useCheckout } from '@/hooks/useCheckout'

const steps = [
  {
    title: 'Endereço',
    description: 'Endereço de entrega'
  },
  {
    title: 'Pagamento',
    description: 'Método de pagamento'
  },
  {
    title: 'Revisão',
    description: 'Confirme seu pedido'
  },
  {
    title: 'Confirmação',
    description: 'Pedido finalizado'
  }
]

export const MultiStepCheckout = () => {
  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length
  })
  const [formData, setFormData] = useState({
    address: {},
    payment: {},
    order: {}
  })
  const { submitOrder, isLoading } = useCheckout()
  const toast = useToast()

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const handleNext = async (stepData: any) => {
    const updatedData = {
      ...formData,
      [getCurrentStep()]: stepData
    }
    setFormData(updatedData)

    if (activeStep === steps.length - 2) {
      try {
        await submitOrder(updatedData)
        setActiveStep(activeStep + 1)
      } catch (error) {
        toast({
          title: 'Erro ao finalizar pedido',
          description: 'Por favor, tente novamente',
          status: 'error',
          duration: 3000
        })
      }
    } else {
      setActiveStep(activeStep + 1)
    }
  }

  const handleBack = () => {
    setActiveStep(activeStep - 1)
  }

  const getCurrentStep = () => {
    switch (activeStep) {
      case 0:
        return 'address'
      case 1:
        return 'payment'
      case 2:
        return 'order'
      default:
        return ''
    }
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <AddressForm
            initialData={formData.address}
            onSubmit={handleNext}
          />
        )
      case 1:
        return (
          <PaymentForm
            initialData={formData.payment}
            onSubmit={handleNext}
          />
        )
      case 2:
        return (
          <OrderSummary
            data={formData}
            onSubmit={handleNext}
          />
        )
      case 3:
        return <OrderConfirmation orderData={formData} />
      default:
        return null
    }
  }

  return (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <Stepper index={activeStep} mb={8}>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepIndicator>
              <StepStatus
                complete={<StepIcon />}
                incomplete={<StepNumber />}
                active={<StepNumber />}
              />
            </StepIndicator>

            <Box flexShrink='0'>
              <StepTitle>{step.title}</StepTitle>
              <StepDescription>{step.description}</StepDescription>
            </Box>

            <StepSeparator />
          </Step>
        ))}
      </Stepper>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Box mb={8}>
            {renderStepContent()}
          </Box>
        </motion.div>
      </AnimatePresence>

      {activeStep < steps.length - 1 && (
        <HStack justify="space-between">
          <Button
            leftIcon={<FaArrowLeft />}
            onClick={handleBack}
            isDisabled={activeStep === 0}
            variant="ghost"
          >
            Voltar
          </Button>

          {activeStep === steps.length - 2 ? (
            <Button
              rightIcon={<FaCheck />}
              colorScheme="green"
              onClick={() => handleNext(formData[getCurrentStep()])}
              isLoading={isLoading}
            >
              Finalizar Pedido
            </Button>
          ) : (
            <Button
              rightIcon={<FaArrowRight />}
              colorScheme="blue"
              onClick={() => handleNext(formData[getCurrentStep()])}
            >
              Próximo
            </Button>
          )}
        </HStack>
      )}
    </Box>
  )
} 