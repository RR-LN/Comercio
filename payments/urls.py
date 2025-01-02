from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    # Stripe
    path('stripe/create-intent/', views.CreateStripeIntentView.as_view(), name='create-stripe-intent'),
    path('stripe/confirm/', views.ConfirmStripePaymentView.as_view(), name='confirm-stripe'),
    path('stripe/webhook/', views.StripeWebhookView.as_view(), name='stripe-webhook'),
    
    # PayPal
    path('paypal/create-order/', views.CreatePayPalOrderView.as_view(), name='create-paypal-order'),
    path('paypal/capture/', views.CapturePayPalPaymentView.as_view(), name='capture-paypal'),
    path('paypal/webhook/', views.PayPalWebhookView.as_view(), name='paypal-webhook'),
    
    # Métodos genéricos
    path('methods/', views.PaymentMethodsView.as_view(), name='payment-methods'),
    path('process/<str:order_id>/', views.ProcessPaymentView.as_view(), name='process-payment'),
    path('webhooks/stripe/', views.StripeWebhookView.as_view(), name='stripe-webhook'),
    path('webhooks/paypal/', views.PayPalWebhookView.as_view(), name='paypal-webhook'),
] 