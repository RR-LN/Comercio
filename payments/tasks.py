from celery import shared_task
from django.conf import settings
from .models import Payment
from .services import StripeService, PayPalService, PixService, BankSlipService

@shared_task
def process_payment(payment_id):
    try:
        payment = Payment.objects.get(id=payment_id)
        
        if payment.payment_method == 'credit_card':
            process_credit_card_payment(payment)
        elif payment.payment_method == 'paypal':
            process_paypal_payment(payment)
        elif payment.payment_method == 'pix':
            generate_pix_qrcode(payment)
        elif payment.payment_method == 'bank_slip':
            generate_bank_slip(payment)
            
    except Payment.DoesNotExist:
        return False
    except Exception as e:
        payment.status = 'failed'
        payment.payment_data['error'] = str(e)
        payment.save()
        return False
        
    return True

@shared_task
def check_payment_status(payment_id):
    try:
        payment = Payment.objects.get(id=payment_id)
        
        if payment.status == 'processing':
            # Verificar status no gateway
            if payment.payment_method == 'credit_card':
                check_credit_card_status(payment)
            elif payment.payment_method == 'paypal':
                check_paypal_status(payment)
            elif payment.payment_method == 'pix':
                check_pix_status(payment)
            elif payment.payment_method == 'bank_slip':
                check_bank_slip_status(payment)
                
    except Payment.DoesNotExist:
        return False
        
    return True 

def check_credit_card_status(payment):
    stripe_service = StripeService()
    result = stripe_service.confirm_payment(payment.transaction_id)
    
    if result['success']:
        if result['status'] == 'succeeded':
            payment.status = 'completed'
        elif result['status'] == 'failed':
            payment.status = 'failed'
        payment.save()
    return result['success']

def check_paypal_status(payment):
    paypal_service = PayPalService()
    payment_obj = paypal_service.paypal.Payment.find(payment.transaction_id)
    
    if payment_obj.state == 'approved':
        payment.status = 'completed'
        payment.save()
        return True
    elif payment_obj.state in ['failed', 'cancelled']:
        payment.status = 'failed'
        payment.save()
    return False

def check_pix_status(payment):
    pix_service = PixService()
    result = pix_service.check_status(payment)
    
    if result['success']:
        if result['status'] == 'paid':
            payment.status = 'completed'
            payment.save()
            return True
    return False

def check_bank_slip_status(payment):
    bank_slip_service = BankSlipService()
    result = bank_slip_service.check_status(payment)
    
    if result['success']:
        if result['status'] == 'paid':
            payment.status = 'completed'
            payment.save()
            return True
    return False 