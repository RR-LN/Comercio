import uuid
from enum import Enum
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator, MaxLengthValidator, FileExtensionValidator
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.urls import reverse
from django.utils.text import slugify
from django.core.cache import cache
from django.contrib.auth import get_user_model
import stripe
import paypalrestsdk
from .utils import award_loyalty_points, use_loyalty_points
from .user_profile import UserProfile
from django.contrib.postgres.indexes import GinIndex, BTreeIndex


User = settings.AUTH_USER_MODEL

class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(default=timezone.now, editable=False, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))
    is_active = models.BooleanField(default=True, verbose_name=_("Is Active"))

    class Meta:
        abstract = True

    def to_dict(self):
        return {
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'is_active': self.is_active,
        }

    def soft_delete(self):
        self.is_active = False
        self.save()

class Category(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, default='')
    image = models.ImageField(upload_to='categories/', blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        verbose_name = _("Category")
        verbose_name_plural = _("Categories")
        ordering = ['name']
        indexes = [
            models.Index(fields=['name', 'slug']),
        ]

    def __str__(self):
        return self.name

    def to_dict(self):
        return {
            **super().to_dict(),
            'id': str(self.id),
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'image': self.image.url if self.image else None,
            'parent': self.parent.to_dict() if self.parent else None,
        }

    @classmethod
    def get_all_categories(cls):
        cache_key = 'all_categories'
        categories = cache.get(cache_key)
        if not categories:
            categories = list(cls.objects.filter(is_active=True))
            cache.set(cache_key, categories, timeout=3600)  # Cache for 1 hour
        return categories

class Product(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    in_stock = models.BooleanField(default=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    stock = models.IntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    image = models.ImageField(upload_to='products/')
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)  

    class Meta:
        ordering = ['name']
        verbose_name = _("Product")
        verbose_name_plural = _("Products")
        indexes = [
            models.Index(fields=['name', 'slug']),
            models.Index(fields=['created_at']),
            models.Index(fields=['updated_at']),
            models.Index(fields=['price']),
            models.Index(fields=['category']),
            BTreeIndex(fields=['slug']),
            models.Index(fields=['is_active', 'in_stock']),
        ]
 
    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('product_detail', kwargs={'pk': self.pk})

    def to_dict(self):
        return {
            **super().to_dict(),
            'id': str(self.id),
            'name': self.name,
            'description': self.description,
            'price': str(self.price),
            'is_featured': self.is_featured,
            'slug': self.slug,
            'image': self.image.url if self.image else None,
            'category': self.category.to_dict(),
            'stock': self.stock,
        }

    @classmethod
    def get_featured_products(cls):
        cache_key = 'featured_products'
        products = cache.get(cache_key)
        if not products:
            products = list(cls.objects.filter(is_featured=True, is_active=True))
            cache.set(cache_key, products, timeout=3600)  # Cache for 1 hour
        return products

class ProductVariant(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants', verbose_name=_("Product"), default=1)
    name = models.CharField(max_length=255, verbose_name=_("Variant Name"))
    sku = models.CharField(max_length=100, unique=True, verbose_name=_("SKU"))
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)], verbose_name=_("Price"))

    class Meta:
        verbose_name = _("Product Variant")
        verbose_name_plural = _("Product Variants")

    def __str__(self):
        return f"{self.product.name} - {self.name}"

    def to_dict(self):
        return {
            **super().to_dict(),
            'id': str(self.id),
            'product': self.product.to_dict(),
            'name': self.name,
            'sku': self.sku,
            'price': str(self.price),
        }

class Store(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, validators=[MaxLengthValidator(255)], verbose_name=_("Name"))
    description = models.TextField(blank=True, null=True, verbose_name=_("Description"))
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name=_("Owner"))
    slug = models.SlugField(unique=True, verbose_name=_("Slug"))

    class Meta:
        verbose_name = _("Store")
        verbose_name_plural = _("Stores")
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def to_dict(self):
        return {
            **super().to_dict(),
            'id': str(self.id),
            'name': self.name,
            'description': self.description,
            'owner': self.owner.username,
            'slug': self.slug,
        }

class Inventory(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='inventories', verbose_name=_("Store"))
    product_variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='inventories', verbose_name=_("Product Variant"))
    quantity = models.PositiveIntegerField(default=0, verbose_name=_("Quantity"))

    class Meta:
        verbose_name = _("Inventory")
        verbose_name_plural = _("Inventories")
        unique_together = ('store', 'product_variant')

    def __str__(self):
        return f"{self.store.name} - {self.product_variant.product.name} - {self.product_variant.name}"

    def to_dict(self):
        return {
            **super().to_dict(),
            'id': str(self.id),
            'store': self.store.to_dict(),
            'product_variant': self.product_variant.to_dict(),
            'quantity': self.quantity,
        }

    def update_stock(self, quantity):
        self.quantity = models.F('quantity') - quantity
        self.save()

class StoreProduct(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='store_products', verbose_name=_("Store"))
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='store_products', verbose_name=_("Product"))
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)], verbose_name=_("Price"))
    inventory_level = models.PositiveIntegerField(default=0, verbose_name=_("Inventory Level"))

    class Meta:
        verbose_name = _("Store Product")
        verbose_name_plural = _("Store Products")
        unique_together = ('store', 'product')

    def __str__(self):
        return f"{self.store.name} - {self.product.name}"

    def to_dict(self):
        return {
            **super().to_dict(),
            'id': str(self.id),
            'store': self.store.to_dict(),
            'product': self.product.to_dict(),
            'price': str(self.price),
            'inventory_level': self.inventory_level,
        }


class Cart(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_carts', verbose_name=_("User"))

    class Meta:
        verbose_name = _("Cart")
        verbose_name_plural = _("Carts")

    def __str__(self):
        return f"Cart for {self.user.username}"

    def to_dict(self):
        return {
            **super().to_dict(),
            'id': str(self.id),
            'user': self.user.username,
            'items': [item.to_dict() for item in self.items.all()],
        }

class CartItem(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items', verbose_name=_("Cart"))
    product_variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, default=1, verbose_name=_("Product Variant"))
    quantity = models.PositiveIntegerField(default=1, verbose_name=_("Quantity"))

    class Meta:
        verbose_name = _("Cart Item")
        verbose_name_plural = _("Cart Items")
        indexes = [
            # Corrigido para usar 'product_variant' em vez de 'product'
            models.Index(fields=['cart', 'product_variant']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.quantity} x {self.product_variant.product.name} - {self.product_variant.name} in {self.cart}"

    def to_dict(self):
        return {
            **super().to_dict(),
            'id': str(self.id),
            'cart': str(self.cart.id),
            'product_variant': self.product_variant.to_dict(),
            'quantity': self.quantity,
        }

class OrderStatus(Enum):
    PENDING = 'pending'
    PROCESSING = 'processing'
    SHIPPED = 'shipped'
    DELIVERED = 'delivered'
    CANCELED = 'canceled'

class PaymentStatus(Enum):
    UNPAID = 'unpaid'
    PAID = 'paid'
    REFUNDED = 'refunded'

class PaymentMethod(Enum):
    STRIPE = 'stripe'
    PAYPAL = 'paypal'

class Order(TimeStampedModel):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_orders', verbose_name=_("User"))
    items = models.ManyToManyField(Product, through='OrderItem')
    total = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=[(tag.name, tag.value) for tag in PaymentStatus], default=PaymentStatus.UNPAID.value, verbose_name=_("Payment Status"))
    payment_method = models.CharField(max_length=20, choices=[(tag.name, tag.value) for tag in PaymentMethod], default='credit_card', verbose_name=_("Payment Method"))
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True, null=True, verbose_name=_("Stripe Payment Intent ID"))
    paypal_payment_id = models.CharField(max_length=255, blank=True, null=True, verbose_name=_("PayPal Payment ID"))
    tracking_number = models.CharField(max_length=100, blank=True, null=True, verbose_name=_("Tracking Number"))

    class Meta:
        verbose_name = _("Order")
        verbose_name_plural = _("Orders")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['user']),
            models.Index(fields=['payment_status']),
        ]

    def __str__(self):
        return self.order_number()

    def order_number(self):
        return f"ORD-{self.id.hex[:8].upper()}"

    def to_dict(self):
        return {
            **super().to_dict(),
            'id': str(self.id),
            'user': self.user.username,
            'total': str(self.total),
            'status': self.status,
            'payment_status': self.payment_status,
            'payment_method': self.payment_method,
            'items': [item.to_dict() for item in self.items.all()],
            'order_number': self.order_number(),
            'stripe_payment_intent_id': self.stripe_payment_intent_id,
            'paypal_payment_id': self.paypal_payment_id,
            'tracking_number': self.tracking_number,
        }

    def update_inventory(self):
        for item in self.items.all():
            inventory = Inventory.objects.get(store=item.store, product_variant=item.product_variant)
            inventory.update_stock(item.quantity)

    def process_payment(self):
        if self.payment_method == PaymentMethod.STRIPE.value:
            return self.process_stripe_payment()
        elif self.payment_method == PaymentMethod.PAYPAL.value:
            return self.process_paypal_payment()
        else:
            raise ValueError("Invalid payment method")

    def process_stripe_payment(self):
        stripe.api_key = settings.STRIPE_SECRET_KEY
        try:
            intent = stripe.PaymentIntent.create(
                amount=int(self.total * 100),  # Amount in cents
                currency='usd',
                customer=self.user.stripe_customer_id,
                metadata={'order_id': str(self.id)}
            )
            self.stripe_payment_intent_id = intent.id
            self.save()
            return True
        except stripe.error.StripeError:
            return False

    def process_paypal_payment(self):
        paypalrestsdk.configure({
            "mode": settings.PAYPAL_MODE,
            "client_id": settings.PAYPAL_CLIENT_ID,
            "client_secret": settings.PAYPAL_CLIENT_SECRET
        })
        payment = paypalrestsdk.Payment({
            "intent": "sale",
            "payer": {"payment_method": "paypal"},
            "redirect_urls": {
                "return_url": "http://localhost:8000/payment/execute",
                "cancel_url": "http://localhost:8000/payment/cancel"
            },
            "transactions": [{
                "amount": {
                    "total": str(self.total),
                    "currency": "USD"
                },
                "description": f"Payment for order {self.order_number()}"
            }]
        })
        if payment.create():
            self.paypal_payment_id = payment.id
            self.save()
            return True
        else:
            return False

    def update_status(self, new_status):
        self.status = new_status
        self.save()
        Notification.objects.create(
            user=self.user,
            message=f"Your order {self.order_number()} status has been updated to {new_status}."
        )

class OrderItem(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_items', verbose_name=_("Order"))
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name=_("Product"), default=1, null=True)
    quantity = models.PositiveIntegerField(default=1, verbose_name=_("Quantity"))
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, validators=[MinValueValidator(0.01)], verbose_name=_("Price"))

    class Meta:
        verbose_name = _("Order Item")
        verbose_name_plural = _("Order Items")

    def __str__(self):
        return f"{self.quantity} x {self.product.name} in order {self.order.id}"

    def to_dict(self):
        return {
            **super().to_dict(),
            'id': str(self.id),
            'order': str(self.order.id),
            'product': self.product.to_dict() if self.product else None,
            'quantity': self.quantity,
            'price': str(self.price),
        }

class Review(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews', verbose_name=_("User"))
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews', verbose_name=_("Product"))
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], verbose_name=_("Rating"))
    comment = models.TextField(verbose_name=_("Comment"))

    class Meta:
        verbose_name = _("Review")
        verbose_name_plural = _("Reviews")
        unique_together = ('user', 'product')

    def __str__(self):
        return f"Review by {self.user.username} for {self.product.name}"

    def to_dict(self):
        return {
            **super().to_dict(),
            'id': str(self.id),
            'user': self.user.username,
            'product': self.product.to_dict(),
            'rating': self.rating,
            'comment': self.comment,
        }

class Wishlist(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlists', verbose_name=_("User"))
    products = models.ManyToManyField(Product, related_name='wishlists', verbose_name=_("Products"))

    class Meta:
        verbose_name = _("Wishlist")
        verbose_name_plural = _("Wishlists")

    def __str__(self):
        return f"Wishlist for {self.user.username}"

    def to_dict(self):
        return {
            **super().to_dict(),
            'id': str(self.id),
            'user': self.user.username,
            'products': [product.to_dict() for product in self.products.all()],
        }

class Coupon(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True, verbose_name=_("Code"))
    discount_percent = models.PositiveSmallIntegerField(validators=[MaxValueValidator(100)], verbose_name=_("Discount Percent"))
    valid_from = models.DateTimeField(verbose_name=_("Valid From"))
    valid_to = models.DateTimeField(verbose_name=_("Valid To"))
    max_uses = models.PositiveIntegerField(default=1, verbose_name=_("Maximum Uses"))
    times_used = models.PositiveIntegerField(default=0, verbose_name=_("Times Used"))

    class Meta:
        verbose_name = _("Coupon")
        verbose_name_plural = _("Coupons")

    def __str__(self):
        return f"Coupon {self.code} - {self.discount_percent}% off"

    def to_dict(self):
        return {
            **super().to_dict(),
            'id': str(self.id),
            'code': self.code,
            'discount_percent': self.discount_percent,
            'valid_from': self.valid_from.isoformat(),
            'valid_to': self.valid_to.isoformat(),
            'max_uses': self.max_uses,
            'times_used': self.times_used,
        }

    def is_valid(self):
        now = timezone.now()
        return (
            self.is_active and
            self.valid_from <= now <= self.valid_to and
            self.times_used < self.max_uses
        )

class ShippingAddress(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='shipping_addresses', verbose_name=_("User"))
    address_line1 = models.CharField(max_length=255, verbose_name=_("Address Line 1"))
    address_line2 = models.CharField(max_length=255, blank=True, null=True, verbose_name=_("Address Line 2"))
    city = models.CharField(max_length=100, verbose_name=_("City"))
    state = models.CharField(max_length=100, verbose_name=_("State"))
    country = models.CharField(max_length=100, verbose_name=_("Country"))
    postal_code = models.CharField(max_length=20, verbose_name=_("Postal Code"))
    is_default = models.BooleanField(default=False, verbose_name=_("Is Default"))

    class Meta:
        verbose_name = _("Shipping Address")
        verbose_name_plural = _("Shipping Addresses")

    def __str__(self):
        return f"{self.address_line1}, {self.city}, {self.country}"

    def to_dict(self):
        return {
            **super().to_dict(),
            'id': str(self.id),
            'user': self.user.username,
            'address_line1': self.address_line1,
            'address_line2': self.address_line2,
            'city': self.city,
            'state': self.state,
            'country': self.country,
            'postal_code': self.postal_code,
            'is_default': self.is_default,
        }

class Refund(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='refunds', verbose_name=_("Order"))
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)], verbose_name=_("Refund Amount"))
    reason = models.TextField(verbose_name=_("Refund Reason"))
    status = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')], default='pending', verbose_name=_("Refund Status"))

    class Meta:
        verbose_name = _("Refund")
        verbose_name_plural = _("Refunds")

    def __str__(self):
        return f"Refund for Order {self.order.order_number()} - {self.status}"

    def to_dict(self):
        return {
            **super().to_dict(),
            'id': str(self.id),
            'order': self.order.to_dict(),
            'amount': str(self.amount),
            'reason': self.reason,
            'status': self.status,
        }

class Notification(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications', verbose_name=_("User"))
    message = models.TextField(verbose_name=_("Message"))
    is_read = models.BooleanField(default=False, verbose_name=_("Is Read"))

    class Meta:
        verbose_name = _("Notification")
        verbose_name_plural = _("Notifications")
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:50]}..."

    def to_dict(self):
        return {
            **super().to_dict(),
            'id': str(self.id),
            'user': self.user.username,
            'message': self.message,
            'is_read': self.is_read,
        }
class Recommendation(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='recommendations')
    recommended_product = models.ForeignKey(Product, on_delete=models.CASCADE)
    score = models.FloatField()

    class Meta:
        unique_together = ('product', 'recommended_product')