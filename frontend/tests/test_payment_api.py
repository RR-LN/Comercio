from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch
from ..models import Order, Payment
from ..serializers import PaymentSerializer

class PaymentAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.order = Order.objects.create(
            total_amount=100.00,
            status='pending'
        )
        self.payment_url = reverse('payment-create')
        self.valid_payload = {
            'order_id': str(self.order.id),
            'amount': 100.00,
            'payment_method': 'credit_card',
            'card_token': 'tok_visa'
        }

    @patch('stripe.PaymentIntent.create')
    def test_create_payment_success(self, mock_stripe_create):
        mock_stripe_create.return_value = {
            'id': 'pi_test',
            'client_secret': 'test_secret'
        }

        response = self.client.post(
            self.payment_url,
            self.valid_payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Payment.objects.count(), 1)
        self.assertEqual(
            Payment.objects.get().status,
            'pending'
        )

    def test_create_payment_invalid_order(self):
        self.valid_payload['order_id'] = 'invalid-id'
        
        response = self.client.post(
            self.payment_url,
            self.valid_payload,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST) 