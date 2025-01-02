from celery import shared_task
from django.conf import settings
from django.template.loader import render_to_string
from django.core.mail import send_mail
from payments.models import Payment

@shared_task
def send_payment_confirmation(payment_id):
    try:
        payment = Payment.objects.get(id=payment_id)
        order = payment.order
        user = order.user

        context = {
            'user': user,
            'order': order,
            'payment': payment,
            'site_url': settings.SITE_URL
        }

        html_content = render_to_string('emails/payment_confirmation.html', context)
        text_content = render_to_string('emails/payment_confirmation.txt', context)

        send_mail(
            subject=f'Pagamento Confirmado - Pedido #{order.id}',
            message=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_content
        )

    except Payment.DoesNotExist:
        # Logar erro
        pass

@shared_task
def send_payment_failed(payment_id):
    try:
        payment = Payment.objects.get(id=payment_id)
        order = payment.order
        user = order.user

        context = {
            'user': user,
            'order': order,
            'payment': payment,
            'site_url': settings.SITE_URL
        }

        html_content = render_to_string('emails/payment_failed.html', context)
        text_content = render_to_string('emails/payment_failed.txt', context)

        send_mail(
            subject=f'Falha no Pagamento - Pedido #{order.id}',
            message=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_content
        )

    except Payment.DoesNotExist:
        # Logar erro
        pass

@shared_task
def send_refund_confirmation(payment_id):
    try:
        payment = Payment.objects.get(id=payment_id)
        order = payment.order
        user = order.user

        context = {
            'user': user,
            'order': order,
            'payment': payment,
            'site_url': settings.SITE_URL
        }

        html_content = render_to_string('emails/refund_confirmation.html', context)
        text_content = render_to_string('emails/refund_confirmation.txt', context)

        send_mail(
            subject=f'Reembolso Confirmado - Pedido #{order.id}',
            message=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_content
        )

    except Payment.DoesNotExist:
        # Logar erro
        pass

def send_async_email(subject, message, recipient_list, html_message=None):
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=recipient_list,
        html_message=html_message
    )
 