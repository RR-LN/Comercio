from django.db import models
from django.contrib.auth import get_user_model
from .user_profile import UserProfile

User = get_user_model()

def award_loyalty_points(user, points):
    profile, created = UserProfile.objects.get_or_create(user=user)
    profile.loyalty_points = models.F('loyalty_points') + points
    profile.save()

def use_loyalty_points(user, points):
    profile, created = UserProfile.objects.get_or_create(user=user)
    if profile.loyalty_points >= points:
        profile.loyalty_points = models.F('loyalty_points') - points
        profile.save()
        return True
    return False

User.award_loyalty_points = award_loyalty_points
User.use_loyalty_points = use_loyalty_points