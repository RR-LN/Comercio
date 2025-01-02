from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm, PasswordChangeForm
from django.utils.translation import gettext_lazy as _
from .models import CustomUser, Address, UserActivity, PasswordResetToken, Profile, UserPreferences
from django.core.exceptions import ValidationError
from django.utils import timezone
import pyotp

class CustomUserCreationForm(UserCreationForm):
    """Custom form to handle User creation."""
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password1', 'password2', 'phone_number', 'date_of_birth']
        help_texts = {
            'username': _('Enter a unique username.'),
            'email': _('Enter a valid email address.'),
            'phone_number': _('Enter your phone number (optional).'),
            'date_of_birth': _('Enter your date of birth (optional).'),
        }
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'password1': forms.PasswordInput(attrs={'class': 'form-control'}),
            'password2': forms.PasswordInput(attrs={'class': 'form-control'}),
            'phone_number': forms.TextInput(attrs={'class': 'form-control'}),
            'date_of_birth': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
        }

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if CustomUser.objects.filter(email=email).exists():
            raise forms.ValidationError(_('A user with this email already exists.'))
        return email

    def clean_date_of_birth(self):
        dob = self.cleaned_data.get('date_of_birth')
        if dob and dob > timezone.now().date():
            raise forms.ValidationError(_('Date of birth cannot be in the future.'))
        return dob

class CustomUserChangeForm(UserChangeForm):
    """Custom form to handle User updates."""
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'first_name', 'last_name', 'phone_number', 'date_of_birth']
        help_texts = {
            'username': _('Enter a unique username.'),
            'email': _('Enter a valid email address.'),
            'phone_number': _('Enter your phone number (optional).'),
            'date_of_birth': _('Enter your date of birth (optional).'),
        }
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'first_name': forms.TextInput(attrs={'class': 'form-control'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control'}),
            'phone_number': forms.TextInput(attrs={'class': 'form-control'}),
            'date_of_birth': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
        }

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if CustomUser.objects.exclude(pk=self.instance.pk).filter(email=email).exists():
            raise forms.ValidationError(_('A user with this email already exists.'))
        return email

class ProfileForm(forms.ModelForm):
    """Form to handle Profile updates."""
    class Meta:
        model = Profile
        fields = ['bio', 'birth_date', 'profile_picture']
        widgets = {
            'bio': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'birth_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'profile_picture': forms.FileInput(attrs={'class': 'form-control-file'}),
        }

class UserPreferencesForm(forms.ModelForm):
    """Form to handle UserPreferences updates."""
    class Meta:
        model = UserPreferences
        fields = ['receive_newsletters', 'language', 'timezone']
        widgets = {
            'receive_newsletters': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'language': forms.Select(attrs={'class': 'form-control'}),
            'timezone': forms.Select(attrs={'class': 'form-control'}),
        }

class CustomPasswordChangeForm(PasswordChangeForm):
    """Custom form to handle password changes."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields:
            self.fields[field].widget.attrs.update({'class': 'form-control'})

class AddressForm(forms.ModelForm):
    """Form to handle Address creation and updates."""
    class Meta:
        model = Address
        fields = ['street', 'city', 'state', 'country', 'postal_code', 'is_default']
        widgets = {
            'street': forms.TextInput(attrs={'class': 'form-control'}),
            'city': forms.TextInput(attrs={'class': 'form-control'}),
            'state': forms.TextInput(attrs={'class': 'form-control'}),
            'country': forms.Select(attrs={'class': 'form-control'}),
            'postal_code': forms.TextInput(attrs={'class': 'form-control'}),
            'is_default': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields:
            self.fields[field].help_text = _(f'Enter the {field.replace("_", " ")}.')

    def clean(self):
        cleaned_data = super().clean()
        for field in self.fields:
            if not cleaned_data.get(field) and field != 'is_default':
                raise forms.ValidationError(_(f'{field.replace("_", " ").capitalize()} is required.'))
        return cleaned_data

class TwoFactorAuthForm(forms.Form):
    """Form for two-factor authentication."""
    token = forms.CharField(
        label=_("Authentication Token"),
        max_length=6,
        min_length=6,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': _('Enter 6-digit token')}),
    )

    def __init__(self, user, *args, **kwargs):
        self.user = user
        super().__init__(*args, **kwargs)

    def clean_token(self):
        token = self.cleaned_data.get('token')
        if not self.user.verify_two_factor(token):
            raise forms.ValidationError(_('Invalid token. Please try again.'))
        return token

class PasswordResetRequestForm(forms.Form):
    """Form for requesting a password reset."""
    email = forms.EmailField(
        label=_("Email"),
        max_length=254,
        widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': _('Enter your email address')}),
    )

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if not CustomUser.objects.filter(email=email, is_active=True).exists():
            raise forms.ValidationError(_('There is no active user associated with this email address.'))
        return email

class SetPasswordForm(forms.Form):
    """Form for setting a new password (for password reset)."""
    new_password1 = forms.CharField(
        label=_("New password"),
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': _('Enter new password')}),
        strip=False,
    )
    new_password2 = forms.CharField(
        label=_("New password confirmation"),
        strip=False,
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': _('Confirm new password')}),
    )

    def clean_new_password2(self):
        password1 = self.cleaned_data.get('new_password1')
        password2 = self.cleaned_data.get('new_password2')
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError(_("The two password fields didn't match."))
        return password2

class UserActivityFilterForm(forms.Form):
    """Form for filtering user activities."""
    activity_type = forms.ChoiceField(
        choices=[('', _('All'))] + UserActivity.ACTIVITY_TYPES,
        required=False,
        widget=forms.Select(attrs={'class': 'form-control'}),
    )
    start_date = forms.DateField(
        required=False,
        widget=forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
    )
    end_date = forms.DateField(
        required=False,
        widget=forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
    )

    def clean(self):
        cleaned_data = super().clean()
        start_date = cleaned_data.get('start_date')
        end_date = cleaned_data.get('end_date')
        if start_date and end_date and start_date > end_date:
            raise forms.ValidationError(_('Start date must be before end date.'))
        return cleaned_data