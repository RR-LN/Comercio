from django.urls import path
from . import consumers

urlpatterns = [
    path('ws/notifications/', consumers.NotificationConsumer.as_asgi(), name='notification'),
    path('ws/chat/', consumers.ChatConsumer.as_asgi(), name='chat'),
]
