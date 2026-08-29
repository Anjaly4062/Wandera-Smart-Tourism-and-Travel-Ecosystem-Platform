from rest_framework import serializers

# pyrefly: ignore [missing-import]
from .models import (
    TouristProfile,
    User,
    ServiceProviderRequest,
    ServiceProvider,
    Destination,
    Hotel,
    HotelImage,
    HotelFacility,
    Room,
    RoomImage,
    Restaurant,
    RestaurantImage,
    RestaurantFacility,
    Transportation,
    TransportationImage,
    Vehicle,
    VehicleImage,
    Activity,
    ActivityImage,
    ActivityItem,
    ActivityItemImage,
    TripCart,
    TripCartItem,
    Booking,
    BookingItem
)

class RestaurantImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RestaurantImage
        fields = ["image_id", "image"]

class RestaurantFacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = RestaurantFacility
        fields = ["facility_id", "facility_name"]

class RestaurantSerializer(serializers.ModelSerializer):
    images = RestaurantImageSerializer(many=True, read_only=True)
    facilities = RestaurantFacilitySerializer(many=True, read_only=True)

    class Meta:
        model = Restaurant
        fields = "__all__"

class VehicleImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleImage
        fields = ["image_id", "image"]

class VehicleSerializer(serializers.ModelSerializer):
    images = VehicleImageSerializer(many=True, read_only=True)

    class Meta:
        model = Vehicle
        fields = "__all__"

class TransportationImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportationImage
        fields = ["image_id", "image"]

class TransportationSerializer(serializers.ModelSerializer):
    images = TransportationImageSerializer(many=True, read_only=True)
    vehicles = VehicleSerializer(many=True, read_only=True)

    class Meta:
        model = Transportation
        fields = "__all__"

class ActivityItemImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityItemImage
        fields = ["image_id", "image"]

class ActivityItemSerializer(serializers.ModelSerializer):
    images = ActivityItemImageSerializer(many=True, read_only=True)

    class Meta:
        model = ActivityItem
        fields = "__all__"

class ActivityImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityImage
        fields = ["image_id", "image"]

class ActivitySerializer(serializers.ModelSerializer):
    images = ActivityImageSerializer(many=True, read_only=True)
    items = ActivityItemSerializer(many=True, read_only=True)

    class Meta:
        model = Activity
        fields = "__all__"



class TouristProfileSerializer(serializers.ModelSerializer):

    full_name = serializers.CharField(
        source="user.full_name",
        read_only=True
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True
    )

    class Meta:
        model = TouristProfile

        fields = [
            "profile_id",
            "user",
            "full_name",
            "email",
            "phone",
            "date_of_birth",
            "profile_image",
            "travel_preferences",
            "travel_style",
            "budget_range",
            "previous_trips",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "profile_id",
            "created_at",
            "updated_at",
        ]


class HotelImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = HotelImage

        fields = [
            "image_id",
            "image"
        ]



class HotelFacilitySerializer(serializers.ModelSerializer):

    class Meta:
        model = HotelFacility

        fields = [
            "facility_id",
            "facility_name"
        ]



class RoomImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = RoomImage

        fields = [
            "image_id",
            "image"
        ]


class RoomSerializer(serializers.ModelSerializer):

    images = RoomImageSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Room

        fields = [
            "room_id",
            "room_name",
            "description",
            "price_per_night",
            "total_rooms",
            "maximum_guests",
            "images"
        ]



class HotelSerializer(serializers.ModelSerializer):

    images = HotelImageSerializer(
        many=True,
        read_only=True
    )

    facilities = HotelFacilitySerializer(
        many=True,
        read_only=True
    )

    rooms = RoomSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Hotel

        fields = [
            "hotel_id",
            "provider",
            "hotel_name",
            "description",
            "address",
            "district",
            "location",
            "contact_number",
            "email",
            "check_in_time",
            "check_out_time",
            "images",
            "facilities",
            "rooms",
            "created_at"
        ]



class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = "__all__"


class ServiceProviderRequestSerializer(serializers.ModelSerializer):

    class Meta:
        model = ServiceProviderRequest

        fields = "__all__"


class DestinationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Destination

        fields = [
            "destination_id",
            "name",
            "category",
            "district",
            "description",
            "location",
            "area",
            "image",
            "status"
        ]


class ServiceProviderSerializer(serializers.ModelSerializer):

    destination_name = serializers.CharField(
        source="destination.name",
        read_only=True
    )

    hotel = HotelSerializer(read_only=True)
    restaurant = RestaurantSerializer(read_only=True)
    transportation = TransportationSerializer(read_only=True)
    activity = ActivitySerializer(read_only=True)

    class Meta:
        model = ServiceProvider

        fields = [
            "provider_id",
            "user",
            "service_type",
            "destination",
            "destination_name",
            "business_name",
            "license_number",
            "phone",
            "email",
            "address",
            "district",
            "location",
            "area",
            "description",
            "created_at",
            "hotel",
            "restaurant",
            "transportation",
            "activity"
        ]


class TripCartItemSerializer(serializers.ModelSerializer):
    provider = ServiceProviderSerializer(read_only=True)
    room = RoomSerializer(read_only=True)
    vehicle = VehicleSerializer(read_only=True)
    activity_item = ActivityItemSerializer(read_only=True)

    class Meta:
        model = TripCartItem
        fields = [
            "cart_item_id",
            "cart",
            "provider",
            "service_type",
            "room",
            "vehicle",
            "activity_item",
            "booking_details",
            "created_at"
        ]


class TripCartSerializer(serializers.ModelSerializer):
    items = TripCartItemSerializer(many=True, read_only=True)
    destination = DestinationSerializer(read_only=True)
    user_name = serializers.CharField(source="user.full_name", read_only=True)

    class Meta:
        model = TripCart
        fields = [
            "cart_id",
            "user",
            "user_name",
            "destination",
            "items",
            "created_at",
            "updated_at"
        ]


class BookingItemSerializer(serializers.ModelSerializer):
    provider = ServiceProviderSerializer(read_only=True)

    class Meta:
        model = BookingItem
        fields = [
            "booking_item_id",
            "booking",
            "provider",
            "service_type",
            "service_id",
            "item_name",
            "details",
            "amount",
            "status",
            "created_at"
        ]


class BookingSerializer(serializers.ModelSerializer):
    items = BookingItemSerializer(many=True, read_only=True)
    destination = DestinationSerializer(read_only=True)
    user_name = serializers.CharField(source="user.full_name", read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)

    class Meta:
        model = Booking
        fields = [
            "booking_id",
            "user",
            "user_name",
            "user_email",
            "destination",
            "start_date",
            "end_date",
            "total_amount",
            "booking_status",
            "payment_status",
            "items",
            "created_at",
            "updated_at"
        ]
