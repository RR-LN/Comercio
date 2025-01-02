'use client'

import { useState, useCallback } from 'react'
import {
  Box,
  VStack,
  Text,
  Icon,
  useColorModeValue,
  Image,
  SimpleGrid,
  IconButton,
  Progress,
  useToast
} from '@chakra-ui/react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { FaUpload, FaTrash, FaCheck } from 'react-icons/fa'

interface FileUploadProps {
  onUploadComplete: (files: string[]) => void
  maxFiles?: number
  acceptedTypes?: string[]
  maxSize?: number
}

export const FileUpload = ({
  onUploadComplete,
  maxFiles = 5,
  acceptedTypes = ['image/*'],
  maxSize = 5242880 // 5MB
}: FileUploadProps) => {
  const [files, setFiles] = useState<Array<{ file: File; preview: string }>>([])
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const toast = useToast()

  const bgColor = useColorModeValue('gray.50', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (files.length + acceptedFiles.length > maxFiles) {
      toast({
        title: `Máximo de ${maxFiles} arquivos permitido`,
        status: 'warning',
        duration: 3000
      })
      return
    }

    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))

    setFiles(prev => [...prev, ...newFiles])

    // Simular upload para cada arquivo
    const uploadedUrls = await Promise.all(
      acceptedFiles.map(async file => {
        try {
          // Simular progresso
          for (let i = 0; i <= 100; i += 10) {
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: i
            }))
            await new Promise(resolve => setTimeout(resolve, 100))
          }

          // Aqui você faria o upload real para seu backend
          // const formData = new FormData()
          // formData.append('file', file)
          // const response = await fetch('/api/upload', { method: 'POST', body: formData })
          // return response.url

          return `https://your-backend.com/uploads/${file.name}`
        } catch (error) {
          toast({
            title: 'Erro no upload',
            description: `Falha ao enviar ${file.name}`,
            status: 'error',
            duration: 3000
          })
          return null
        }
      })
    )

    const successfulUploads = uploadedUrls.filter(Boolean) as string[]
    onUploadComplete(successfulUploads)
  }, [files.length, maxFiles, onUploadComplete, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, curr) => ({ ...acc, [curr]: [] }), {}),
    maxSize,
    multiple: true
  })

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[index].preview)
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  return (
    <VStack spacing={4} width="100%">
      <Box
        {...getRootProps()}
        width="100%"
        p={6}
        borderWidth={2}
        borderStyle="dashed"
        borderColor={isDragActive ? 'blue.400' : borderColor}
        borderRadius="xl"
        bg={bgColor}
        cursor="pointer"
        transition="all 0.2s"
        _hover={{ borderColor: 'blue.400' }}
      >
        <input {...getInputProps()} />
        <VStack spacing={2}>
          <Icon as={FaUpload} boxSize={8} color="gray.400" />
          <Text textAlign="center">
            {isDragActive
              ? 'Solte os arquivos aqui'
              : 'Arraste arquivos ou clique para selecionar'}
          </Text>
          <Text fontSize="sm" color="gray.500">
            Máximo {maxFiles} arquivos, {maxSize / 1048576}MB cada
          </Text>
        </VStack>
      </Box>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4} width="100%">
        <AnimatePresence>
          {files.map((file, index) => (
            <motion.div
              key={file.preview}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Box
                position="relative"
                borderRadius="md"
                overflow="hidden"
                borderWidth={1}
                borderColor={borderColor}
              >
                <Image
                  src={file.preview}
                  alt={file.file.name}
                  width="100%"
                  height="150px"
                  objectFit="cover"
                />
                
                <IconButton
                  aria-label="Remover arquivo"
                  icon={<FaTrash />}
                  size="sm"
                  position="absolute"
                  top={2}
                  right={2}
                  colorScheme="red"
                  onClick={() => removeFile(index)}
                />

                {uploadProgress[file.file.name] !== undefined && (
                  <Box position="absolute" bottom={0} left={0} right={0}>
                    <Progress
                      value={uploadProgress[file.file.name]}
                      size="xs"
                      colorScheme="blue"
                    />
                    {uploadProgress[file.file.name] === 100 && (
                      <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                      >
                        <Icon as={FaCheck} color="green.500" />
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>
      </SimpleGrid>
    </VStack>
  )
} 