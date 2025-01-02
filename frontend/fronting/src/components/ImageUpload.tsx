'use client'

import { memo, useCallback, useState } from 'react'
import { useImageUpload } from '@/hooks/useUpload'
import {
  Box,
  Button,
  Image,
  Input,
  VStack,
  Text,
  Progress,
  useToast,
} from '@chakra-ui/react'
import { FaUpload, FaTrash } from 'react-icons/fa'

interface ImageUploadProps {
  path: string
  onUploadComplete?: (url: string) => void
  maxSize?: number // em bytes
  acceptedTypes?: string[]
}

export const ImageUpload = memo(function ImageUpload({
  path,
  onUploadComplete,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string>()
  const toast = useToast()

  const { mutate: uploadImage, isLoading } = useImageUpload()

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validações
    if (!acceptedTypes.includes(file.type)) {
      toast({
        title: 'Tipo de arquivo inválido',
        description: 'Por favor, selecione uma imagem válida',
        status: 'error',
      })
      return
    }

    if (file.size > maxSize) {
      toast({
        title: 'Arquivo muito grande',
        description: `O tamanho máximo permitido é ${maxSize / 1024 / 1024}MB`,
        status: 'error',
      })
      return
    }

    // Preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    uploadImage(
      { file, path },
      {
        onSuccess: (data) => {
          toast({
            title: 'Upload concluído',
            status: 'success',
          })
          onUploadComplete?.(data.url)
        },
        onError: (error) => {
          toast({
            title: 'Erro no upload',
            description: error.message,
            status: 'error',
          })
        }
      }
    )
  }, [uploadImage, path, maxSize, acceptedTypes, toast, onUploadComplete])

  const handleClear = useCallback(() => {
    setPreview(undefined)
  }, [])

  return (
    <VStack spacing={4} align="stretch">
      <Input
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        hidden
        id="file-upload"
      />

      {preview ? (
        <Box position="relative">
          <Image
            src={preview}
            alt="Preview"
            borderRadius="md"
            objectFit="cover"
          />
          <Button
            position="absolute"
            top={2}
            right={2}
            size="sm"
            colorScheme="red"
            onClick={handleClear}
          >
            <FaTrash />
          </Button>
        </Box>
      ) : (
        <Button
          as="label"
          htmlFor="file-upload"
          leftIcon={<FaUpload />}
          isLoading={isLoading}
          cursor="pointer"
        >
          Selecionar Imagem
        </Button>
      )}

      {isLoading && (
        <Progress size="xs" isIndeterminate />
      )}

      <Text fontSize="sm" color="gray.500">
        Formatos aceitos: {acceptedTypes.join(', ')}
        <br />
        Tamanho máximo: {maxSize / 1024 / 1024}MB
      </Text>
    </VStack>
  )
}) 