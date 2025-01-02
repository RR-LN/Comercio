import stripe
from django.conf import settings
from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import (
    PaymentMethodSerializer,
    PaymentSerializer,
    StripePaymentIntentSerializer,
    PayPalOrderSerializer
)
from .models import Payment, PaymentMethod
from .services import StripeService, PayPalService, PixService, BankSlipService
from django.views import View
from django.http import JsonResponse

stripe.api_key = settings.STRIPE_SECRET_KEY

class CreateStripeIntentView(views.APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = StripePaymentIntentSerializer(data=request.data)
        if serializer.is_valid():
            try:
                intent = stripe.PaymentIntent.create(
                    amount=int(serializer.validated_data['amount'] * 100),
                    currency=serializer.validated_data['currency'],
                    payment_method=serializer.validated_data['payment_method_id'],
                    confirmation_method='manual',
                    confirm=True,
                )
                return Response({
                    'client_secret': intent.client_secret,
                    'status': intent.status,
                })
            except stripe.error.StripeError as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ConfirmStripePaymentView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        payment_intent_id = request.data.get('payment_intent_id')
        try:
            intent = stripe.PaymentIntent.confirm(payment_intent_id)
            return Response({'status': intent.status})
        except stripe.error.StripeError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class PaymentMethodsView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        methods = PaymentMethod.objects.filter(is_active=True)
        serializer = PaymentMethodSerializer(methods, many=True)
        return Response(serializer.data)

class ProcessPaymentView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id, user=request.user)
            payment_method = request.data.get('payment_method')
            
            # Criar pagamento
            payment = Payment.objects.create(
                order=order,
                amount=order.total,
                payment_method=payment_method,
                status='processing'
            )

            # Processar pagamento baseado no método
            if payment_method == 'credit_card':
                result = self.process_credit_card(request.data, payment)
            elif payment_method == 'paypal':
                result = self.process_paypal(request.data, payment)
            elif payment_method == 'pix':
                result = self.process_pix(payment)
            elif payment_method == 'bank_slip':
                result = self.process_bank_slip(payment)
            else:
                raise ValueError('Invalid payment method')

            return Response(result)

        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def process_credit_card(self, data, payment):
        stripe_service = StripeService()
        result = stripe_service.create_payment_intent(
            amount=int(payment.amount * 100),
            currency='brl',
            payment_method=data.get('payment_method_id'),
            metadata={'order_id': str(payment.order.id)}
        )

        if result['success']:
            payment.transaction_id = result['intent'].id
            payment.payment_data = {
                'client_secret': result['client_secret']
            }
            payment.save()
            return {
                'client_secret': result['client_secret'],
                'status': 'processing'
            }
        else:
            payment.status = 'failed'
            payment.payment_data = {'error': result['error']}
            payment.save()
            raise ValueError(result['error'])

    def process_paypal(self, data, payment):
        paypal_service = PayPalService()
        result = paypal_service.create_payment(
            amount=float(payment.amount),
            description=f'Order {payment.order.id}'
        )

        if result['success']:
            payment.transaction_id = result['payment'].id
            payment.payment_data = {
                'approval_url': result['approval_url']
            }
            payment.save()
            return {
                'approval_url': result['approval_url'],
                'status': 'processing'
            }
        else:
            payment.status = 'failed'
            payment.payment_data = {'error': result['error']}
            payment.save()
            raise ValueError(result['error'])

    def process_pix(self, payment):
        pix_service = PixService()
        result = pix_service.generate_qrcode(payment)

        if result['success']:
            payment.payment_data = {
                'qr_code': result['qr_code'],
                'expiration': result['expiration']
            }
            payment.save()
            return {
                'qr_code': result['qr_code'],
                'expiration': result['expiration'],
                'status': 'processing'
            }
        else:
            payment.status = 'failed'
            payment.payment_data = {'error': result['error']}
            payment.save()
            raise ValueError(result['error'])

    def process_bank_slip(self, payment):
        bank_slip_service = BankSlipService()
        result = bank_slip_service.generate_slip(payment)

        if result['success']:
            payment.payment_data = {
                'barcode': result['barcode'],
                'pdf_url': result['pdf_url']
            }
            payment.save()
            return {
                'barcode': result['barcode'],
                'pdf_url': result['pdf_url'],
                'status': 'processing'
            }
        else:
            payment.status = 'failed'
            payment.payment_data = {'error': result['error']}
            payment.save()
            raise ValueError(result['error'])

class StripeWebhookView(View):
    def post(self, request):
        payload = request.body
        sig_header = request.META['HTTP_STRIPE_SIGNATURE']
        endpoint_secret = settings.STRIPE_ENDPOINT_SECRET

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        except ValueError as e:
            # Invalid payload
            return JsonResponse({'error': str(e)}, status=400)
        except stripe.error.SignatureVerificationError as e:
            # Invalid signature
            return JsonResponse({'error': str(e)}, status=400)

        # Handle the event
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']  # contains a stripe.PaymentIntent
            # Process the payment here
        # ... handle other event types

        return JsonResponse({'status': 'success'}, status=200) 

class CreatePayPalOrderView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        paypal_service = PayPalService()
        order_data = {
            'amount': request.data.get('amount'),
            'currency': request.data.get('currency'),
            'description': request.data.get('description'),
        }
        
        result = paypal_service.create_order(order_data)

        if result['success']:
            return Response({'approval_url': result['approval_url']}, status=status.HTTP_201_CREATED)
        else:
            return Response({'error': result['error']}, status=status.HTTP_400_BAD_REQUEST) 

class CapturePayPalPaymentView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        payment_id = request.data.get('payment_id')
        paypal_service = PayPalService()
        
        result = paypal_service.capture_payment(payment_id)

        if result['success']:
            return Response({'message': 'Pagamento capturado com sucesso!'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': result['error']}, status=status.HTTP_400_BAD_REQUEST) 

class PayPalWebhookView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Aqui você deve processar o payload do webhook do PayPal
        payload = request.body
        # Você pode usar o PayPalService para processar o evento
        paypal_service = PayPalService()
        
        # Exemplo de como processar o evento
        event = paypal_service.process_webhook(payload)

        if event['success']:
            return Response({'status': 'success'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': event['error']}, status=status.HTTP_400_BAD_REQUEST) 