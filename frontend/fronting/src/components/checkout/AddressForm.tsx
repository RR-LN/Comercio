'use client'

import { useState, useEffect } from 'react'
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  Grid,
  GridItem,
  Select,
  FormErrorMessage,
  useToast
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { FaSearch } from 'react-icons/fa'
import { useCep } from '@/hooks/useCep'

interface AddressFormProps {
  initialData?: any
  onSubmit: (data: any) => void
}

export const AddressForm = ({ initialData, onSubmit }: AddressFormProps) => {
  const [isLoadingCep, setIsLoadingCep] = useState(false)
  const { fetchAddressByCep } = useCep()
  const toast = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: initialData
  })

  const searchCep = async (cep: string) => {
    setIsLoadingCep(true)
    try {
      const address = await fetchAddressByCep(cep)
      if (address) {
        setValue('street', address.street)
        setValue('neighborhood', address.neighborhood)
        setValue('city', address.city)
        setValue('state', address.state)
      }
    } catch (error) {
      toast({
        title: 'Erro ao buscar CEP',
        description: 'CEP não encontrado ou serviço indisponível',
        status: 'error',
        duration: 3000
      })
    }
    setIsLoadingCep(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={6}>
        <Grid templateColumns="repeat(12, 1fr)" gap={4} width="100%">
          <GridItem colSpan={{ base: 12, md: 4 }}>
            <FormControl isInvalid={!!errors.cep}>
              <FormLabel>CEP</FormLabel>
              <InputGroup>
                <Input
                  {...register('cep', {
                    required: 'CEP é obrigatório',
                    pattern: {
                      value: /^\d{5}-?\d{3}$/,
                      message: 'CEP inválido'
                    }
                  })}
                  placeholder="00000-000"
                />
                <InputRightElement>
                  <Button
                    size="sm"
                    variant="ghost"
                    isLoading={isLoadingCep}
                    onClick={() => searchCep(getValue('cep'))}
                  >
                    <FaSearch />
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>
                {errors.cep?.message}
              </FormErrorMessage>
            </FormControl>
          </GridItem>

          <GridItem colSpan={{ base: 12, md: 8 }}>
            <FormControl isInvalid={!!errors.street}>
              <FormLabel>Rua</FormLabel>
              <Input
                {...register('street', {
                  required: 'Rua é obrigatória'
                })}
              />
              <FormErrorMessage>
                {errors.street?.message}
              </FormErrorMessage>
            </FormControl>
          </GridItem>

          <GridItem colSpan={{ base: 12, md: 4 }}>
            <FormControl isInvalid={!!errors.number}>
              <FormLabel>Número</FormLabel>
              <Input
                {...register('number', {
                  required: 'Número é obrigatório'
                })}
              />
              <FormErrorMessage>
                {errors.number?.message}
              </FormErrorMessage>
            </FormControl>
          </GridItem>

          <GridItem colSpan={{ base: 12, md: 8 }}>
            <FormControl>
              <FormLabel>Complemento</FormLabel>
              <Input {...register('complement')} />
            </FormControl>
          </GridItem>

          <GridItem colSpan={{ base: 12, md: 6 }}>
            <FormControl isInvalid={!!errors.neighborhood}>
              <FormLabel>Bairro</FormLabel>
              <Input
                {...register('neighborhood', {
                  required: 'Bairro é obrigatório'
                })}
              />
              <FormErrorMessage>
                {errors.neighborhood?.message}
              </FormErrorMessage>
            </FormControl>
          </GridItem>

          <GridItem colSpan={{ base: 12, md: 4 }}>
            <FormControl isInvalid={!!errors.city}>
              <FormLabel>Cidade</FormLabel>
              <Input
                {...register('city', {
                  required: 'Cidade é obrigatória'
                })}
              />
              <FormErrorMessage>
                {errors.city?.message}
              </FormErrorMessage>
            </FormControl>
          </GridItem>

          <GridItem colSpan={{ base: 12, md: 2 }}>
            <FormControl isInvalid={!!errors.state}>
              <FormLabel>Estado</FormLabel>
              <Select
                {...register('state', {
                  required: 'Estado é obrigatório'
                })}
              >
                <option value="">UF</option>
                {/* Lista de estados */}
                <option value="SP">SP</option>
                <option value="RJ">RJ</option>
                {/* ... outros estados ... */}
              </Select>
              <FormErrorMessage>
                {errors.state?.message}
              </FormErrorMessage>
            </FormControl>
          </GridItem>
        </Grid>

        <Button
          type="submit"
          colorScheme="blue"
          width="100%"
          isLoading={isSubmitting}
        >
          Salvar Endereço
        </Button>
      </VStack>
    </form>
  )
} 