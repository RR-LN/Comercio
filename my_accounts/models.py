from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _
from django.core.validators import RegexValidator, MinLengthValidator
from django.utils import timezone
import uuid
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError
import pyotp
from django.conf import settings

class CustomUserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email field must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(email, username, password, **extra_fields)

class CustomUser(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    is_verified = models.BooleanField(default=False)
    phone = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    is_verified = models.BooleanField(default=False, verbose_name=_("Is Verified"))
    last_password_change = models.DateTimeField(auto_now_add=True, verbose_name=_("Last Password Change"))
    two_factor_enabled = models.BooleanField(default=False, verbose_name=_("Two-Factor Authentication Enabled"))
    two_factor_secret = models.CharField(max_length=32, blank=True, null=True)
    failed_login_attempts = models.PositiveIntegerField(default=0, verbose_name=_("Failed Login Attempts"))
    last_failed_login = models.DateTimeField(null=True, blank=True, verbose_name=_("Last Failed Login"))
    account_locked_until = models.DateTimeField(null=True, blank=True, verbose_name=_("Account Locked Until"))
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True, verbose_name=_("Profile Picture"))
    bio = models.TextField(max_length=500, blank=True, verbose_name=_("Bio"))

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    objects = CustomUserManager()

    def __str__(self):
        return self.email

    class Meta:
        app_label = 'my_accounts'
        verbose_name = _("Custom User")
        verbose_name_plural = _("Custom Users")

    def clean(self):
        super().clean()
        if self.date_of_birth and self.date_of_birth > timezone.now().date():
            raise ValidationError(_("Date of birth cannot be in the future."))

    def set_password(self, raw_password):
        self.password = make_password(raw_password)
        self.last_password_change = timezone.now()
        self._password = raw_password

    def check_password(self, raw_password):
        is_correct = super().check_password(raw_password)
        if not is_correct:
            self.failed_login_attempts += 1
            self.last_failed_login = timezone.now()
            if self.failed_login_attempts >= settings.MAX_FAILED_LOGIN_ATTEMPTS:
                self.lock_account()
            self.save()
        else:
            self.failed_login_attempts = 0
            self.save()
        return is_correct

    def lock_account(self):
        self.account_locked_until = timezone.now() + timezone.timedelta(minutes=settings.ACCOUNT_LOCK_TIME_MINUTES)
        self.save()

    def unlock_account(self):
        self.account_locked_until = None
        self.failed_login_attempts = 0
        self.save()

    def is_account_locked(self):
        if self.account_locked_until and self.account_locked_until > timezone.now():
            return True
        elif self.account_locked_until:
            self.unlock_account()
        return False

    def enable_two_factor(self):
        self.two_factor_secret = pyotp.random_base32()
        self.two_factor_enabled = True
        self.save()

    def disable_two_factor(self):
        self.two_factor_secret = None
        self.two_factor_enabled = False
        self.save()

    def verify_two_factor(self, token):
        if not self.two_factor_enabled:
            return False
        totp = pyotp.TOTP(self.two_factor_secret)
        return totp.verify(token)

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def get_short_name(self):
        return self.first_name

    def email_user(self, subject, message, from_email=None, **kwargs):
        """Send an email to this user."""
        from django.core.mail import send_mail
        send_mail(subject, message, from_email, [self.email], **kwargs)

class UserActivity(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=50, verbose_name=_("Activity Type"))
    ip_address = models.GenericIPAddressField(verbose_name=_("IP Address"))
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name=_("Timestamp"))
    details = models.TextField(blank=True, null=True, verbose_name=_("Details"))

    class Meta:
        verbose_name = _("User Activity")
        verbose_name_plural = _("User Activities")
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.email} - {self.activity_type} - {self.timestamp}"

class PasswordResetToken(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.UUIDField(default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(hours=24)
        super().save(*args, **kwargs)

    def is_valid(self):
        return timezone.now() < self.expires_at

    class Meta:
        verbose_name = _("Password Reset Token")

# Add the Address model
class Address(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='addresses')
    street = models.CharField(max_length=255, verbose_name=_("Street"))
    city = models.CharField(max_length=100, verbose_name=_("City"))
    state = models.CharField(max_length=100, verbose_name=_("State"))
    country = models.CharField(max_length=100, verbose_name=_("Country"))
    postal_code = models.CharField(max_length=20, verbose_name=_("Postal Code"))
    is_default = models.BooleanField(default=False, verbose_name=_("Is Default"))

    class Meta:
        verbose_name = _("Address")
        verbose_name_plural = _("Addresses")

    def __str__(self):
        return f"{self.user.email} - {self.street}, {self.city}, {self.country}"

    def save(self, *args, **kwargs):
        if self.is_default:
            # Set all other addresses of this user to non-default
            Address.objects.filter(user=self.user, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)

# You might want to add a Profile model for additional user information
class Profile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(max_length=500, blank=True, verbose_name=_("Bio"))
    birth_date = models.DateField(null=True, blank=True, verbose_name=_("Birth Date"))
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True, verbose_name=_("Profile Picture"))

    class Meta:
        verbose_name = _("Profile")
        verbose_name_plural = _("Profiles")

    def __str__(self):
        return f"{self.user.email}'s profile"

# You might also want to add a model for user preferences
class UserPreferences(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='preferences')
    receive_newsletters = models.BooleanField(default=True, verbose_name=_("Receive Newsletters"))
    language = models.CharField(max_length=10, default='en', verbose_name=_("Preferred Language"))
    timezone = models.CharField(max_length=50, default='UTC', verbose_name=_("Timezone"))

    class Meta:
        verbose_name = _("User Preferences")
        verbose_name_plural = _("User Preferences")

def __str__(self):
        return f"{self.user.email}'s preferences"