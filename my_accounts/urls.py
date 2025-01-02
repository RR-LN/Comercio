from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, CustomTokenObtainPairView, UserViewSet, 
    AddressViewSet, UserActivityViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'addresses', AddressViewSet, basename='address')
router.register(r'activities', UserActivityViewSet, basename='user-activity')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('change-password/', UserViewSet.as_view({'post': 'change_password'}), name='change_password'),
    path('reset-password-request/', UserViewSet.as_view({'post': 'reset_password_request'}), name='reset_password_request'),
    path('reset-password-confirm/', UserViewSet.as_view({'post': 'reset_password_confirm'}), name='reset_password_confirm'),
    path('two-factor/status/', UserViewSet.as_view({'get': 'two_factor_status'}), name='two_factor_status'),
    path('two-factor/enable/', UserViewSet.as_view({'post': 'enable_two_factor'}), name='enable_two_factor'),
    path('two-factor/verify/', UserViewSet.as_view({'post': 'verify_two_factor'}), name='verify_two_factor'),
    path('two-factor/disable/', UserViewSet.as_view({'post': 'disable_two_factor'}), name='disable_two_factor'),
    path('profile/', UserViewSet.as_view({'get': 'profile', 'put': 'profile', 'patch': 'profile'}), name='user_profile'),
    path('preferences/', UserViewSet.as_view({'get': 'preferences', 'put': 'preferences', 'patch': 'preferences'}), name='user_preferences'),
]