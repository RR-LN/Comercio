"""
Decorator to require JWT authentication for Django views.
"""
from functools import wraps
import jwt
from django.conf import settings
from django.http import JsonResponse

def jwt_required(view_func):
    """
    Decorator to require JWT authentication for Django views.

    Args:
        view_func (function): The view function to be decorated.

    Returns:
        function: The wrapped view function with JWT authentication.
    """
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        token = request.META.get('HTTP_AUTHORIZATION')
        if token:
            try:
                payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=['HS256'])
                request.user_id = payload['id']
            except jwt.ExpiredSignatureError:
                return JsonResponse({'error': 'Token expired'}, status=401)
            except jwt.InvalidTokenError:
                return JsonResponse({'error': 'Invalid token'}, status=401)
        else:
            return JsonResponse({'error': 'Token missing'}, status=401)
        
        return view_func(request, *args, **kwargs)
    
    return _wrapped_view
