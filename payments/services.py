import stripe
import paypalrestsdk
from django.conf import settings
from typing import Dict, Any

class PaymentGatewayService:
    @staticmethod
    def setup_stripe():
        stripe.api_key = settings.STRIPE_SECRET_KEY
        return stripe

    @staticmethod
    def setup_paypal():
        paypalrestsdk.configure({
            "mode": settings.PAYPAL_MODE,  # sandbox or live
            "client_id": settings.PAYPAL_CLIENT_ID,
            "client_secret": settings.PAYPAL_CLIENT_SECRET
        })
        return paypalrestsdk

class StripeService:
    def __init__(self):
        self.stripe = PaymentGatewayService.setup_stripe()

    def create_payment_intent(self, amount: int, currency: str = 'brl', **kwargs) -> Dict[str, Any]:
        try:
            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency=currency,
                **kwargs
            )
            return {
                'success': True,
                'intent': intent,
                'client_secret': intent.client_secret
            }
        except stripe.error.StripeError as e:
            return {
                'success': False,
                'error': str(e)
            }

    def confirm_payment(self, payment_intent_id: str) -> Dict[str, Any]:
        try:
            intent = stripe.PaymentIntent.confirm(payment_intent_id)
            return {
                'success': True,
                'status': intent.status
            }
        except stripe.error.StripeError as e:
            return {
                'success': False,
                'error': str(e)
            }

    def refund_payment(self, payment_intent_id: str, amount: int = None) -> Dict[str, Any]:
        try:
            refund = stripe.Refund.create(
                payment_intent=payment_intent_id,
                amount=amount
            )
            return {
                'success': True,
                'refund': refund
            }
        except stripe.error.StripeError as e:
            return {
                'success': False,
                'error': str(e)
            }

class PayPalService:
    def __init__(self):
        self.paypal = PaymentGatewayService.setup_paypal()

    def create_payment(self, amount: float, currency: str = 'BRL', **kwargs) -> Dict[str, Any]:
        payment = self.paypal.Payment({
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": settings.PAYPAL_RETURN_URL,
                "cancel_url": settings.PAYPAL_CANCEL_URL
            },
            "transactions": [{
                "amount": {
                    "total": str(amount),
                    "currency": currency
                },
                "description": kwargs.get('description', 'Payment for order')
            }]
        })

        if payment.create():
            return {
                'success': True,
                'payment': payment,
                'approval_url': next(link.href for link in payment.links if link.rel == 'approval_url')
            }
        else:
            return {
                'success': False,
                'error': payment.error
            }

    def execute_payment(self, payment_id: str, payer_id: str) -> Dict[str, Any]:
        payment = self.paypal.Payment.find(payment_id)
        if payment.execute({"payer_id": payer_id}):
            return {
                'success': True,
                'payment': payment
            }
        else:
            return {
                'success': False,
                'error': payment.error
            }

class PixService:
    def generate_qrcode(self, payment: 'Payment') -> Dict[str, Any]:
        # Implementar integração com API do Banco Central ou PSP
        # para gerar QR Code do PIX
        return {
            'success': True,
            'qr_code': 'QR_CODE_DATA',
            'expiration': '30m'
        }

    def check_status(self, payment: 'Payment') -> Dict[str, Any]:
        # Implementar verificação de status do PIX
        return {
            'success': True,
            'status': 'pending'
        }

class BankSlipService:
    def generate_slip(self, payment: 'Payment') -> Dict[str, Any]:
        # Implementar integração com serviço de boletos
        return {
            'success': True,
            'barcode': '123456789',
            'pdf_url': 'https://example.com/boleto.pdf'
        }

    def check_status(self, payment: 'Payment') -> Dict[str, Any]:
        # Implementar verificação de status do boleto
        return {
            'success': True,
            'status': 'pending'
        } 