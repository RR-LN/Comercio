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
#from two_factor.views import Core
from django_otp import devices_for_user
from django_otp.plugins.otp_totp.models import TOTPDevice
from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = CustomUserSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return CustomUserUpdateSerializer
        return CustomUserSerializer

    def get_object(self):
        return self.request.user

    @action(detail=False, methods=['get', 'put', 'patch'])
    def profile(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)
        if request.method == 'GET':
            serializer = ProfileSerializer(profile)
            return Response(serializer.data)
        elif request.method in ['PUT', 'PATCH']:
            serializer = ProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get', 'put', 'patch'])
    def preferences(self, request):
        preferences, created = UserPreferences.objects.get_or_create(user=request.user)
        if request.method == 'GET':
            serializer = UserPreferencesSerializer(preferences)
            return Response(serializer.data)
        elif request.method in ['PUT', 'PATCH']:
            serializer = UserPreferencesSerializer(preferences, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({"old_password": [_("Wrong password.")]}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': _('Password updated successfully')}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def reset_password_request(self, request):
        serializer = ResetPasswordRequestSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = User.objects.get(email=serializer.validated_data['email'])
                token = PasswordResetToken.objects.create(user=user)
                # Here you would typically send an email with the token
                return Response({'message': _('Password reset email sent')}, status=status.HTTP_200_OK)
            except ObjectDoesNotExist:
                return Response({'email': [_('User with this email does not exist')]}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def reset_password_confirm(self, request):
        serializer = ResetPasswordConfirmSerializer(data=request.data)
        if serializer.is_valid():
            try:
                token = PasswordResetToken.objects.get(token=serializer.validated_data['token'])
                if not token.is_valid():
                    return Response({'token': [_('Invalid or expired token')]}, status=status.HTTP_400_BAD_REQUEST)
                user = token.user
                user.set_password(serializer.validated_data['new_password'])
                user.save()
                token.delete()
                return Response({'message': _('Password reset successfully')}, status=status.HTTP_200_OK)
            except ObjectDoesNotExist:
                return Response({'token': [_('Invalid token')]}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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

class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserActivityViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserActivitySerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return UserActivity.objects.filter(user=self.request.user)

@receiver(user_logged_in)
def user_logged_in_callback(sender, request, user, **kwargs):
    device = default_device(user)
    if device:
        UserActivity.objects.create(
            user=user,
            activity_type='login',
            ip_address=request.META.get('REMOTE_ADDR'),
            details='Logged in with two-factor authentication'
        )
    else:
        UserActivity.objects.create(
            user=user,
            activity_type='login',
            ip_address=request.META.get('REMOTE_ADDR'),
            details='Logged in without two-factor authentication'
        )