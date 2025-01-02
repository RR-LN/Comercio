from django.urls import path
from . import views

urlpatterns = [
    # Defina suas rotas aqui
    path('some-path/', views.SomeView.as_view(), name='some-view'),
] 