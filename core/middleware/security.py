import re
from django.http import HttpResponseBadRequest
from django.core.exceptions import ValidationError
from django.utils.html import escape
from django.conf import settings

class SecurityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.xss_pattern = re.compile(r'<[^>]*script|javascript:|data:', re.IGNORECASE)
        self.sql_pattern = re.compile(r'\b(union|select|insert|update|delete|drop)\b', re.IGNORECASE)

    def sanitize_input(self, data):
        if isinstance(data, str):
            return escape(data)
        elif isinstance(data, dict):
            return {k: self.sanitize_input(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [self.sanitize_input(i) for i in data]
        return data

    def check_xss(self, value):
        if isinstance(value, str) and self.xss_pattern.search(value):
            raise ValidationError('Potential XSS attack detected')

    def check_sql_injection(self, value):
        if isinstance(value, str) and self.sql_pattern.search(value):
            raise ValidationError('Potential SQL injection detected')

    def validate_file_upload(self, request):
        if request.FILES:
            for uploaded_file in request.FILES.values():
                # Verificar extensão
                if not any(uploaded_file.name.lower().endswith(ext) 
                          for ext in settings.ALLOWED_FILE_EXTENSIONS):
                    raise ValidationError('Invalid file type')
                
                # Verificar tamanho
                if uploaded_file.size > settings.MAX_UPLOAD_SIZE:
                    raise ValidationError('File too large')
                
                # Verificar conteúdo
                content_type = uploaded_file.content_type.lower()
                if content_type not in settings.ALLOWED_CONTENT_TYPES:
                    raise ValidationError('Invalid content type')

    def __call__(self, request):
        try:
            # Sanitizar input
            request.GET = self.sanitize_input(request.GET.dict())
            if request.content_type == 'application/json':
                request.POST = self.sanitize_input(request.POST.dict())

            # Verificar XSS e SQL Injection
            for key, value in request.GET.items():
                self.check_xss(value)
                self.check_sql_injection(value)

            # Validar uploads
            if request.method in ('POST', 'PUT', 'PATCH'):
                self.validate_file_upload(request)

            response = self.get_response(request)

            # Adicionar headers de segurança
            response['X-Content-Type-Options'] = 'nosniff'
            response['X-Frame-Options'] = 'DENY'
            response['X-XSS-Protection'] = '1; mode=block'
            response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
            response['Content-Security-Policy'] = self.get_csp_header()

            return response

        except ValidationError as e:
            return HttpResponseBadRequest(str(e))

    def get_csp_header(self):
        return "; ".join([
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: https:",
            "font-src 'self' https://fonts.gstatic.com",
            "connect-src 'self' https://api.stripe.com",
            "frame-src 'self' https://js.stripe.com",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ]) 