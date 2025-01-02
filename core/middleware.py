import time
import logging
from django.conf import settings
from django.core.cache import cache
from django.http import HttpResponseTooManyRequests

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()

        response = self.get_response(request)

        # Log apenas se não for uma requisição de arquivos estáticos
        if not request.path.startswith(('/static/', '/media/')):
            duration = time.time() - start_time
            logger.info(
                f'[{request.method}] {request.path} '
                f'(Status: {response.status_code}, Duration: {duration:.2f}s)'
            )

        return response

class JWTAuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Verificar token JWT no header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            # Adicionar token ao request para uso posterior
            request.jwt_token = token

        response = self.get_response(request)
        return response

class CacheMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Não cachear se for POST ou usuário autenticado
        if request.method != 'GET' or request.user.is_authenticated:
            return self.get_response(request)

        # Tentar obter resposta do cache
        cache_key = f'cache_page_{request.path}'
        response = cache.get(cache_key)

        if response is None:
            response = self.get_response(request)
            # Cachear apenas respostas 200
            if response.status_code == 200:
                cache.set(cache_key, response, settings.CACHE_TTL)

        return response 

class RateLimitMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            key = f'rate_limit_{request.user.id}'
            limit = 1000  # requisições
            window = 3600  # 1 hora
        else:
            key = f'rate_limit_{request.META.get("REMOTE_ADDR")}'
            limit = 100
            window = 3600

        # Obter contagem atual
        count = cache.get(key, 0)
        
        if count >= limit:
            return HttpResponseTooManyRequests('Rate limit exceeded')

        # Incrementar contagem
        cache.set(key, count + 1, window)
        
        response = self.get_response(request)
        
        # Adicionar headers
        response['X-RateLimit-Limit'] = str(limit)
        response['X-RateLimit-Remaining'] = str(limit - count - 1)
        response['X-RateLimit-Reset'] = str(int(time.time()) + window)
        
        return response 