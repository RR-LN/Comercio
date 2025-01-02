from django.core.cache import cache
from django.conf import settings
import re

class APICacheMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.cache_enabled_paths = [
            r'^/api/products/',
            r'^/api/categories/',
            r'^/api/brands/',
        ]
        self.cache_disabled_paths = [
            r'^/api/cart/',
            r'^/api/checkout/',
            r'^/api/auth/',
        ]

    def should_cache(self, path):
        if any(re.match(pattern, path) for pattern in self.cache_disabled_paths):
            return False
        return any(re.match(pattern, path) for pattern in self.cache_enabled_paths)

    def __call__(self, request):
        if request.method != 'GET' or not self.should_cache(request.path):
            return self.get_response(request)

        cache_key = f"api_cache:{request.path}:{request.GET.urlencode()}"
        response = cache.get(cache_key)

        if response is None:
            response = self.get_response(request)
            if response.status_code == 200:
                cache.set(cache_key, response, settings.API_CACHE_TTL)

        return response 