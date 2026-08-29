import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from tourism.models import (
    User, ServiceProvider, ServiceProviderRequest,
    Hotel, Restaurant, Transportation, Activity
)

print("--- REMOVING MANUALLY ADDED SEEDED SERVICES & PROVIDERS ---")

# Delete child models & services
Hotel.objects.all().delete()
Restaurant.objects.all().delete()
Transportation.objects.all().delete()
Activity.objects.all().delete()

# Delete provider accounts created for testing
seeded_emails = ["hotel@wandera.com", "restaurant@wandera.com", "transport@wandera.com", "activity@wandera.com"]
ServiceProvider.objects.filter(user__email__in=seeded_emails).delete()
User.objects.filter(email__in=seeded_emails).delete()
ServiceProviderRequest.objects.filter(email__in=seeded_emails).delete()

print("--- ALL MANUALLY ADDED SERVICES AND TEST PROVIDERS REMOVED CLEANLY ---")
