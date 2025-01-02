from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Product, Store, ProductVariant, Cart, CartItem, Order, Review, Wishlist, UserProfile, StoreProduct

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['bio', 'avatar', 'birth_date']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'comment', 'created_at', 'updated_at']

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    image = serializers.ImageField(required=False)
    average_rating = serializers.FloatField(read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'is_featured', 'slug', 'image', 'category', 'stock', 'average_rating', 'reviews', 'created_at', 'updated_at']

class StoreSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Store
        fields = ['id', 'name', 'description', 'owner', 'created_at', 'updated_at']

class ProductVariantSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = ProductVariant
        fields = ['id', 'product', 'name', 'sku', 'price', 'created_at', 'updated_at']

class StoreProductSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    store = StoreSerializer(read_only=True)

    class Meta:
        model = StoreProduct
        fields = ['id', 'product', 'store', 'price', 'inventory_level', 'created_at', 'updated_at']

class StoreProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreProduct
        fields = ['store', 'product', 'price', 'inventory_level']
        extra_kwargs = {
            'store': {'error_messages': {'required': 'Store is required.'}},
            'product': {'error_messages': {'required': 'Product is required.'}},
            'price': {'error_messages': {'required': 'Price is required.'}},
            'inventory_level': {'error_messages': {'required': 'Inventory level is required.'}},
        }

class StoreProductUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreProduct
        fields = ['price', 'inventory_level']
        extra_kwargs = {
            'price': {'error_messages': {'required': 'Price is required.'}},
            'inventory_level': {'error_messages': {'required': 'Inventory level is required.'}},
        }

class CartItemSerializer(serializers.ModelSerializer):
    store_product = StoreProductSerializer(read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'cart', 'store_product', 'quantity', 'total_price', 'created_at', 'updated_at']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_price', 'created_at', 'updated_at']

class OrderSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    items = CartItemSerializer(many=True, read_only=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'items', 'total_amount', 'status', 'payment_status', 'payment_method', 'stripe_payment_intent_id', 'paypal_payment_id', 'tracking_number', 'created_at', 'updated_at']

class WishlistSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    products = ProductSerializer(many=True, read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'products', 'created_at', 'updated_at']

class WishlistCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wishlist
        fields = ['products']
        extra_kwargs = {
            'products': {'error_messages': {'required': 'At least one product is required.'}},
        }