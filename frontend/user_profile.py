from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    loyalty_points = models.PositiveIntegerField(default=0, verbose_name=_("Loyalty Points"))
    stripe_customer_id = models.CharField(max_length=255, blank=True, null=True, verbose_name=_("Stripe Customer ID"))
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True)
    birth_date = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return self.user.username