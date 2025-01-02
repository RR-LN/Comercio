from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views
from .views import (
    CategoryViewSet, ProductViewSet, StoreViewSet, StoreProductViewSet,
    CartViewSet, CartItemViewSet, OrderViewSet, AboutViewSet, CheckoutViewSet,
    SearchViewSet, ContactViewSet, ReviewViewSet, WishlistViewSet,
    RecommendationViewSet, UserProfileView, ProductDetailView,
    checkout, create_payment_intent, stripe_webhook,
    paypal_create_payment, paypal_execute_payment,
    get_recommendations, recommended_products
)

app_name = 'frontend'

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'categories', CategoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('categories/<uuid:pk>/products/', CategoryViewSet.as_view({'get': 'products'}), name='category-products'),
    path('stores/<uuid:pk>/products/', StoreViewSet.as_view({'get': 'products'}), name='store-products'),
    path('stores/<uuid:pk>/add-product/', StoreViewSet.as_view({'post': 'add_product'}), name='store-add-product'),
    path('stores/<uuid:pk>/update-product/<uuid:product_pk>/', StoreViewSet.as_view({'put': 'update_product', 'patch': 'update_product'}), name='store-update-product'),
    path('stores/<uuid:pk>/remove-product/<uuid:product_pk>/', StoreViewSet.as_view({'delete': 'remove_product'}), name='store-remove-product'),
    path('featured-products/', ProductViewSet.as_view({'get': 'featured'}), name='featured-products'),
    path('carts/add/', CartViewSet.as_view({'post': 'add'}), name='cart-add'),
    path('carts/remove/', CartViewSet.as_view({'post': 'remove'}), name='cart-remove'),
    path('carts/clear/', CartViewSet.as_view({'post': 'clear'}), name='cart-clear'),
    path('orders/checkout/', OrderViewSet.as_view({'post': 'checkout'}), name='order-checkout'),
    path('orders/history/', OrderViewSet.as_view({'get': 'history'}), name='order-history'),
    path('cart-items/my-cart-items/', CartItemViewSet.as_view({'get': 'my_cart_items'}), name='my-cart-items'),
    path('cart-items/<uuid:pk>/update-quantity/', CartItemViewSet.as_view({'put': 'update_quantity'}), name='update-cart-item-quantity'),
    path('cart-items/<uuid:pk>/remove-item/', CartItemViewSet.as_view({'delete': 'remove_item'}), name='remove-cart-item'),
    path('search/products/', SearchViewSet.as_view({'get': 'products'}), name='search-products'),
    path('contact/submit/', ContactViewSet.as_view({'post': 'submit'}), name='contact-submit'),
    path('checkout/view/', CheckoutViewSet.as_view({'get': 'view'}), name='checkout-view'),
    path('checkout/process/', CheckoutViewSet.as_view({'post': 'process'}), name='checkout-process'),
    path('about/info/', AboutViewSet.as_view({'get': 'info'}), name='about-info'),
    path('reviews/by-product/', ReviewViewSet.as_view({'get': 'by_product'}), name='reviews-by-product'),
    path('wishlist/add/', WishlistViewSet.as_view({'post': 'add'}), name='wishlist-add'),
    path('wishlist/remove/', WishlistViewSet.as_view({'delete': 'remove'}), name='wishlist-remove'),
    path('recommendations/for-user/', RecommendationViewSet.as_view({'get': 'for_user'}), name='recommendations-for-user'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/user-profile/', UserProfileView.as_view(), name='user-profile'),
    path('api/products/<uuid:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('api/recommended-products/', recommended_products, name='recommended-products'),
    path('api/product-recommendations/<uuid:product_id>/', get_recommendations, name='product-recommendations'),
    path('checkout/', checkout, name='checkout'),
    path('create-payment-intent/', create_payment_intent, name='create-payment-intent'),
    path('stripe-webhook/', stripe_webhook, name='stripe-webhook'),
    path('paypal-create-payment/', paypal_create_payment, name='paypal-create-payment'),
    path('paypal-execute-payment/', paypal_execute_payment, name='paypal-execute-payment'),
]