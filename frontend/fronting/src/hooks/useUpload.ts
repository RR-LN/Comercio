import { useMutation } from '@tanstack/react-query'
import { uploadService } from '@/services/api/upload'

export function useImageUpload() {
  return useMutation({
    mutationFn: ({ file, path }: { file: File; path: string }) =>
      uploadService.uploadImage(file, path),
  })
}

export function useMultipleImageUpload() {
  return useMutation({
    mutationFn: ({ files, path }: { files: File[]; path: string }) =>
      uploadService.uploadMultipleImages(files, path),
  })
}

export function useAvatarUpload() {
  return useMutation({
    mutationFn: (file: File) => uploadService.uploadAvatar(file),
  })
}

export function useImageOptimization() {
  return useMutation({
    mutationFn: ({ file, options }: { 
      file: File; 
      options?: {
        width?: number
        height?: number
        quality?: number
        format?: 'jpeg' | 'png' | 'webp'
      }
    }) => uploadService.optimizeImage(file, options),
  })
} 