from functools import wraps
from django.core.cache import cache
from django.conf import settings
import hashlib
import json

def cache_response(timeout=300, key_prefix=''):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(self, request, *args, **kwargs):
            # Gerar chave de cache
            cache_key = generate_cache_key(
                key_prefix,
                request.path,
                request.GET,
                request.user.id if request.user.is_authenticated else None
            )
            
            # Tentar obter do cache
            response = cache.get(cache_key)
            if response is not None:
                return response
            
            # Se não estiver no cache, executar view
            response = view_func(self, request, *args, **kwargs)
            
            # Cachear apenas respostas bem sucedidas
            if response.status_code == 200:
                cache.set(cache_key, response, timeout)
            
            return response
        return _wrapped_view
    return decorator

def generate_cache_key(*args):
    key = ':'.join(str(arg) for arg in args)
    return f'api:{hashlib.md5(key.encode()).hexdigest()}'

# Exemplo de uso em uma view
class ProductListView(APIView):
    @cache_response(timeout=300, key_prefix='products')
    def get(self, request):
        products = Product.objects.filter(is_active=True)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data) 