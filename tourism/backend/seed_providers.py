import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from tourism.models import User, ServiceProvider

providers_data = [
    {
        "full_name": "Grand Hotel Partner",
        "email": "hotel@wandera.com",
        "password": "password123",
        "service_type": "Hotel",
        "business_name": "Grand Palace Hotel",
        "license_number": "LIC-HOTEL-101"
    },
    {
        "full_name": "Kerala Spice Chef",
        "email": "restaurant@wandera.com",
        "password": "password123",
        "service_type": "Restaurant",
        "business_name": "Kerala Spice Restaurant",
        "license_number": "LIC-REST-202"
    },
    {
        "full_name": "Royal Cabs Operator",
        "email": "transport@wandera.com",
        "password": "password123",
        "service_type": "Transportation",
        "business_name": "Royal Kerala Cabs & Travels",
        "license_number": "LIC-TRANS-303"
    },
    {
        "full_name": "Wayanad Adventure Guide",
        "email": "activity@wandera.com",
        "password": "password123",
        "service_type": "Activity",
        "business_name": "Wayanad Zipline & Kayaking Club",
        "license_number": "LIC-ACT-404"
    }
]

print("--- REGISTERING & CREATING 4 SERVICE PROVIDERS ---")
for item in providers_data:
    user, created = User.objects.get_or_create(
        email=item["email"],
        defaults={
            "full_name": item["full_name"],
            "password": item["password"],
            "role": "service_provider",
            "status": "active"
        }
    )
    if not created:
        user.full_name = item["full_name"]
        user.password = item["password"]
        user.role = "service_provider"
        user.status = "active"
        user.save()

    provider, p_created = ServiceProvider.objects.get_or_create(
        user=user,
        defaults={
            "service_type": item["service_type"],
            "business_name": item["business_name"],
            "license_number": item["license_number"]
        }
    )
    if not p_created:
        provider.service_type = item["service_type"]
        provider.business_name = item["business_name"]
        provider.license_number = item["license_number"]
        provider.save()

    print(f"SUCCESS: Email: {item['email']} | Password: {item['password']} | Type: {item['service_type']} | Provider ID: {provider.provider_id}")
print("--- ALL 4 PROVIDERS REGISTERED SUCCESSFULLY ---")
