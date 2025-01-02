import { apiService } from './base'

export const emailService = {
  // Enviar email de confirmação
  async sendConfirmationEmail(email: string): Promise<void> {
    return apiService.post('/email/send-confirmation/', { email })
  },

  // Enviar email de recuperação de senha
  async sendPasswordResetEmail(email: string): Promise<void> {
    return apiService.post('/email/send-password-reset/', { email })
  },

  // Enviar email de notificação de pedido
  async sendOrderNotification(orderId: string): Promise<void> {
    return apiService.post(`/email/send-order-notification/${orderId}/`)
  },

  // Enviar email de newsletter
  async sendNewsletter(subject: string, content: string, recipients: string[]): Promise<void> {
    return apiService.post('/email/send-newsletter/', {
      subject,
      content,
      recipients
    })
  },

  // Verificar status do email
  async verifyEmail(token: string): Promise<void> {
    return apiService.post('/email/verify/', { token })
  }
} 