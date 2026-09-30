import os
import joblib
from django.conf import settings


MODEL_PATH = os.path.join(
    settings.BASE_DIR,
    "tourism",
    "ml_models",
    "wandera_random_forest.pkl"
)

ENCODER_PATH = os.path.join(
    settings.BASE_DIR,
    "tourism",
    "ml_models",
    "wandera_encoder.pkl"
)


model = joblib.load(MODEL_PATH)
encoder = joblib.load(ENCODER_PATH)


print("Wandera recommendation model loaded successfully.")
# Questionnaire mappings used during ML training

BUDGET_OPTIONS = {
    "Low": 5000,
    "Moderate": 10000,
    "High": 15000,
}

TRIP_DAYS_OPTIONS = {
    "1–2 days": 2,
    "3–4 days": 3,
    "5–7 days": 5,
    "More than 7 days": 7,
}

TRAVEL_STYLE_MAPPING = {
    "Family": ["Beach", "Wildlife", "Waterfall", "Other"],
    "Solo": ["Hill Station", "Wildlife", "Waterfall", "Other"],
    "Couple": ["Beach", "Hill Station", "Waterfall", "Other"],
    "Friends": ["Beach", "Hill Station", "Wildlife", "Waterfall", "Other"],
}

def prepare_questionnaire(
    travel_preferences,
    travel_style,
    budget_range,
    trip_days
):
    # Validate destination preference
    valid_preferences = [
        "Beach",
        "Hill Station",
        "Wildlife",
        "Waterfall",
        "Other",
    ]

    if travel_preferences not in valid_preferences:
        raise ValueError("Invalid travel preference.")

    # Validate travel style
    if travel_style not in TRAVEL_STYLE_MAPPING:
        raise ValueError("Invalid travel style.")

    # Convert budget label to numeric value
    if budget_range not in BUDGET_OPTIONS:
        raise ValueError("Invalid budget range.")

    budget_limit = BUDGET_OPTIONS[budget_range]

    # Convert trip duration to numeric value
    if trip_days not in TRIP_DAYS_OPTIONS:
        raise ValueError("Invalid trip duration.")

    trip_days_value = TRIP_DAYS_OPTIONS[trip_days]

    return {
        "travel_preferences": travel_preferences,
        "travel_style": travel_style,
        "budget_range": budget_range,
        "budget_limit": budget_limit,
        "trip_days": trip_days_value,
    }
from tourism.models import (
    Destination,
    ServiceProvider,
    Hotel,
    Room,
    Activity,
    Transportation,
)


def calculate_destination_features(
    destination,
    travel_preferences,
    travel_style,
    budget_range,
    trip_days
):
    """
    Calculate the 17 raw ML features for one destination.
    These features must match the features used during training.
    """

    # Prepare questionnaire values
    questionnaire = prepare_questionnaire(
        travel_preferences,
        travel_style,
        budget_range,
        trip_days
    )

    budget_limit = questionnaire["budget_limit"]
    trip_days_value = questionnaire["trip_days"]

    # Get providers belonging to this destination
    providers = ServiceProvider.objects.filter(
        destination=destination
    )

    # ---------------------------------------------------------
    # HOTEL DATA
    # ---------------------------------------------------------

    hotel_providers = providers.filter(
        service_type="Hotel"
    )

    hotel_count = hotel_providers.count()

    hotel_ids = Hotel.objects.filter(
        provider__in=hotel_providers
    ).values_list("hotel_id", flat=True)

    hotel_prices = list(
        Room.objects.filter(
            hotel_id__in=hotel_ids
        ).values_list(
            "price_per_night",
            flat=True
        )
    )

    hotel_prices = [
        float(price)
        for price in hotel_prices
        if price is not None and float(price) > 0
    ]

    if hotel_prices:
        min_hotel_price = min(hotel_prices)
        avg_hotel_price = sum(hotel_prices) / len(hotel_prices)
    else:
        min_hotel_price = 0
        avg_hotel_price = 0

    # ---------------------------------------------------------
    # ACTIVITY DATA
    # ---------------------------------------------------------

    activity_providers = providers.filter(
        service_type="Activity"
    )

    activity_count = activity_providers.count()

    activity_prices = list(
        Activity.objects.filter(
            provider__in=activity_providers
        ).values_list(
            "price",
            flat=True
        )
    )

    activity_prices = [
        float(price)
        for price in activity_prices
        if price is not None and float(price) > 0
    ]

    if activity_prices:
        min_activity_price = min(activity_prices)
        avg_activity_price = sum(activity_prices) / len(activity_prices)
    else:
        min_activity_price = 0
        avg_activity_price = 0

    # ---------------------------------------------------------
    # TRANSPORTATION DATA
    # ---------------------------------------------------------

    transport_providers = providers.filter(
        service_type="Transportation"
    )

    transport_count = transport_providers.count()

    transport_prices = list(
        Transportation.objects.filter(
            provider__in=transport_providers
        ).values_list(
            "price_fare",
            flat=True
        )
    )

    transport_prices = [
        float(price)
        for price in transport_prices
        if price is not None and float(price) > 0
    ]

    if transport_prices:
        min_transport_price = min(transport_prices)
        avg_transport_price = sum(transport_prices) / len(transport_prices)
    else:
        min_transport_price = 0
        avg_transport_price = 0

    # ---------------------------------------------------------
    # CATEGORY MATCH
    # ---------------------------------------------------------

    category_match = int(
        travel_preferences == destination.category
    )

    # ---------------------------------------------------------
    # TRAVEL STYLE MATCH
    # ---------------------------------------------------------

    travel_style_match = int(
        destination.category
        in TRAVEL_STYLE_MAPPING[travel_style]
    )

    # ---------------------------------------------------------
    # SERVICES AVAILABLE
    # ---------------------------------------------------------

    services_available = int(
        hotel_count >= 1
        and activity_count >= 1
        and transport_count >= 1
    )

    # ---------------------------------------------------------
    # ESTIMATED COST
    # ---------------------------------------------------------

    # Same cost logic used during training:
    # average destination cost × (trip days / 3)

    base_total_cost = (
        avg_hotel_price
        + avg_activity_price
        + avg_transport_price
    )

    estimated_total_cost = (
        base_total_cost
        * (trip_days_value / 3)
    )

    estimated_total_cost = round(
        estimated_total_cost,
        2
    )

    # ---------------------------------------------------------
    # BUDGET COMPATIBILITY
    # ---------------------------------------------------------

    budget_compatible = int(
        estimated_total_cost <= budget_limit
    )

    # ---------------------------------------------------------
    # RETURN ALL 17 FEATURES
    # ---------------------------------------------------------

    return {
        "travel_preferences": travel_preferences,
        "travel_style": travel_style,
        "budget_range": budget_range,
        "trip_days": trip_days_value,
        "budget_limit": budget_limit,
        "destination_category": destination.category,

        "avg_total_cost": base_total_cost,
        "min_total_cost": (
            min_hotel_price
            + min_activity_price
            + min_transport_price
        ),
        "max_total_cost": (
            max(hotel_prices, default=0)
            + max(activity_prices, default=0)
            + max(transport_prices, default=0)
        ),

        "avg_hotel_count": hotel_count,
        "avg_activity_count": activity_count,
        "avg_transport_count": transport_count,

        "category_match": category_match,
        "travel_style_match": travel_style_match,
        "budget_compatible": budget_compatible,
        "services_available": services_available,

        "estimated_total_cost": estimated_total_cost,
    }
import pandas as pd


def predict_destination_suitability(features):
    """
    Convert the 17 raw features into the 30 ML features
    and predict suitability using the trained Random Forest.
    """

    # Create one-row DataFrame
    X = pd.DataFrame([features])

    # These must be exactly the same categorical columns
    # used during model training.
    categorical_columns = [
        "travel_preferences",
        "travel_style",
        "budget_range",
        "destination_category",
    ]

    # These are the remaining numerical columns.
    numerical_columns = [
        "trip_days",
        "budget_limit",
        "avg_total_cost",
        "min_total_cost",
        "max_total_cost",
        "avg_hotel_count",
        "avg_activity_count",
        "avg_transport_count",
        "category_match",
        "travel_style_match",
        "budget_compatible",
        "services_available",
        "estimated_total_cost",
    ]

    # Encode categorical values using the SAME encoder
    # that was trained in Google Colab.
    X_categorical = encoder.transform(
        X[categorical_columns]
    )

    # Keep numerical features in the training order.
    X_numerical = X[numerical_columns].reset_index(
        drop=True
    )

    # Create DataFrame for encoded features.
    X_encoded = pd.DataFrame(
        X_categorical,
        columns=encoder.get_feature_names_out(
            categorical_columns
        )
    )

    # Combine numerical + encoded features.
    X_final = pd.concat(
        [X_numerical, X_encoded],
        axis=1
    )

    # Predict suitability.
    prediction = model.predict(X_final)[0]

    # Get suitability probability.
    probability = model.predict_proba(X_final)[0][1]

    return {
        "suitable": int(prediction),
        "suitability_score": round(
            float(probability) * 100,
            2
        ),
    }
def get_recommended_destinations(
    travel_preferences,
    travel_style,
    budget_range,
    trip_days
):
    """
    Generate ranked destination recommendations
    based on tourist preferences and budget.
    Strictly filters by the selected destination category (travel_preferences).
    """

    recommendations = []

    # 1. Get active destinations
    destinations = Destination.objects.filter(
        status="Active"
    )

    for destination in destinations:

        # 2. Filter by selected category (strict requirement)
        if destination.category != travel_preferences:
            continue

        # 3. Calculate destination features
        features = calculate_destination_features(
            destination,
            travel_preferences,
            travel_style,
            budget_range,
            trip_days
        )

        # 4. Check budget compatibility
        if features["budget_compatible"] != 1:
            continue

        # 5. Run ML suitability prediction
        prediction = predict_destination_suitability(
            features
        )

        preference_match = True

        recommendations.append({
            "destination_id": destination.destination_id,
            "destination_name": destination.name,
            "category": destination.category,
            "district": destination.district,

            "estimated_total_cost": features[
                "estimated_total_cost"
            ],

            "budget_limit": features[
                "budget_limit"
            ],

            "budget_remaining": (
                features["budget_limit"]
                - features["estimated_total_cost"]
            ),

            "budget_compatible": features[
                "budget_compatible"
            ],

            "preference_match": preference_match,

            "suitability_score": prediction[
                "suitability_score"
            ],

            "suitable": prediction[
                "suitable"
            ],
        })

    # 6. Sort by ML suitability score (descending)
    recommendations.sort(
        key=lambda x: x["suitability_score"],
        reverse=True
    )

    # 7. Return recommendations
    return recommendations