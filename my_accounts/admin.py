from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import CustomUser, Address, UserActivity, PasswordResetToken, Profile, UserPreferences

class AddressInline(admin.StackedInline):
    model = Address
    extra = 0

class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False

class UserPreferencesInline(admin.StackedInline):
    model = UserPreferences
    can_delete = False

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'phone_number', 'date_of_birth')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
        (_('Two-Factor Auth'), {'fields': ('two_factor_enabled', 'two_factor_secret')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'is_active', 'two_factor_enabled')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups', 'two_factor_enabled')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    inlines = [ProfileInline, UserPreferencesInline, AddressInline]

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('user', 'street', 'city', 'state', 'country', 'postal_code', 'is_default')
    list_filter = ('country', 'state', 'city')
    search_fields = ('user__email', 'street', 'city', 'state', 'country', 'postal_code')

@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display = ('user', 'activity_type', 'ip_address', 'timestamp')
    list_filter = ('activity_type', 'timestamp')
    search_fields = ('user__email', 'ip_address', 'details')

@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at', 'expires_at')
    search_fields = ('user__email',)

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'birth_date')
    search_fields = ('user__email', 'bio')

@admin.register(UserPreferences)
class UserPreferencesAdmin(admin.ModelAdmin):
    list_display = ('user', 'receive_newsletters', 'language', 'timezone')
    list_filter = ('receive_newsletters', 'language', 'timezone')
    search_fields = ('user__email',)