from django.urls import path
from . import views

app_name = 'emails'

urlpatterns = [
    path('send-confirmation/', views.SendConfirmationEmailView.as_view(), name='send-confirmation'),
    path('send-password-reset/', views.SendPasswordResetEmailView.as_view(), name='send-password-reset'),
    path('send-order-notification/<str:order_id>/', views.SendOrderNotificationView.as_view(), name='send-order-notification'),
    path('send-newsletter/', views.SendNewsletterView.as_view(), name='send-newsletter'),
    path('verify/', views.VerifyEmailView.as_view(), name='verify-email'),
    path('subscribe/', views.NewsletterSubscriptionView.as_view(), name='subscribe'),
    path('unsubscribe/', views.NewsletterUnsubscriptionView.as_view(), name='unsubscribe'),
]