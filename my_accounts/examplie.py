from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from .serializers import (
    CustomUserSerializer, CustomUserUpdateSerializer, CustomTokenObtainPairSerializer,
    AddressSerializer, UserActivitySerializer, ChangePasswordSerializer,
    ResetPasswordRequestSerializer, ResetPasswordConfirmSerializer,
    ProfileSerializer, UserPreferencesSerializer
)
from .models import Address, UserActivity, PasswordResetToken, Profile, UserPreferences
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from two_factor.utils import default_device
# Remove the import of Core from two_factor.views
from django_otp import devices_for_user
from django_otp.plugins.otp_totp.models import TOTPDevice
from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver

User = get_user_model()

# The rest of your code remains the same...

class UserViewSet(viewsets.ModelViewSet):
    # ... (keep the existing methods)

    @action(detail=False, methods=['get'])
    def two_factor_status(self, request):
        user = request.user
        default_device = user.totpdevice_set.filter(confirmed=True).first()
        return Response({
            'is_enabled': default_device is not None
        })

    @action(detail=False, methods=['post'])
    def enable_two_factor(self, request):
        user = request.user
        if user.totpdevice_set.filter(confirmed=True).exists():
            return Response({'message': _('Two-factor authentication is already enabled')}, status=status.HTTP_400_BAD_REQUEST)
        
        device = user.totpdevice_set.create(name="default")
        config_url = device.config_url
        
        return Response({
            'config_url': config_url,
            'message': _('Scan the QR code with your authenticator app and then verify with the token')
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def verify_two_factor(self, request):
        user = request.user
        token = request.data.get('token')
        
        device = user.totpdevice_set.filter(confirmed=False).first()
        if device is None:
            return Response({'message': _('No unconfirmed device found')}, status=status.HTTP_400_BAD_REQUEST)
        
        if device.verify_token(token):
            device.confirmed = True
            device.save()
            return Response({'message': _('Two-factor authentication enabled successfully')}, status=status.HTTP_200_OK)
        else:
            return Response({'message': _('Invalid token')}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def disable_two_factor(self, request):
        user = request.user
        device = user.totpdevice_set.filter(confirmed=True).first()
        if device:
            device.delete()
            return Response({'message': _('Two-factor authentication disabled successfully')}, status=status.HTTP_200_OK)
        else:
            return Response({'message': _('Two-factor authentication is not enabled')}, status=status.HTTP_400_BAD_REQUEST)

# The rest of your code remains the same...
