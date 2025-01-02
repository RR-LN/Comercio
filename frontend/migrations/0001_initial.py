# Generated by Django 5.1.4 on 2024-12-21 22:54

import django.contrib.postgres.indexes
import django.core.validators
import django.db.models.deletion
import django.utils.timezone
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Coupon',
            fields=[
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, editable=False, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is Active')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('code', models.CharField(max_length=50, unique=True, verbose_name='Code')),
                ('discount_percent', models.PositiveSmallIntegerField(validators=[django.core.validators.MaxValueValidator(100)], verbose_name='Discount Percent')),
                ('valid_from', models.DateTimeField(verbose_name='Valid From')),
                ('valid_to', models.DateTimeField(verbose_name='Valid To')),
                ('max_uses', models.PositiveIntegerField(default=1, verbose_name='Maximum Uses')),
                ('times_used', models.PositiveIntegerField(default=0, verbose_name='Times Used')),
            ],
            options={
                'verbose_name': 'Coupon',
                'verbose_name_plural': 'Coupons',
            },
        ),
        migrations.CreateModel(
            name='Cart',
            fields=[
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, editable=False, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is Active')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_carts', to=settings.AUTH_USER_MODEL, verbose_name='User')),
            ],
            options={
                'verbose_name': 'Cart',
                'verbose_name_plural': 'Carts',
            },
        ),
        migrations.CreateModel(
            name='Category',
            fields=[
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, editable=False, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is Active')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('slug', models.SlugField(unique=True)),
                ('description', models.TextField(blank=True, default='')),
                ('image', models.ImageField(blank=True, upload_to='categories/')),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='frontend.category')),
            ],
            options={
                'verbose_name': 'Category',
                'verbose_name_plural': 'Categories',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, editable=False, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is Active')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('message', models.TextField(verbose_name='Message')),
                ('is_read', models.BooleanField(default=False, verbose_name='Is Read')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to=settings.AUTH_USER_MODEL, verbose_name='User')),
            ],
            options={
                'verbose_name': 'Notification',
                'verbose_name_plural': 'Notifications',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Order',
            fields=[
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, editable=False, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is Active')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('total', models.DecimalField(decimal_places=2, max_digits=10, null=True)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('processing', 'Processing'), ('shipped', 'Shipped'), ('delivered', 'Delivered'), ('cancelled', 'Cancelled')], default='pending', max_length=20)),
                ('payment_status', models.CharField(choices=[('UNPAID', 'unpaid'), ('PAID', 'paid'), ('REFUNDED', 'refunded')], default='unpaid', max_length=20, verbose_name='Payment Status')),
                ('payment_method', models.CharField(choices=[('STRIPE', 'stripe'), ('PAYPAL', 'paypal')], default='credit_card', max_length=20, verbose_name='Payment Method')),
                ('stripe_payment_intent_id', models.CharField(blank=True, max_length=255, null=True, verbose_name='Stripe Payment Intent ID')),
                ('paypal_payment_id', models.CharField(blank=True, max_length=255, null=True, verbose_name='PayPal Payment ID')),
                ('tracking_number', models.CharField(blank=True, max_length=100, null=True, verbose_name='Tracking Number')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_orders', to=settings.AUTH_USER_MODEL, verbose_name='User')),
            ],
            options={
                'verbose_name': 'Order',
                'verbose_name_plural': 'Orders',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Product',
            fields=[
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, editable=False, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is Active')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=200)),
                ('slug', models.SlugField(blank=True, max_length=200, unique=True)),
                ('description', models.TextField()),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('in_stock', models.BooleanField(default=True)),
                ('stock', models.IntegerField(default=0)),
                ('is_featured', models.BooleanField(default=False)),
                ('image', models.ImageField(upload_to='products/')),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='frontend.category')),
            ],
            options={
                'verbose_name': 'Product',
                'verbose_name_plural': 'Products',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='OrderItem',
            fields=[
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, editable=False, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is Active')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('quantity', models.PositiveIntegerField(default=1, verbose_name='Quantity')),
                ('price', models.DecimalField(decimal_places=2, default=0.0, max_digits=10, validators=[django.core.validators.MinValueValidator(0.01)], verbose_name='Price')),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='order_items', to='frontend.order', verbose_name='Order')),
                ('product', models.ForeignKey(default=1, null=True, on_delete=django.db.models.deletion.CASCADE, to='frontend.product', verbose_name='Product')),
            ],
            options={
                'verbose_name': 'Order Item',
                'verbose_name_plural': 'Order Items',
            },
        ),
        migrations.AddField(
            model_name='order',
            name='items',
            field=models.ManyToManyField(through='frontend.OrderItem', to='frontend.product'),
        ),
        migrations.CreateModel(
            name='ProductVariant',
            fields=[
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, editable=False, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is Active')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255, verbose_name='Variant Name')),
                ('sku', models.CharField(max_length=100, unique=True, verbose_name='SKU')),
                ('price', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(0.01)], verbose_name='Price')),
                ('product', models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='variants', to='frontend.product', verbose_name='Product')),
            ],
            options={
                'verbose_name': 'Product Variant',
                'verbose_name_plural': 'Product Variants',
            },
        ),
        migrations.CreateModel(
            name='CartItem',
            fields=[
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, editable=False, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is Active')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('quantity', models.PositiveIntegerField(default=1, verbose_name='Quantity')),
                ('cart', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='frontend.cart', verbose_name='Cart')),
                ('product_variant', models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='frontend.productvariant', verbose_name='Product Variant')),
            ],
            options={
                'verbose_name': 'Cart Item',
                'verbose_name_plural': 'Cart Items',
            },
        ),
        migrations.CreateModel(
            name='Recommendation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('score', models.FloatField()),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='recommendations', to='frontend.product')),
                ('recommended_product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='frontend.product')),
            ],
        ),
        migrations.CreateModel(
            name='Refund',
            fields=[
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, editable=False, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is Active')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(0.01)], verbose_name='Refund Amount')),
                ('reason', models.TextField(verbose_name='Refund Reason')),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')], default='pending', max_length=20, verbose_name='Refund Status')),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='refunds', to='frontend.order', verbose_name='Order')),
            ],
            options={
                'verbose_name': 'Refund',
                'verbose_name_plural': 'Refunds',
            },
        ),
        migrations.CreateModel(
            name='Review',
            fields=[
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, editable=False, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is Active')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('rating', models.PositiveSmallIntegerField(validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(5)], verbose_name='Rating')),
                ('comment', models.TextField(verbose_name='Comment')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reviews', to='frontend.product', verbose_name='Product')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reviews', to=settings.AUTH_USER_MODEL, verbose_name='User')),
            ],
            options={
                'verbose_name': 'Review',
                'verbose_name_plural': 'Reviews',
            },
        ),
        migrations.CreateModel(
            name='ShippingAddress',
            fields=[
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, editable=False, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is Active')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('address_line1', models.CharField(max_length=255, verbose_name='Address Line 1')),
                ('address_line2', models.CharField(blank=True, max_length=255, null=True, verbose_name='Address Line 2')),
                ('city', models.CharField(max_length=100, verbose_name='City')),
                ('state', models.CharField(max_length=100, verbose_name='State')),
                ('country', models.CharField(max_length=100, verbose_name='Country')),
                ('postal_code', models.CharField(max_length=20, verbose_name='Postal Code')),
                ('is_default', models.BooleanField(default=False, verbose_name='Is Default')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='shipping_addresses', to=settings.AUTH_USER_MODEL, verbose_name='User')),
            ],
            options={
                'verbose_name': 'Shipping Address',
                'verbose_name_plural': 'Shipping Addresses',
            },
        ),
        migrations.CreateModel(
            name='Store',
            fields=[
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, editable=False, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is Active')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255, validators=[django.core.validators.MaxLengthValidator(255)], verbose_name='Name')),
                ('description', models.TextField(blank=True, null=True, verbose_name='Description')),
                ('slug', models.SlugField(unique=True, verbose_name='Slug')),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='Owner')),
            ],
            options={
                'verbose_name': 'Store',
                'verbose_name_plural': 'Stores',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='Inventory',
            fields=[
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, editable=False, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is Active')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('quantity', models.PositiveIntegerField(default=0, verbose_name='Quantity')),
                ('product_variant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='inventories', to='frontend.productvariant', verbose_name='Product Variant')),
                ('store', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='inventories', to='frontend.store', verbose_name='Store')),
            ],
            options={
                'verbose_name': 'Inventory',
                'verbose_name_plural': 'Inventories',
            },
        ),
        migrations.CreateModel(
            name='StoreProduct',
            fields=[
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, editable=False, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is Active')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('price', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(0.01)], verbose_name='Price')),
                ('inventory_level', models.PositiveIntegerField(default=0, verbose_name='Inventory Level')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='store_products', to='frontend.product', verbose_name='Product')),
                ('store', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='store_products', to='frontend.store', verbose_name='Store')),
            ],
            options={
                'verbose_name': 'Store Product',
                'verbose_name_plural': 'Store Products',
            },
        ),
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('loyalty_points', models.PositiveIntegerField(default=0, verbose_name='Loyalty Points')),
                ('stripe_customer_id', models.CharField(blank=True, max_length=255, null=True, verbose_name='Stripe Customer ID')),
                ('bio', models.TextField(blank=True)),
                ('avatar', models.ImageField(blank=True, upload_to='avatars/')),
                ('birth_date', models.DateField(blank=True, null=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Wishlist',
            fields=[
                ('created_at', models.DateTimeField(default=django.utils.timezone.now, editable=False, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is Active')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('products', models.ManyToManyField(related_name='wishlists', to='frontend.product', verbose_name='Products')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='wishlists', to=settings.AUTH_USER_MODEL, verbose_name='User')),
            ],
            options={
                'verbose_name': 'Wishlist',
                'verbose_name_plural': 'Wishlists',
            },
        ),
        migrations.AddIndex(
            model_name='category',
            index=models.Index(fields=['name', 'slug'], name='frontend_ca_name_2280f5_idx'),
        ),
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['name', 'slug'], name='frontend_pr_name_4a48cf_idx'),
        ),
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['created_at'], name='frontend_pr_created_ef43fb_idx'),
        ),
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['updated_at'], name='frontend_pr_updated_f7f4d7_idx'),
        ),
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['price'], name='frontend_pr_price_d914fa_idx'),
        ),
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['category'], name='frontend_pr_categor_79a9f8_idx'),
        ),
        migrations.AddIndex(
            model_name='product',
            index=django.contrib.postgres.indexes.BTreeIndex(fields=['slug'], name='frontend_pr_slug_bbf19e_btree'),
        ),
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['is_active', 'in_stock'], name='frontend_pr_is_acti_ca0d63_idx'),
        ),
        migrations.AddIndex(
            model_name='order',
            index=models.Index(fields=['created_at'], name='frontend_or_created_3f1f19_idx'),
        ),
        migrations.AddIndex(
            model_name='order',
            index=models.Index(fields=['status'], name='frontend_or_status_b243c9_idx'),
        ),
        migrations.AddIndex(
            model_name='order',
            index=models.Index(fields=['user'], name='frontend_or_user_id_20218c_idx'),
        ),
        migrations.AddIndex(
            model_name='order',
            index=models.Index(fields=['payment_status'], name='frontend_or_payment_f64bf4_idx'),
        ),
        migrations.AddIndex(
            model_name='cartitem',
            index=models.Index(fields=['cart', 'product_variant'], name='frontend_ca_cart_id_8bebfa_idx'),
        ),
        migrations.AddIndex(
            model_name='cartitem',
            index=models.Index(fields=['created_at'], name='frontend_ca_created_6fe5ed_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='recommendation',
            unique_together={('product', 'recommended_product')},
        ),
        migrations.AlterUniqueTogether(
            name='review',
            unique_together={('user', 'product')},
        ),
        migrations.AlterUniqueTogether(
            name='inventory',
            unique_together={('store', 'product_variant')},
        ),
        migrations.AlterUniqueTogether(
            name='storeproduct',
            unique_together={('store', 'product')},
        ),
    ]
