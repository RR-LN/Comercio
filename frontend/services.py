from django.db.models import Prefetch, Count, Q
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank

class ProductService:
    @staticmethod
    def get_products_with_related(filters=None):
        queryset = Product.objects.select_related(
            'category',
            'brand'
        ).prefetch_related(
            Prefetch(
                'variants',
                queryset=ProductVariant.objects.select_related('color', 'size')
            ),
            'images',
            Prefetch(
                'reviews',
                queryset=Review.objects.select_related('user').order_by('-created_at')[:5]
            )
        )
        
        if filters:
            queryset = queryset.filter(**filters)
        
        return queryset

    @staticmethod
    def search_products(query):
        search_vector = SearchVector('name', weight='A') + \
                       SearchVector('description', weight='B')
        search_query = SearchQuery(query)
        
        return Product.objects.annotate(
            search=search_vector,
            rank=SearchRank(search_vector, search_query)
        ).filter(
            search=search_query
        ).order_by('-rank')

class OrderService:
    @staticmethod
    def get_user_orders(user_id):
        return Order.objects.select_related(
            'user',
            'shipping_address'
        ).prefetch_related(
            Prefetch(
                'items',
                queryset=OrderItem.objects.select_related('product')
            ),
            'payments'
        ).filter(
            user_id=user_id
        ).order_by('-created_at') 