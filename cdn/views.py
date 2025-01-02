from django.http import JsonResponse
from django.views import View

class SomeView(View):
    def get(self, request):
        return JsonResponse({'message': 'Hello from SomeView!'}) 