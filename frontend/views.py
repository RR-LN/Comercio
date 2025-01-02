from django.contrib.auth import authenticate
from django.shortcuts import render, get_object_or_404
from django.db.models import Avg, Q
from django.db import transaction
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from django.conf import settings
from django.core.cache import cache
from django.contrib.auth.models import User

from rest_framework.views import APIView
from rest_framework import generics, viewsets, permissions, status, filters
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    Category, Product, Store, StoreProduct, Cart, CartItem, Order, Review, 
    Wishlist, Recommendation, UserProfile, PaymentStatus
)
from .serializers import (
    CategorySerializer, ProductSerializer, StoreSerializer, StoreProductSerializer,
    CartSerializer, CartItemSerializer, OrderSerializer, ReviewSerializer, 
    WishlistSerializer, UserSerializer, UserProfileSerializer, StoreProductCreateSerializer, StoreProductUpdateSerializer
)
from .recommendations import generate_recommendations
from .filters import ProductFilter
from .permissions import IsOwnerOrReadOnly

import stripe
import json
import paypalrestsdk
import logging

# Configuração de logging
logger = logging.getLogger(__name__)

# Configuração do PayPal
# paypalrestsdk.configure({
#     "mode": settings.PAYPAL_MODE,
#     "client_id": settings.PAYPAL_CLIENT_ID,
#     "client_secret": settings.PAYPAL_CLIENT_SECRET
# })
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class BaseViewSet(viewsets.ModelViewSet):
    pagination_class = StandardResultsSetPagination
    throttle_classes = [UserRateThrottle, AnonRateThrottle]

    @swagger_auto_schema(
        operation_description="Retrieve a list of objects.",
        responses={200: "Success", 400: "Bad Request", 401: "Unauthorized"}
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Create a new object.",
        responses={201: "Created", 400: "Bad Request", 401: "Unauthorized"}
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Retrieve a specific object by ID.",
        responses={200: "Success", 404: "Not Found", 401: "Unauthorized"}
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Update an object.",
        responses={200: "Success", 400: "Bad Request", 401: "Unauthorized", 404: "Not Found"}
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Delete an object.",
        responses={204: "No Content", 401: "Unauthorized", 404: "Not Found"}
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

class CategoryViewSet(BaseViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @swagger_auto_schema(
        operation_description="Get products for a specific category.",
        responses={200: ProductSerializer(many=True)}
    )
    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        category = self.get_object()
        products = category.product_set.all()
        page = self.paginate_queryset(products)
        if page is not None:
            serializer = ProductSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

class StoreProductViewSet(BaseViewSet):
    queryset = StoreProduct.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action == 'create':
            return StoreProductCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return StoreProductUpdateSerializer
        return StoreProductSerializer

    @swagger_auto_schema(
        operation_description="Get products for a specific store.",
        manual_parameters=[
            openapi.Parameter('store_id', openapi.IN_QUERY, description="ID of the store", type=openapi.TYPE_INTEGER),
        ],
        responses={200: StoreProductSerializer(many=True), 400: "Bad Request"}
    )
    @action(detail=False, methods=['get'])
    def by_store(self, request):
        store_id = request.query_params.get('store_id')
        if store_id:
            queryset = self.queryset.filter(store_id=store_id)
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        return Response({"error": "store_id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_description="Delete a product.",
        responses={204: "No Content", 400: "Bad Request", 404: "Not Found"}
    )
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.inventory_level > 0:
            return Response({"error": "Cannot delete a product with existing inventory."}, status=status.HTTP_400_BAD_REQUEST)
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProductDetailView(APIView):
    def get(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        related_products = Product.objects.filter(category=product.category).exclude(id=product.id)[:4]
        
        product_serializer = ProductSerializer(product)
        related_serializer = ProductSerializer(related_products, many=True)
        
        data = {
            'product': product_serializer.data,
            'related_products': related_serializer.data
        }
        return Response(data)
    
class ProductViewSet(BaseViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at']

    def get_queryset(self):
        queryset = cache.get('product_queryset')
        if queryset is None:
            queryset = self.queryset.select_related('category').prefetch_related('reviews')
            category_id = self.request.query_params.get('category')
            search_query = self.request.query_params.get('search')
            
            if category_id:
                queryset = queryset.filter(category_id=category_id)
            
            if search_query:
                queryset = queryset.filter(
                    Q(name__icontains=search_query) | 
                    Q(description__icontains=search_query)
                )
            
            queryset = queryset.annotate(average_rating=Avg('reviews__rating'))
            cache.set('product_queryset', queryset, 300)  # Cache for 5 minutes
        
        return queryset

    @swagger_auto_schema(
        operation_description="Get featured products.",
        responses={200: ProductSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def featured(self, request):
        try:
            featured_products = self.get_queryset().filter(is_featured=True)
            page = self.paginate_queryset(featured_products)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(featured_products, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in featured products: {str(e)}")
            return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_description="Get product details including reviews.",
        responses={200: ProductSerializer()}
    )
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        reviews = Review.objects.filter(product=instance)
        review_serializer = ReviewSerializer(reviews, many=True)
        data = serializer.data
        data['reviews'] = review_serializer.data
        return Response(data)

    @swagger_auto_schema(
        operation_description="Add a review to a product.",
        request_body=ReviewSerializer,
        responses={201: ReviewSerializer()}
    )
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_review(self, request, pk=None):
        product = self.get_object()
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, product=product)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StoreViewSet(BaseViewSet):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @swagger_auto_schema(
        method='get',
        operation_description="Get products for a specific store.",
        responses={200: StoreProductSerializer(many=True)}
    )
    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        store = self.get_object()
        store_products = store.storeproduct_set.all()
        serializer = StoreProductSerializer(store_products, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        method='post',
        operation_description="Add a product to a store.",
        request_body=StoreProductSerializer,
        responses={201: StoreProductSerializer, 400: "Bad Request"}
    )
    @action(detail=True, methods=['post'])
    def add_product(self, request, pk=None):
        store = self.get_object()
        serializer = StoreProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(store=store)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        methods=['put', 'patch'],
        operation_description="Update a product in a store.",
        request_body=StoreProductSerializer,
        responses={200: StoreProductSerializer, 400: "Bad Request", 404: "Not Found"}
    )
    @action(detail=True, methods=['put', 'patch'])
    def update_product(self, request, pk=None, product_pk=None):
        store = self.get_object()
        try:
            store_product = store.storeproduct_set.get(pk=product_pk)
        except StoreProduct.DoesNotExist:
            return Response({'error': 'Product not found in this store'}, status=status.HTTP_404_NOT_FOUND)

        serializer = StoreProductSerializer(store_product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        method='delete',
        operation_description="Remove a product from a store.",
        responses={204: "No Content", 404: "Not Found"}
    )
    @action(detail=True, methods=['delete'])
    def remove_product(self, request, pk=None, product_pk=None):
        store = self.get_object()
        try:
            store_product = store.storeproduct_set.get(pk=product_pk)
            store_product.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except StoreProduct.DoesNotExist:
            return Response({'error': 'Product not found in this store'}, status=status.HTTP_404_NOT_FOUND)

class CartViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Get the user's cart.",
        responses={200: CartItemSerializer(many=True)}
    )
    def list(self, request):
        cart_items = CartItem.objects.filter(cart=request.user.cart)
        total = sum(item.quantity * item.store_product.product.price for item in cart_items)
        return Response({'cart_items': CartItemSerializer(cart_items, many=True).data, 'total': total})

    @swagger_auto_schema(
        operation_description="Add a product to the cart.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'product_id': openapi.Schema(type=openapi.TYPE_INTEGER),
            },
            required=['product_id']
        ),
        responses={201: "Created", 400: "Bad Request", 500: "Internal Server Error"}
    )
    @transaction.atomic
    @action(detail=False, methods=['post'])
    def add(self, request):
        try:
            product_id = int(request.data.get('product_id'))
            product = get_object_or_404(Product, pk=product_id)
            cart, created = Cart.objects.get_or_create(user=request.user)
            cart_item, created = CartItem.objects.get_or_create(cart=cart, store_product__product=product)

            if not created:
                cart_item.quantity += 1
                cart_item.save()

            return Response({'success': True}, status=status.HTTP_201_CREATED)
        except (ValueError, Product.DoesNotExist, Cart.DoesNotExist):
            return Response({'error': 'Invalid product ID or other error.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error adding product to cart: {str(e)}")
            return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_description="Remove a product from the cart.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'product_id': openapi.Schema(type=openapi.TYPE_INTEGER),
            },
            required=['product_id']
        ),
        responses={200: "Success", 400: "Bad Request", 500: "Internal Server Error"}
    )
    @transaction.atomic
    @action(detail=False, methods=['post'])
    def remove(self, request):
        try:
            product_id = int(request.data.get('product_id'))
            product = get_object_or_404(Product, pk=product_id)
            cart = get_object_or_404(Cart, user=request.user)
            cart_item = get_object_or_404(CartItem, cart=cart, store_product__product=product)
            cart_item.delete()
            return Response({'success': True})
        except (ValueError, Product.DoesNotExist, Cart.DoesNotExist, CartItem.DoesNotExist):
            return Response({'error': 'Invalid product ID or cart item not found.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error removing product from cart: {str(e)}")
            return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_description="Clear the cart.",
        responses={200: "Success", 404: "Not Found"}
    )
    @action(detail=False, methods=['post'])
    def clear(self, request):
        try:
            cart = Cart.objects.get(user=request.user)
            cart.items.all().delete()
            return Response({'success': True, 'message': 'Cart cleared successfully'})
        except Cart.DoesNotExist:
            return Response({'error': 'Cart not found'}, status=status.HTTP_404_NOT_FOUND)   

class OrderViewSet(BaseViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    @swagger_auto_schema(
        operation_description="Checkout the cart.",
        responses={200: "Success", 400: "Bad Request", 500: "Internal Server Error"}
    )
    @action(detail=False, methods=['post'])
    def checkout(self, request):
        try:
            cart_items = CartItem.objects.filter(cart=request.user.cart)
            if not cart_items.exists():
                return Response({'error': 'Your cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

            order = Order.objects.create(user=request.user)
            for item in cart_items:
                order.items.add(item)
                item.delete()

            return Response({'success': True, 'order_id': order.id})
        except Exception as e:
            logger.error(f"Error during checkout: {str(e)}")
            return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_description="Get order history.",
        responses={200: OrderSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def history(self, request):
        orders = self.get_queryset().order_by('-created_at')
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)

class CartItemViewSet(BaseViewSet):
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return CartItem.objects.filter(cart__user=user)

    @swagger_auto_schema(
        operation_description="Create a new cart item.",
        request_body=CartItemSerializer,
        responses={201: CartItemSerializer, 400: "Bad Request"}
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            logger.error(f"Error creating cart item: {str(e)}")
            return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_description="Get the user's cart items.",
        responses={200: CartItemSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], url_path='my-cart-items')
    def my_cart_items(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @swagger_auto_schema(
        operation_description="Update the quantity of a cart item.",
        request_body=CartItemSerializer,
        responses={200: CartItemSerializer, 400: "Bad Request"}
    )
    @action(detail=True, methods=['put'])
    def update_quantity(self, request, pk=None):
        cart_item = self.get_object()
        serializer = self.get_serializer(cart_item, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_description="Remove a cart item.",
        responses={204: "No Content"}
    )
    @action(detail=True, methods=['delete'])
    def remove_item(self, request, pk=None):
        cart_item = self.get_object()
        cart_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class SearchViewSet(viewsets.ViewSet):
    @swagger_auto_schema(
        operation_description="Search for products.",
        manual_parameters=[
            openapi.Parameter('q', openapi.IN_QUERY, description="Search query", type=openapi.TYPE_STRING),
        ],
        responses={200: "Success"}
    )
    @action(detail=False, methods=['get'])
    def products(self, request):
        query = request.GET.get('q')
        if query:
            products = Product.objects.filter(name__icontains=query)
        else:
            products = []
        return Response({
            'query': query,
            'products': [product.to_dict() for product in products]
        })
    
class ContactViewSet(viewsets.ViewSet):
    @swagger_auto_schema(
        operation_description="Submit a contact form.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'name': openapi.Schema(type=openapi.TYPE_STRING),
                'email': openapi.Schema(type=openapi.TYPE_STRING),
                'message': openapi.Schema(type=openapi.TYPE_STRING),
            },
            required=['name', 'email', 'message']
        ),
        responses={200: "Success"}
    )
    @action(detail=False, methods=['post'])
    def submit(self, request):
        data = request.data
        name = data.get('name')
        email = data.get('email')
        message = data.get('message')
        
        try:
            send_mail(
                f'Contact form submission from {name}',
                message,
                email,
                [settings.DEFAULT_FROM_EMAIL],
                fail_silently=False,
            )
            return Response({'status': 'success', 'message': 'Your message has been sent.'})
        except Exception as e:
            logger.error(f"Error sending contact form email: {str(e)}")
            return Response({'status': 'error', 'message': 'An error occurred while sending your message.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CheckoutViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="View checkout information.",
        responses={200: "Success"}
    )
    @action(detail=False, methods=['get'])
    def view(self, request):
        cart_items = CartItem.objects.filter(cart=request.user.cart)
        total = sum(item.quantity * item.product.price for item in cart_items)
        return Response({
            'cart_items': [item.to_dict() for item in cart_items],
            'total': total
        })

    @swagger_auto_schema(
        operation_description="Process checkout.",
        responses={200: "Success"}
    )
    @action(detail=False, methods=['post'])
    def process(self, request):
        # Logic to process the checkout
        return Response({'success': True, 'message': 'Checkout realizado com sucesso'}, status=status.HTTP_200_OK)

class AboutViewSet(viewsets.ViewSet):
    @swagger_auto_schema(
        operation_description="Get about information.",
        responses={200: "Success"}
    )
    @action(detail=False, methods=['get'])
    def info(self, request):
        return Response({'about': 'Your about information here'})

@csrf_exempt
def checkout(request):
    if request.method == "POST":
        try:
            stripe.api_key = settings.STRIPE_SECRET_KEY
            data = json.loads(request.body)
            shipping_address = data.get("shippingAddress")
            payment_method = data.get("paymentMethod")
            card_details = data.get("cardDetails")
            
            # Validate user data here
            # ...

            # Create a payment intent with Stripe
            intent = stripe.PaymentIntent.create(
                amount=1000,  # Amount in cents
                currency="usd",
                payment_method_types=["card"],
                metadata={"shipping_address": shipping_address}
            )
            
            return JsonResponse({"clientSecret": intent.client_secret})
        except stripe.error.CardError as e:
            logger.error(f"Stripe card error: {str(e)}")
            return JsonResponse({"error": str(e)}, status=400)
        except Exception as e:
            logger.error(f"Unexpected error during checkout: {str(e)}")
            return JsonResponse({"error": "An unexpected error occurred"}, status=500)
    else:
        return JsonResponse({"error": "Invalid method"}, status=405)

@csrf_exempt
def create_payment_intent(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            order_id = data.get('orderID')
            amount = int(data.get('amount') * 100)  # Convert to cents
            order = get_object_or_404(Order, id=order_id)
            
            client_secret = order.create_stripe_payment_intent(amount)
            
            return JsonResponse({'clientSecret': client_secret})
        except Exception as e:
            logger.error(f"Error creating payment intent: {str(e)}")
            return JsonResponse({'error': 'An unexpected error occurred'}, status=400)
    return JsonResponse({'error': 'Invalid request.'}, status=405)

@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META['HTTP_STRIPE_SIGNATURE']
    stripe.api_key = settings.STRIPE_SECRET_KEY

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            order = get_object_or_404(Order, stripe_payment_intent=payment_intent.id)
            order.payment_status = PaymentStatus.PAID.value
            order.save()
        return HttpResponse(status=200)
    except ValueError as e:
        logger.error(f"Invalid payload: {str(e)}")
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid signature: {str(e)}")
        return HttpResponse(status=400)

@csrf_exempt
def paypal_create_payment(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            amount = data.get('amount')
            
            payment = paypalrestsdk.Payment({
                "intent": "sale",
                "payer": {"payment_method": "paypal"},
                "redirect_urls": {
                    "return_url": "http://localhost:3000/payment/execute",
                    "cancel_url": "http://localhost:3000/payment/cancel"
                },
                "transactions": [{
                    "amount": {
                        "total": str(amount),
                        "currency": "USD"
                    },
                    "description": "This is the payment transaction description."
                }]
            })

            if payment.create():
                return JsonResponse({"paymentID": payment.id})
            else:
                logger.error(f"Error creating PayPal payment: {payment.error}")
                return JsonResponse({"error": payment.error}, status=400)
        except Exception as e:
            logger.error(f"Unexpected error in PayPal payment creation: {str(e)}")
            return JsonResponse({"error": "An unexpected error occurred"}, status=500)
    else:
        return JsonResponse({"error": "Invalid method"}, status=405)

@csrf_exempt
def paypal_execute_payment(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            payment_id = data.get('paymentID')
            payer_id = data.get('payerID')

            payment = paypalrestsdk.Payment.find(payment_id)
            
            if payment.execute({"payer_id": payer_id}):
                return JsonResponse({"success": True})
            else:
                logger.error(f"Error executing PayPal payment: {payment.error}")
                return JsonResponse({"error": payment.error}, status=400)
        except Exception as e:
            logger.error(f"Unexpected error in PayPal payment execution: {str(e)}")
            return JsonResponse({"error": "An unexpected error occurred"}, status=500)
    else:
        return JsonResponse({"error": "Invalid method"}, status=405)

class ReviewViewSet(BaseViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @swagger_auto_schema(
        operation_description="Create a new review.",
        request_body=ReviewSerializer,
        responses={201: ReviewSerializer, 400: "Bad Request"}
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @swagger_auto_schema(
        operation_description="Get reviews for a specific product.",
        manual_parameters=[
            openapi.Parameter('product_id', openapi.IN_QUERY, description="ID of the product", type=openapi.TYPE_INTEGER),
        ],
        responses={200: ReviewSerializer(many=True), 400: "Bad Request"}
    )
    @action(detail=False, methods=['get'])
    def by_product(self, request):
        product_id = request.query_params.get('product_id')
        if product_id:
            reviews = self.queryset.filter(product_id=product_id)
            serializer = self.get_serializer(reviews, many=True)
            return Response(serializer.data)
        return Response({"error": "product_id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.update_product_average()

    def update_product_average(self):
        average = self.product.reviews.aggregate(Avg('rating'))['rating__avg']
        self.product.average_rating = round(average, 2) if average else 0
        self.product.save()

class WishlistViewSet(BaseViewSet):
    queryset = Wishlist.objects.all()
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    @swagger_auto_schema(
        operation_description="Add a product to the wishlist.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'product_id': openapi.Schema(type=openapi.TYPE_INTEGER),
            },
            required=['product_id']
        ),
        responses={201: WishlistSerializer, 400: "Bad Request"}
    )
    @action(detail=False, methods=['post'])
    def add(self, request):
        product_id = request.data.get('product_id')
        product = get_object_or_404(Product, id=product_id)
        wishlist, created = Wishlist.objects.get_or_create(user=request.user, product=product)
        serializer = self.get_serializer(wishlist)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_description="Remove a product from the wishlist.",
        manual_parameters=[
            openapi.Parameter('product_id', openapi.IN_QUERY, description="ID of the product", type=openapi.TYPE_INTEGER),
        ],
        responses={204: "No Content", 404: "Not Found"}
    )
    @action(detail=False, methods=['delete'])
    def remove(self, request):
        product_id = request.query_params.get('product_id')
        wishlist_item = get_object_or_404(Wishlist, user=request.user, product_id=product_id)
        wishlist_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

def get_recommendations(user):
    # Simple recommendation system based on user's purchase history
    user_orders = Order.objects.filter(user=user)
    purchased_products = Product.objects.filter(orderitem__order__in=user_orders).distinct()
    
    # Get categories of purchased products
    categories = Category.objects.filter(product__in=purchased_products).distinct()
    
    # Recommend products from the same categories that the user hasn't purchased yet
    recommendations = Product.objects.filter(category__in=categories).exclude(id__in=purchased_products)
    
    return recommendations[:5]  # Return top 5 recommendations

class RecommendationViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Get product recommendations for the user.",
        responses={200: ProductSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def for_user(self, request):
        recommendations = get_recommendations(request.user)
        serializer = ProductSerializer(recommendations, many=True)
        return Response(serializer.data)

@api_view(['GET'])
def get_recommendations(request, product_id):
    product = get_object_or_404(Product, pk=product_id)
    
    # Generate recommendations if they don't exist
    if not product.recommendations.exists():
        generate_recommendations(product)
    
    recommendations = product.recommendations.order_by('-score')[:5]  # Top 5 recommendations
    recommended_products = [r.recommended_product for r in recommendations]
    
    serializer = ProductSerializer(recommended_products, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def recommended_products(request):
    # This is a simple recommendation logic. You might want to implement a more sophisticated algorithm.
    recommended = Product.objects.order_by('-average_rating')[:8]
    serializer = ProductSerializer(recommended, many=True)
    return Response(serializer.data)


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.userprofile
