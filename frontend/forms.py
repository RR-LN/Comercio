from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.forms import modelformset_factory
from django.utils.translation import gettext_lazy as _
from .models import Product, Order, CartItem, Cart, Review, Wishlist, StoreProduct, ProductVariant, Store, ShippingAddress

class ProductForm(forms.ModelForm):
    """Form to handle Product creation and updates."""
    class Meta:
        model = Product
        fields = ['name', 'description', 'price', 'is_featured', 'slug', 'image', 'category', 'stock']
        help_texts = {
            'name': _('Enter a unique name for the product.'),
            'description': _('Enter a brief description of the product.'),
            'price': _('Enter the price of the product.'),
        }
        widgets = {
            'description': forms.Textarea(attrs={'rows': 5, 'cols': 30, 'class': 'form-control'}),
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'price': forms.NumberInput(attrs={'class': 'form-control'}),
            'is_featured': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'slug': forms.TextInput(attrs={'class': 'form-control'}),
            'image': forms.FileInput(attrs={'class': 'form-control'}),
            'category': forms.Select(attrs={'class': 'form-control'}),
            'stock': forms.NumberInput(attrs={'class': 'form-control'}),
        }

    def clean_name(self):
        name = self.cleaned_data.get('name')
        if Product.objects.filter(name=name).exists():
            raise forms.ValidationError(_('A product with this name already exists.'))
        return name

    def clean_price(self):
        price = self.cleaned_data.get('price')
        if price <= 0:
            raise forms.ValidationError(_('Price must be greater than zero.'))
        return price

class CustomUserCreationForm(UserCreationForm):
    """Custom form to handle User creation."""
    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')
        help_texts = {
            'username': _('Enter a unique username.'),
            'email': _('Enter a valid email address.'),
        }
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'password1': forms.PasswordInput(attrs={'class': 'form-control'}),
            'password2': forms.PasswordInput(attrs={'class': 'form-control'}),
        }

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError(_('A user with this email already exists.'))
        return email

class OrderForm(forms.ModelForm):
    """Form to handle Order creation and updates."""
    class Meta:
        model = Order
        fields = ['user', 'total_amount', 'status', 'payment_status', 'payment_method']
        widgets = {
            'user': forms.Select(attrs={'class': 'form-control'}),
            'total_amount': forms.NumberInput(attrs={'class': 'form-control'}),
            'status': forms.Select(attrs={'class': 'form-control'}),
            'payment_status': forms.Select(attrs={'class': 'form-control'}),
            'payment_method': forms.Select(attrs={'class': 'form-control'}),
        }

    def clean_total_amount(self):
        total_amount = self.cleaned_data.get('total_amount')
        if total_amount <= 0:
            raise forms.ValidationError(_('Total amount must be greater than zero.'))
        return total_amount

class CartItemForm(forms.ModelForm):
    """Form for adding items to the cart."""
    class Meta:
        model = CartItem
        fields = ['cart', 'product_variant', 'quantity']
        widgets = {
            'cart': forms.Select(attrs={'class': 'form-control'}),
            'product_variant': forms.Select(attrs={'class': 'form-control'}),
            'quantity': forms.NumberInput(attrs={'min': 1, 'class': 'form-control'}),
        }

    def clean_quantity(self):
        quantity = self.cleaned_data.get('quantity')
        if quantity <= 0:
            raise forms.ValidationError(_('Quantity must be greater than zero.'))
        return quantity

class ShippingAddressForm(forms.ModelForm):
    """Form to handle ShippingAddress creation and updates."""
    class Meta:
        model = ShippingAddress
        fields = ['user', 'address_line1', 'address_line2', 'city', 'state', 'country', 'postal_code', 'is_default']
        widgets = {
            'user': forms.Select(attrs={'class': 'form-control'}),
            'address_line1': forms.TextInput(attrs={'class': 'form-control'}),
            'address_line2': forms.TextInput(attrs={'class': 'form-control'}),
            'city': forms.TextInput(attrs={'class': 'form-control'}),
            'state': forms.TextInput(attrs={'class': 'form-control'}),
            'country': forms.TextInput(attrs={'class': 'form-control'}),
            'postal_code': forms.TextInput(attrs={'class': 'form-control'}),
            'is_default': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }

class ContactForm(forms.Form):
    """Form to handle contact messages."""
    name = forms.CharField(max_length=255, widget=forms.TextInput(attrs={'class': 'form-control'}))
    email = forms.EmailField(widget=forms.EmailInput(attrs={'class': 'form-control'}))
    message = forms.CharField(widget=forms.Textarea(attrs={'class': 'form-control'}))

    def clean_name(self):
        name = self.cleaned_data.get('name')
        if not name:
            raise forms.ValidationError(_('Name is required.'))
        return name

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if not email:
            raise forms.ValidationError(_('Email is required.'))
        return email

    def clean_message(self):
        message = self.cleaned_data.get('message')
        if not message:
            raise forms.ValidationError(_('Message is required.'))
        return message

class ReviewForm(forms.ModelForm):
    """Form for creating and updating product reviews."""
    class Meta:
        model = Review
        fields = ['user', 'product', 'rating', 'comment']
        widgets = {
            'user': forms.Select(attrs={'class': 'form-control'}),
            'product': forms.Select(attrs={'class': 'form-control'}),
            'rating': forms.NumberInput(attrs={'min': 1, 'max': 5, 'class': 'form-control'}),
            'comment': forms.Textarea(attrs={'rows': 4, 'class': 'form-control'}),
        }

    def clean_rating(self):
        rating = self.cleaned_data.get('rating')
        if rating < 1 or rating > 5:
            raise forms.ValidationError(_('Rating must be between 1 and 5.'))
        return rating

class WishlistForm(forms.ModelForm):
    """Form for adding products to the wishlist."""
    class Meta:
        model = Wishlist
        fields = ['user', 'products']
        widgets = {
            'user': forms.Select(attrs={'class': 'form-control'}),
            'products': forms.SelectMultiple(attrs={'class': 'form-control'}),
        }

class StoreProductForm(forms.ModelForm):
    """Form for creating and updating store products."""
    class Meta:
        model = StoreProduct
        fields = ['store', 'product', 'price', 'inventory_level']
        widgets = {
            'store': forms.Select(attrs={'class': 'form-control'}),
            'product': forms.Select(attrs={'class': 'form-control'}),
            'price': forms.NumberInput(attrs={'class': 'form-control'}),
            'inventory_level': forms.NumberInput(attrs={'class': 'form-control'}),
        }

    def clean_price(self):
        price = self.cleaned_data.get('price')
        if price <= 0:
            raise forms.ValidationError(_('Price must be greater than zero.'))
        return price

    def clean_inventory_level(self):
        inventory_level = self.cleaned_data.get('inventory_level')
        if inventory_level < 0:
            raise forms.ValidationError(_('Inventory level cannot be negative.'))
        return inventory_level

class ProductVariantForm(forms.ModelForm):
    """Form for creating and updating product variants."""
    class Meta:
        model = ProductVariant
        fields = ['product', 'name', 'sku', 'price']
        widgets = {
            'product': forms.Select(attrs={'class': 'form-control'}),
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'sku': forms.TextInput(attrs={'class': 'form-control'}),
            'price': forms.NumberInput(attrs={'class': 'form-control'}),
        }

    def clean_price(self):
        price = self.cleaned_data.get('price')
        if price <= 0:
            raise forms.ValidationError(_('Price must be greater than zero.'))
        return price

class StoreForm(forms.ModelForm):
    """Form for creating and updating stores."""
    class Meta:
        model = Store
        fields = ['name', 'description', 'owner', 'slug']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control'}),
            'owner': forms.Select(attrs={'class': 'form-control'}),
            'slug': forms.TextInput(attrs={'class': 'form-control'}),
        }

# Inline formset factory for ShippingAddress, now correctly related to User
ShippingAddressFormSet = modelformset_factory(
    ShippingAddress,
    form=ShippingAddressForm,
    extra=1,
    can_delete=True
)