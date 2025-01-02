'use client'

import { useState } from 'react'
import { VStack, HStack } from '@chakra-ui/react'
import { Input } from '@/components/base/Input'
import { Select } from '@/components/base/Select'
import { Button } from '@/components/base/Button'
import { Badge } from '@/components/base/Badge'

const subjectOptions = [
  { value: 'support', label: 'Suporte' },
  { value: 'sales', label: 'Vendas' },
  { value: 'other', label: 'Outro' },
]

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    
    try {
      // Simular envio
      await new Promise(resolve => setTimeout(resolve, 2000))
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <VStack as="form" spacing={6} onSubmit={handleSubmit}>
      <HStack w="full" spacing={4}>
        <Input
          label="Nome"
          placeholder="Seu nome"
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="seu@email.com"
          required
        />
      </HStack>

      <Select
        label="Assunto"
        placeholder="Selecione um assunto"
        options={subjectOptions}
        required
      />

      <Input
        label="Mensagem"
        as="textarea"
        placeholder="Sua mensagem"
        minH="150px"
        required
      />

      <HStack w="full" justify="space-between">
        <Badge variant={status === 'success' ? 'success' : status === 'error' ? 'error' : 'subtle'}>
          {status === 'success' ? 'Mensagem enviada!' : 
           status === 'error' ? 'Erro ao enviar' :
           status === 'loading' ? 'Enviando...' : 'Preencha o formulário'}
        </Badge>

        <Button
          type="submit"
          isLoading={status === 'loading'}
          loadingText="Enviando..."
        >
          Enviar mensagem
        </Button>
      </HStack>
    </VStack>
  )
} 