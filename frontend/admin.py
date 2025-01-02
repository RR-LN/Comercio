from django.contrib import admin
from .models import Category, Product, Store, StoreProduct, Cart, CartItem, Order, Review, Wishlist, ProductVariant, UserProfile, ShippingAddress

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'price', 'stock', 'is_featured', 'created_at', 'updated_at']
    list_filter = ['is_featured', 'created_at', 'updated_at', 'category']
    list_editable = ['price', 'stock', 'is_featured']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name', 'description']
    list_select_related = ['category']

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('category')

@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ['product', 'name', 'sku', 'price']
    list_filter = ['product']
    search_fields = ['name', 'sku', 'product__name']
    list_select_related = ['product']

@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'created_at']
    search_fields = ['name', 'owner__username']
    list_select_related = ['owner']

@admin.register(StoreProduct)
class StoreProductAdmin(admin.ModelAdmin):
    list_display = ['product', 'store', 'price', 'inventory_level']
    list_filter = ['store', 'product__category']
    search_fields = ['product__name', 'store__name']
    list_select_related = ['product', 'store']

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('product', 'store')

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at', 'item_count', 'total_price']
    list_filter = ['created_at']
    search_fields = ['user__username']
    list_select_related = ['user']

    def item_count(self, obj):
        return obj.items.count()
    item_count.short_description = 'Number of Items'

    def total_price(self, obj):
        return sum(item.product_variant.price * item.quantity for item in obj.items.all())
    total_price.short_description = 'Total Price'

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['cart', 'product_variant', 'quantity', 'item_total']
    list_filter = ['cart', 'product_variant__product']
    autocomplete_fields = ['cart', 'product_variant']
    list_select_related = ['cart', 'product_variant']

    def item_total(self, obj):
        return obj.product_variant.price * obj.quantity
    item_total.short_description = 'Item Total'

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'total', 'status', 'payment_status', 'payment_method', 'created_at']
    list_filter = ['status', 'payment_status', 'payment_method', 'created_at']
    search_fields = ['id', 'user__username', 'stripe_payment_intent_id', 'paypal_payment_id']
    readonly_fields = ['id', 'created_at', 'updated_at']
    list_select_related = ['user']

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user').prefetch_related('items__product_variant')

    actions = ['mark_as_processing', 'mark_as_shipped', 'mark_as_delivered']

    def mark_as_processing(self, request, queryset):
        queryset.update(status='processing')
    mark_as_processing.short_description = "Mark selected orders as processing"

    def mark_as_shipped(self, request, queryset):
        queryset.update(status='shipped')
    mark_as_shipped.short_description = "Mark selected orders as shipped"

    def mark_as_delivered(self, request, queryset):
        queryset.update(status='delivered')
    mark_as_delivered.short_description = "Mark selected orders as delivered"

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['product__name', 'user__username']
    list_select_related = ['product', 'user']

@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'product_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username']
    list_select_related = ['user']

    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'Number of Products'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user').prefetch_related('products')

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'birth_date']
    search_fields = ['user__username', 'user__email']
    list_select_related = ['user']

@admin.register(ShippingAddress)
class ShippingAddressAdmin(admin.ModelAdmin):
    list_display = ['user', 'address_line1', 'city', 'country', 'is_default']
    list_filter = ['is_default', 'country']
    search_fields = ['user__username', 'address_line1', 'city', 'country']
    list_select_related = ['user']
