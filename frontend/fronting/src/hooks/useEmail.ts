import { useMutation } from '@tanstack/react-query'
import { emailService } from '@/services/api/email'

export function useEmail() {
  const { mutate: sendConfirmation, isLoading: isConfirmationLoading } = useMutation({
    mutationFn: (email: string) => emailService.sendConfirmationEmail(email)
  })

  const { mutate: sendPasswordReset, isLoading: isResetLoading } = useMutation({
    mutationFn: (email: string) => emailService.sendPasswordResetEmail(email)
  })

  const { mutate: sendOrderNotification, isLoading: isOrderNotificationLoading } = useMutation({
    mutationFn: (orderId: string) => emailService.sendOrderNotification(orderId)
  })

  const { mutate: sendNewsletter, isLoading: isNewsletterLoading } = useMutation({
    mutationFn: (data: { subject: string; content: string; recipients: string[] }) => 
      emailService.sendNewsletter(data.subject, data.content, data.recipients)
  })

  const { mutate: verifyEmail, isLoading: isVerificationLoading } = useMutation({
    mutationFn: (token: string) => emailService.verifyEmail(token)
  })

  return {
    sendConfirmation,
    sendPasswordReset,
    sendOrderNotification,
    sendNewsletter,
    verifyEmail,
    isLoading: {
      confirmation: isConfirmationLoading,
      reset: isResetLoading,
      orderNotification: isOrderNotificationLoading,
      newsletter: isNewsletterLoading,
      verification: isVerificationLoading
    }
  }
} 