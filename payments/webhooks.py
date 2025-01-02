import json
import stripe
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Payment
from .services import PaymentGatewayService

stripe.api_key = settings.STRIPE_SECRET_KEY

class StripeWebhookView(APIView):
    authentication_classes = []
    permission_classes = []

    @csrf_exempt
    def post(self, request, *args, **kwargs):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError as e:
            return Response({'error': 'Invalid payload'}, status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError as e:
            return Response({'error': 'Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)

        if event.type == 'payment_intent.succeeded':
            payment_intent = event.data.object
            self.handle_successful_payment(payment_intent)
        elif event.type == 'payment_intent.payment_failed':
            payment_intent = event.data.object
            self.handle_failed_payment(payment_intent)
        elif event.type == 'charge.refunded':
            charge = event.data.object
            self.handle_refund(charge)

        return Response({'status': 'success'})

    def handle_successful_payment(self, payment_intent):
        try:
            payment = Payment.objects.get(transaction_id=payment_intent.id)
            payment.status = 'completed'
            payment.payment_data.update({
                'stripe_status': payment_intent.status,
                'last_updated': payment_intent.created
            })
            payment.save()

            # Atualizar pedido
            order = payment.order
            order.status = 'processing'
            order.save()

            # Enviar notificação
            from emails.tasks import send_payment_confirmation
            send_payment_confirmation.delay(payment.id)

        except Payment.DoesNotExist:
            # Logar erro
            pass

    def handle_failed_payment(self, payment_intent):
        try:
            payment = Payment.objects.get(transaction_id=payment_intent.id)
            payment.status = 'failed'
            payment.payment_data.update({
                'stripe_status': payment_intent.status,
                'error': payment_intent.last_payment_error,
                'last_updated': payment_intent.created
            })
            payment.save()

            # Enviar notificação
            from emails.tasks import send_payment_failed
            send_payment_failed.delay(payment.id)

        except Payment.DoesNotExist:
            # Logar erro
            pass

    def handle_refund(self, charge):
        try:
            payment = Payment.objects.get(transaction_id=charge.payment_intent)
            payment.status = 'refunded'
            payment.payment_data.update({
                'refund_id': charge.refunds.data[0].id,
                'refund_amount': charge.refunds.data[0].amount,
                'refund_status': charge.refunds.data[0].status,
                'last_updated': charge.created
            })
            payment.save()

            # Atualizar pedido
            order = payment.order
            order.status = 'refunded'
            order.save()

            # Enviar notificação
            from emails.tasks import send_refund_confirmation
            send_refund_confirmation.delay(payment.id)

        except Payment.DoesNotExist:
            # Logar erro
            pass

class PayPalWebhookView(APIView):
    authentication_classes = []
    permission_classes = []

    @csrf_exempt
    def post(self, request, *args, **kwargs):
        webhook_id = request.META.get('HTTP_PAYPAL_TRANSMISSION_ID')
        auth_algo = request.META.get('HTTP_PAYPAL_AUTH_ALGO')
        cert_url = request.META.get('HTTP_PAYPAL_CERT_URL')
        transmission_sig = request.META.get('HTTP_PAYPAL_TRANSMISSION_SIG')
        transmission_time = request.META.get('HTTP_PAYPAL_TRANSMISSION_TIME')

        # Verificar autenticidade do webhook
        paypal = PaymentGatewayService.setup_paypal()
        
        try:
            event = json.loads(request.body)
            event_type = event.get('event_type')

            if event_type == 'PAYMENT.CAPTURE.COMPLETED':
                self.handle_successful_payment(event)
            elif event_type == 'PAYMENT.CAPTURE.DENIED':
                self.handle_failed_payment(event)
            elif event_type == 'PAYMENT.CAPTURE.REFUNDED':
                self.handle_refund(event)

            return Response({'status': 'success'})

        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    def handle_successful_payment(self, event):
        resource = event.get('resource', {})
        payment_id = resource.get('supplementary_data', {}).get('related_ids', {}).get('order_id')
        
        try:
            payment = Payment.objects.get(transaction_id=payment_id)
            payment.status = 'completed'
            payment.payment_data.update({
                'paypal_status': 'completed',
                'capture_id': resource.get('id'),
                'last_updated': event.get('create_time')
            })
            payment.save()

            # Atualizar pedido
            order = payment.order
            order.status = 'processing'
            order.save()

            # Enviar notificação
            from emails.tasks import send_payment_confirmation
            send_payment_confirmation.delay(payment.id)

        except Payment.DoesNotExist:
            # Logar erro
            pass

    def handle_failed_payment(self, event):
        # Implementar lógica similar ao Stripe
        pass

    def handle_refund(self, event):
        # Implementar lógica similar ao Stripe
        pass 