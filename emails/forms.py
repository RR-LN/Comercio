from django import forms
from .models import EmailAddress

class EmailAddressForm(forms.ModelForm):
    class Meta:
        model = EmailAddress
        fields = ['email', 'primary']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['email'].widget.attrs['placeholder'] = 'Digite seu e-mail'

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if EmailAddress.objects.filter(email=email).exists():
            raise forms.ValidationError('Este e-mail já está cadastrado')
        return email