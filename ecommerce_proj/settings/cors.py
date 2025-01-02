CORS_ALLOWED_ORIGINS = [
    "https://seudominio.com",
    "https://www.seudominio.com",
]

CORS_ALLOW_METHODS = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_EXPOSE_HEADERS = [
    'content-length',
    'x-ratelimit-limit',
    'x-ratelimit-remaining',
    'x-ratelimit-reset',
]

CORS_PREFLIGHT_MAX_AGE = 86400  # 24 horas
CORS_ALLOW_CREDENTIALS = True 