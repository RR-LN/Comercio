from rest_framework import serializers
from .models import Payment, PaymentMethod

class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ['id', 'name', 'code', 'is_active']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'amount', 'payment_method',
            'status', 'transaction_id', 'created_at'
        ]
        read_only_fields = ['status', 'transaction_id']

class StripePaymentIntentSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField(default='BRL')
    payment_method_id = serializers.CharField()
    description = serializers.CharField(required=False)

class PayPalOrderSerializer(serializers.Serializer):
    order_id = serializers.CharField()
    payer_id = serializers.CharField() 