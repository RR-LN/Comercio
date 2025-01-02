import { useMutation } from '@tanstack/react-query'
import { cdnService } from '@/services/api/cdn'
import { useToast } from '@chakra-ui/react'

export function useCDN() {
  const toast = useToast()

  const { mutate: uploadFile, isLoading: isUploading } = useMutation({
    mutationFn: ({ file, path }: { file: File; path: string }) => 
      cdnService.uploadImage(file, path),
    onError: (error) => {
      toast({
        title: 'Erro ao fazer upload',
        description: error.message,
        status: 'error'
      })
    }
  })

  const { mutate: uploadMultiple, isLoading: isUploadingMultiple } = useMutation({
    mutationFn: ({ files, path }: { files: File[]; path: string }) =>
      cdnService.uploadMultiple(files, path),
    onError: (error) => {
      toast({
        title: 'Erro ao fazer upload múltiplo',
        description: error.message,
        status: 'error'
      })
    }
  })

  const { mutate: deleteFile } = useMutation({
    mutationFn: (key: string) => cdnService.deleteFile(key),
    onError: (error) => {
      toast({
        title: 'Erro ao excluir arquivo',
        description: error.message,
        status: 'error'
      })
    }
  })

  const { mutate: optimizeImage } = useMutation({
    mutationFn: ({ key, options }: {
      key: string;
      options?: {
        width?: number;
        height?: number;
        quality?: number;
        format?: 'jpeg' | 'png' | 'webp';
      }
    }) => cdnService.optimizeImage(key, options)
  })

  return {
    uploadFile,
    uploadMultiple,
    deleteFile,
    optimizeImage,
    isLoading: {
      upload: isUploading,
      uploadMultiple: isUploadingMultiple
    }
  }
} 