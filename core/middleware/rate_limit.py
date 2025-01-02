from django.core.cache import cache
from django.http import HttpResponseTooManyRequests
import time
import hashlib
from typing import Optional, Tuple

class RateLimitMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.cache = cache
        self.rate_limits = {
            'default': (100, 3600),  # 100 requests per hour
            'auth': (5, 300),        # 5 attempts per 5 minutes
            'api': (1000, 3600),     # 1000 requests per hour
        }

    def get_client_ip(self, request) -> str:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')

    def get_rate_limit_key(self, request) -> Tuple[str, int, int]:
        client_ip = self.get_client_ip(request)
        path = request.path_info

        # Rate limit específico para autenticação
        if '/auth/' in path:
            return f'ratelimit:auth:{client_ip}', *self.rate_limits['auth']
        
        # Rate limit para API
        elif '/api/' in path:
            return f'ratelimit:api:{client_ip}', *self.rate_limits['api']
        
        # Rate limit padrão
        return f'ratelimit:default:{client_ip}', *self.rate_limits['default']

    def is_rate_limited(self, key: str, limit: int, window: int) -> bool:
        pipe = self.cache.pipeline()
        now = time.time()
        
        # Cleanup e contagem em uma transação
        pipe.zremrangebyscore(key, 0, now - window)
        pipe.zadd(key, {str(now): now})
        pipe.zcard(key)
        pipe.expire(key, window)
        _, _, count, _ = pipe.execute()
        
        return count > limit

    def __call__(self, request):
        # Ignorar certos paths
        if any(path in request.path_info for path in ['/static/', '/media/']):
            return self.get_response(request)

        key, limit, window = self.get_rate_limit_key(request)
        
        if self.is_rate_limited(key, limit, window):
            return HttpResponseTooManyRequests(
                'Rate limit exceeded',
                content_type='application/json'
            )

        response = self.get_response(request)
        
        # Adicionar headers de rate limit
        count = self.cache.zcard(key)
        response['X-RateLimit-Limit'] = str(limit)
        response['X-RateLimit-Remaining'] = str(max(0, limit - count))
        response['X-RateLimit-Reset'] = str(int(time.time() + window))
        
        return response 