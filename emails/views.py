from django.shortcuts import render, redirect
from django.core.mail import send_mail
from .models import Email
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from .serializers import EmailSerializer, NewsletterSerializer
from .tasks import send_async_email  # Se estiver usando Celery
from django.views import View
from django.http import JsonResponse

def email_list(request):
    emails = Email.objects.all()
    return render(request, 'emails/email_list.html', {'emails': emails})

def send_email(request):
    if request.method == 'POST':
        subject = request.POST['subject']
        message = request.POST['message']
        from_email = request.POST['from_email']
        to_email = request.POST['to_email']
        send_mail(subject, message, from_email, [to_email])
        return redirect('emails:email_list')
    return render(request, 'emails/send_email.html')

def read_email(request, pk):
    email = Email.objects.get(pk=pk)
    return render(request, 'emails/read_email.html', {'email': email})

def reply_email(request, pk):
    email = Email.objects.get(pk=pk)
    if request.method == 'POST':
        subject = request.POST['subject']
        message = request.POST['message']
        from_email = request.POST['from_email']
        to_email = email.from_email
        send_mail(subject, message, from_email, [to_email])
        return redirect('emails:email_list')
    return render(request, 'emails/reply_email.html', {'email': email})

def delete_email(request, pk):
    email = Email.objects.get(pk=pk)
    email.delete()
    return redirect('emails:email_list')

class SendConfirmationEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            # Gerar token de confirmação
            token = generate_confirmation_token(email)
            
            # Renderizar template
            html_content = render_to_string('emails/confirmation.html', {
                'token': token,
                'domain': settings.FRONTEND_URL
            })
            text_content = strip_tags(html_content)
            
            # Enviar email assíncrono
            send_async_email.delay(
                subject='Confirme seu email',
                message=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                html_message=html_content
            )
            
            return Response({'message': 'Email de confirmação enviado'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SendPasswordResetEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            # Gerar token de reset
            token = generate_password_reset_token(email)
            
            # Renderizar template
            html_content = render_to_string('emails/password_reset.html', {
                'token': token,
                'domain': settings.FRONTEND_URL
            })
            text_content = strip_tags(html_content)
            
            # Enviar email assíncrono
            send_async_email.delay(
                subject='Redefinição de senha',
                message=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                html_message=html_content
            )
            
            return Response({'message': 'Email de redefinição enviado'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SendOrderNotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id, user=request.user)
            
            # Renderizar template
            html_content = render_to_string('emails/order_notification.html', {
                'order': order,
                'domain': settings.FRONTEND_URL
            })
            text_content = strip_tags(html_content)
            
            # Enviar email assíncrono
            send_async_email.delay(
                subject=f'Pedido #{order.id} - Atualização',
                message=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[request.user.email],
                html_message=html_content
            )
            
            return Response({'message': 'Notificação enviada'})
        except Order.DoesNotExist:
            return Response(
                {'error': 'Pedido não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

class SendNewsletterView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = NewsletterSerializer(data=request.data)
        if serializer.is_valid():
            subject = serializer.validated_data['subject']
            content = serializer.validated_data['content']
            recipients = serializer.validated_data['recipients']
            
            # Renderizar template
            html_content = render_to_string('emails/newsletter.html', {
                'content': content
            })
            text_content = strip_tags(html_content)
            
            # Enviar email em lote
            for recipient_batch in batch(recipients, 50):
                send_async_email.delay(
                    subject=subject,
                    message=text_content,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=recipient_batch,
                    html_message=html_content
                )
            
            return Response({'message': 'Newsletter enviada'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token')
        try:
            email = verify_email_token(token)
            user = User.objects.get(email=email)
            user.is_verified = True
            user.save()
            return Response({'message': 'Email verificado com sucesso'})
        except:
            return Response(
                {'error': 'Token inválido ou expirado'},
                status=status.HTTP_400_BAD_REQUEST
            )

class NewsletterSubscriptionView(View):
    def post(self, request):
        # Lógica para assinar a newsletter
        return JsonResponse({'message': 'Inscrição realizada com sucesso!'})

class NewsletterUnsubscriptionView(View):
    def post(self, request):
        # Lógica para desinscrever da newsletter
        return JsonResponse({'message': 'Desinscrição realizada com sucesso!'})