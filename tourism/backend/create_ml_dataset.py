import os
import django
import csv

# --------------------------------------------------
# Start Django
# --------------------------------------------------

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from tourism.models import (
    TouristProfile,
    Destination,
    ServiceProvider,
    Room,
    Activity,
    Vehicle,
    Booking,
)


# --------------------------------------------------
# Helper: Convert budget text into an approximate
# maximum trip budget for the ML dataset
# --------------------------------------------------

def get_budget_limit(budget):
    if not budget:
        return 0

    budget = str(budget).lower()

    if "low" in budget:
        return 5000

    if "moderate" in budget or "medium" in budget:
        return 10000

    if "high" in budget:
        return 20000

    # If the database contains a numeric budget
    numbers = []

    current = ""

    for char in budget:
        if char.isdigit():
            current += char
        else:
            if current:
                numbers.append(int(current))
                current = ""

    if current:
        numbers.append(int(current))

    if numbers:
        return max(numbers)

    return 0


# --------------------------------------------------
# Create dataset
# --------------------------------------------------

rows = []


tourists = TouristProfile.objects.select_related("user")
destinations = Destination.objects.filter(status="Active")


for tourist in tourists:

    preferences = tourist.travel_preferences or []

    if isinstance(preferences, list):
        preference_text = ", ".join(str(x) for x in preferences)
    else:
        preference_text = str(preferences)

    travel_style = tourist.travel_style or "Unknown"
    budget_range = tourist.budget_range or "Unknown"

    budget_limit = get_budget_limit(tourist.budget_range)


    for destination in destinations:

        # --------------------------------------------------
        # Destination preference matching
        # --------------------------------------------------

        category_match = 0

        if isinstance(preferences, list):
            if destination.category in preferences:
                category_match = 1


        # --------------------------------------------------
        # Find services belonging to this destination
        # --------------------------------------------------

        providers = ServiceProvider.objects.filter(
            destination=destination
        )

        hotel_providers = providers.filter(
            service_type="Hotel"
        )

        activity_providers = providers.filter(
            service_type="Activity"
        )

        transport_providers = providers.filter(
            service_type="Transportation"
        )


        # --------------------------------------------------
        # Service availability
        # --------------------------------------------------

        hotel_count = hotel_providers.count()
        activity_count = activity_providers.count()
        transport_count = transport_providers.count()


        # --------------------------------------------------
        # Hotel prices
        # --------------------------------------------------

        hotel_prices = list(
            Room.objects.filter(
                hotel__provider__in=hotel_providers
            ).values_list(
                "price_per_night",
                flat=True
            )
        )

        if hotel_prices:

            hotel_prices = [float(price) for price in hotel_prices]

            min_hotel_price = min(hotel_prices)
            avg_hotel_price = sum(hotel_prices) / len(hotel_prices)

        else:

            min_hotel_price = 0
            avg_hotel_price = 0


        # --------------------------------------------------
        # Activity prices
        # --------------------------------------------------

        activity_prices = list(
            Activity.objects.filter(
                provider__in=activity_providers
            ).values_list(
                "price",
                flat=True
            )
        )

        if activity_prices:

            activity_prices = [
                float(price) for price in activity_prices
            ]

            min_activity_price = min(activity_prices)
            avg_activity_price = (
                sum(activity_prices) /
                len(activity_prices)
            )

        else:

            min_activity_price = 0
            avg_activity_price = 0


        # --------------------------------------------------
        # Transportation prices
        # --------------------------------------------------

        vehicle_prices = list(
            Vehicle.objects.filter(
                transportation__provider__in=transport_providers
            ).values_list(
                "price_fare",
                flat=True
            )
        )

        if vehicle_prices:

            vehicle_prices = [
                float(price) for price in vehicle_prices
            ]

            min_transport_price = min(vehicle_prices)

            avg_transport_price = (
                sum(vehicle_prices) /
                len(vehicle_prices)
            )

        else:

            min_transport_price = 0
            avg_transport_price = 0


        # --------------------------------------------------
        # Initial trip duration
        #
        # We use 3 days only for creating the initial
        # training dataset.
        #
        # Later the AI Assistant will provide the real
        # number of days.
        # --------------------------------------------------

        trip_days = 3
        hotel_nights = trip_days - 1


        # --------------------------------------------------
        # Estimated trip cost
        # --------------------------------------------------

        estimated_hotel_cost = (
            min_hotel_price * hotel_nights
        )

        estimated_activity_cost = min_activity_price

        estimated_transport_cost = min_transport_price

        estimated_total_cost = (
            estimated_hotel_cost
            + estimated_activity_cost
            + estimated_transport_cost
        )


        # --------------------------------------------------
        # Previous booking information
        # --------------------------------------------------

        previous_booking = Booking.objects.filter(
            user=tourist.user,
            destination=destination
        ).exists()

        previous_completed_trip = Booking.objects.filter(
            user=tourist.user,
            destination=destination,
            booking_status="Completed"
        ).exists()


        # --------------------------------------------------
        # Budget compatibility
        # --------------------------------------------------

        if budget_limit > 0 and estimated_total_cost > 0:

            budget_compatible = int(
                estimated_total_cost <= budget_limit
            )

        else:

            # If tourist has no budget stored,
            # don't reject the destination because of budget.
            budget_compatible = 1


        # --------------------------------------------------
        # Service availability
        # --------------------------------------------------

        services_available = int(
            hotel_count > 0
            and activity_count > 0
            and transport_count > 0
        )


        # --------------------------------------------------
        # Bootstrap suitability score
        #
        # This is only for the initial ML dataset because
        # Wandera currently has very little real user
        # interaction data.
        # --------------------------------------------------

        suitability_score = 0

        if category_match:
            suitability_score += 3

        if budget_compatible:
            suitability_score += 2

        if services_available:
            suitability_score += 2

        if previous_booking:
            suitability_score += 1

        if previous_completed_trip:
            suitability_score += 2


        # --------------------------------------------------
        # ML target
        #
        # 1 = suitable
        # 0 = not suitable
        # --------------------------------------------------

        suitable = int(suitability_score >= 5)


        # --------------------------------------------------
        # Add row
        # --------------------------------------------------

        rows.append({

            "tourist_id": tourist.user.user_id,

            "travel_preferences": preference_text,

            "travel_style": travel_style,

            "budget_range": budget_range,

            "budget_limit": budget_limit,

            "trip_days": trip_days,

            "destination_id": destination.destination_id,

            "destination_category": destination.category,

            "destination_district": destination.district,

            "category_match": category_match,

            "hotel_count": hotel_count,

            "activity_count": activity_count,

            "transport_count": transport_count,

            "min_hotel_price": round(min_hotel_price, 2),

            "avg_hotel_price": round(avg_hotel_price, 2),

            "min_activity_price": round(min_activity_price, 2),

            "avg_activity_price": round(avg_activity_price, 2),

            "min_transport_price": round(min_transport_price, 2),

            "avg_transport_price": round(avg_transport_price, 2),

            "estimated_hotel_cost": round(
                estimated_hotel_cost, 2
            ),

            "estimated_activity_cost": round(
                estimated_activity_cost, 2
            ),

            "estimated_transport_cost": round(
                estimated_transport_cost, 2
            ),

            "estimated_total_cost": round(
                estimated_total_cost, 2
            ),

            "budget_compatible": budget_compatible,

            "services_available": services_available,

            "previous_booking": int(previous_booking),

            "previous_completed_trip": int(
                previous_completed_trip
            ),

            "suitability_score": suitability_score,

            "suitable": suitable,
        })


# --------------------------------------------------
# Save CSV
# --------------------------------------------------

output_file = "wandera_ml_dataset.csv"

fieldnames = list(rows[0].keys()) if rows else []


with open(
    output_file,
    "w",
    newline="",
    encoding="utf-8"
) as file:

    writer = csv.DictWriter(
        file,
        fieldnames=fieldnames
    )

    writer.writeheader()

    writer.writerows(rows)


# --------------------------------------------------
# Display result
# --------------------------------------------------

print()
print("======================================")
print("WANDERA ML DATASET CREATED")
print("======================================")
print("Total rows:", len(rows))
print("Total columns:", len(fieldnames))
print("File:", output_file)
print()

print("Suitable = 1:",
      sum(row["suitable"] == 1 for row in rows))

print("Suitable = 0:",
      sum(row["suitable"] == 0 for row in rows))

print()

print("Dataset contains:")

print("- Tourist profile information")
print("- Destination information")
print("- Hotel availability")
print("- Hotel prices")
print("- Activity availability")
print("- Activity prices")
print("- Transportation availability")
print("- Transportation prices")
print("- Estimated trip cost")
print("- Budget compatibility")
print("- Previous booking information")
print("- Previous completed trip information")

print()
print("Dataset generation completed successfully.")