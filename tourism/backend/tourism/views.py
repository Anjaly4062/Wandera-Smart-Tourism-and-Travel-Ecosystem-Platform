from rest_framework.parsers import MultiPartParser, FormParser
from django.db import transaction
from django.db.models import Q
from django.shortcuts import render, get_object_or_404
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password, check_password
import json
from django.utils import timezone
from .models import (
    Hotel, HotelFacility, HotelImage, Room, RoomImage, TouristProfile, User,
    ServiceProviderRequest, ServiceProvider, Destination,
    Restaurant, RestaurantImage, RestaurantFacility,
    Transportation, TransportationImage, Vehicle, VehicleImage,
    Activity, ActivityImage, ActivityItem, ActivityItemImage,
    TripCart, TripCartItem, Booking, BookingItem
)
from .Serializers import (
    ServiceProviderSerializer, TouristProfileSerializer, UserSerializer,
    ServiceProviderRequestSerializer, DestinationSerializer, HotelSerializer,
    RoomSerializer, RoomImageSerializer, HotelFacilitySerializer, HotelImageSerializer,
    RestaurantSerializer, RestaurantImageSerializer, RestaurantFacilitySerializer,
    TransportationSerializer, TransportationImageSerializer, VehicleSerializer, VehicleImageSerializer,
    ActivitySerializer, ActivityImageSerializer, ActivityItemSerializer, ActivityItemImageSerializer,
    TripCartSerializer, TripCartItemSerializer, BookingSerializer, BookingItemSerializer
)

@api_view(['POST'])
def tourist_register(request):

    data = request.data


    if User.objects.filter(email=data['email']).exists():

        return Response(
            {
                "message":"Email already registered"
            },
            status=400
        )


    User.objects.create(

        full_name=data['full_name'],

        email=data['email'],

        password=data['password'],

        role="tourist"

    )


    return Response(
        {
            "message":"Tourist registration successful"
        }
    )


@api_view(['POST'])
def provider_register(request):

    data = request.data

    certificate = request.FILES.get("certificate")

    if not certificate:

        return Response(
            {
                "message":"Registration Certificate is required"
            },
            status=400
        )

    if ServiceProviderRequest.objects.filter(
        email=data["email"]
    ).exists():

        return Response(
            {
                "message":"Email already registered"
            },
            status=400
        )

    ServiceProviderRequest.objects.create(

        full_name=data["full_name"],

        email=data["email"],

        password=data["password"],

        service_type=data["service_type"],

        business_name=data["business_name"],

        license_number=data["license_number"],

        certificate=certificate

    )

    return Response(
        {
            "message":"Service provider request submitted"
        }
    )

@api_view(["POST"])
def login(request):

    email = request.data.get("email")

    password = request.data.get("password")

    try:

        user = User.objects.get(email=email)

    except User.DoesNotExist:

        return Response(
            {"message": "Invalid Email"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if password != user.password:

     return Response(
        {"message": "Invalid Password"},
        status=status.HTTP_400_BAD_REQUEST
    )
    provider_id = None
    service_type = None

    if user.role == "service_provider":

        try:

            provider = ServiceProvider.objects.get(
                user=user
            )

            provider_id = provider.provider_id
            service_type = provider.service_type
            print("USER ID:", user.user_id)
            print("PROVIDER ID:", provider_id)
            print("SERVICE TYPE:", service_type)

        except ServiceProvider.DoesNotExist:

            return Response(
                {
                    "message":
                    "Service provider details not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

    return Response(
        {

            "message": "Login Successful",

            "user_id": user.user_id,

            "name": user.full_name,

            "email": user.email,

            "role": user.role,

            "provider_id": provider_id,

            "service_type": service_type

        },
        status=status.HTTP_200_OK
    )
@api_view(["GET"])
def provider_requests(request):
    requests = ServiceProviderRequest.objects.all().order_by("-request_id")

    data = []

    for req in requests:
        data.append({
            "request_id": req.request_id,
            "full_name": req.full_name,
            "email": req.email,
            "business_name": req.business_name,
            "service_type": req.service_type,
            "license_number": req.license_number,
            "approval_status": req.approval_status,
            "certificate": req.certificate.url if req.certificate else None,
            
        })

    return Response(data)
@api_view(["POST"])
def accept_provider_request(request, request_id):

    provider_request = get_object_or_404(
        ServiceProviderRequest,
        request_id=request_id
    )

    if provider_request.approval_status == "Approved":
        return Response(
            {"message": "Already Approved"},
            status=400
        )

    # Create User
    user = User.objects.create(
        full_name=provider_request.full_name,
        email=provider_request.email,
        password=provider_request.password,   # Already hashed during registration
        role="service_provider",
        status="active"
    )

    # Create Service Provider
    ServiceProvider.objects.create(
        user=user,
        service_type=provider_request.service_type,
        business_name=provider_request.business_name,
        license_number=provider_request.license_number
    )

    # Update Request
    provider_request.approval_status = "Approved"
    provider_request.approved_at = timezone.now()
    provider_request.save()

    return Response({
        "message": "Service Provider Approved Successfully"
    })
@api_view(["POST"])
def reject_provider_request(request, request_id):

    provider_request = get_object_or_404(
        ServiceProviderRequest,
        request_id=request_id
    )

    provider_request.approval_status = "Rejected"
    provider_request.save()

    return Response({
        "message": "Request Rejected"
    })


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def add_destination(request):

    data = request.data.copy()
    if not data.get("area") and data.get("location"):
        data["area"] = data.get("location")

    serializer = DestinationSerializer(data=data)

    if serializer.is_valid():
        serializer.save()
        return Response(
            {
                "message": "Destination added successfully."
            },
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
def destination_list(request):

    destinations = Destination.objects.all().order_by("destination_id")

    serializer = DestinationSerializer(destinations, many=True)

    return Response(serializer.data)

import json

from django.db import transaction
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status

from .models import (
    ServiceProvider,
    Hotel,
    HotelImage,
    HotelFacility,
    Room,
    RoomImage
)



@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def add_hotel(request):

    try:

        print("====================================")
        print("ADD HOTEL REQUEST")
        print("====================================")

        # -----------------------------------------
        # PROVIDER ID
        # -----------------------------------------

        provider_id = request.data.get("provider_id")

        print("Provider ID:", provider_id)

        if not provider_id:
            return Response(
                {
                    "error": "Provider ID is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            provider = ServiceProvider.objects.get(
                provider_id=provider_id
            )

            if provider.service_type != "Hotel":
                return Response(
                    {"error": f"Service type mismatch: Account is '{provider.service_type}', not 'Hotel'."},
                    status=status.HTTP_403_FORBIDDEN
                )

        except ServiceProvider.DoesNotExist:

            return Response(
                {
                    "error": "Service provider not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # -----------------------------------------
        # PRINT RECEIVED DATA
        # -----------------------------------------

        print("Hotel Name:",
              request.data.get("hotel_name"))

        print("Facilities:",
              request.data.get("facilities"))

        print("Rooms:",
              request.data.get("rooms"))

        print("FILES:")
        print(request.FILES)

        # -----------------------------------------
        # DATABASE TRANSACTION
        # -----------------------------------------

        with transaction.atomic():

            # =====================================
            # CREATE HOTEL
            # =====================================

            hotel = Hotel.objects.create(

                provider=provider,

                hotel_name=request.data.get(
                    "hotel_name"
                ),

                description=request.data.get(
                    "description"
                ),

                address=request.data.get(
                    "address"
                ),

                district=request.data.get(
                    "district"
                ),

                location=request.data.get(
                    "location"
                ),

                contact_number=request.data.get(
                    "contact_number"
                ),

                email=request.data.get(
                    "email"
                ),

                check_in_time=request.data.get(
                    "check_in_time"
                ),

                check_out_time=request.data.get(
                    "check_out_time"
                )
            )

            loc = request.data.get("location")
            dist = request.data.get("district")
            area = request.data.get("area") or loc
            if loc or area or dist:
                if loc:
                    provider.location = loc
                if dist:
                    provider.district = dist
                if area:
                    provider.area = area
                provider.save()

            print(
                "Hotel created:",
                hotel.hotel_id
            )

            # =====================================
            # HOTEL IMAGES
            # =====================================

            hotel_images = request.FILES.getlist(
                "hotel_images"
            )

            print(
                "Hotel images:",
                len(hotel_images)
            )

            for image in hotel_images:

                HotelImage.objects.create(

                    hotel=hotel,

                    image=image
                )

            # =====================================
            # HOTEL FACILITIES
            # =====================================

            facilities_data = request.data.get(
                "facilities",
                "[]"
            )

            try:

                facilities = json.loads(
                    facilities_data
                )

            except json.JSONDecodeError:

                facilities = []

            print(
                "Facilities received:",
                facilities
            )

            for facility in facilities:

                if facility and facility.strip():

                    HotelFacility.objects.create(

                        hotel=hotel,

                        facility_name=facility.strip()
                    )

            # =====================================
            # ROOMS
            # =====================================

            rooms_data = request.data.get(
                "rooms",
                "[]"
            )

            try:

                rooms = json.loads(
                    rooms_data
                )

            except json.JSONDecodeError:

                rooms = []

            print(
                "Rooms received:",
                rooms
            )

            # -------------------------------------
            # CREATE EACH ROOM
            # -------------------------------------

            for index, room_data in enumerate(rooms):

                print(
                    f"Creating room {index}:",
                    room_data
                )

                room = Room.objects.create(

                    hotel=hotel,

                    room_name=room_data.get(
                        "room_name",
                        ""
                    ),

                    description=room_data.get(
                        "description",
                        ""
                    ),

                    price_per_night=room_data.get(
                        "price_per_night",
                        0
                    ),

                    total_rooms=room_data.get(
                        "total_rooms",
                        0
                    ),

                    maximum_guests=room_data.get(
                        "maximum_guests",
                        0
                    )
                )

                print(
                    "Room created:",
                    room.room_id
                )

                # =================================
                # ROOM IMAGES
                # =================================

                room_images = request.FILES.getlist(
                    f"room_images_{index}"
                )

                print(
                    f"Room {index} images:",
                    len(room_images)
                )

                for image in room_images:

                    RoomImage.objects.create(

                        room=room,

                        image=image
                    )

        # -----------------------------------------
        # SUCCESS
        # -----------------------------------------

        # Refresh object so related objects
        # are available in serializer

        hotel.refresh_from_db()

        return Response(

            {
                "message":
                    "Hotel added successfully.",

                "hotel":
                    HotelSerializer(
                        hotel
                    ).data
            },

            status=status.HTTP_201_CREATED
        )

    except Exception as e:

        print(
            "ERROR WHILE ADDING HOTEL:",
            str(e)
        )

        return Response(

            {
                "error": str(e)
            },

            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
@api_view(["GET", "PUT"])
def tourist_profile(request, user_id):
    try:
        user = User.objects.get(user_id=user_id)
    except User.DoesNotExist:
        return Response(
            {"error": "User not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    profile, created = TouristProfile.objects.get_or_create(user=user)

    if request.method == "GET":
        profile.refresh_from_db()
        serializer = TouristProfileSerializer(
            profile,
            context={"request": request}
        )
        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    elif request.method == "PUT":
        try:
            data = request.data
            full_name = data.get("full_name")
            if full_name:
                user.full_name = full_name
                user.save()

            if "phone" in data:
                profile.phone = data.get("phone") or ""
            if "date_of_birth" in data:
                dob = data.get("date_of_birth")
                profile.date_of_birth = dob if dob and str(dob).strip() else None
            if "travel_preferences" in data:
                profile.travel_preferences = data.get("travel_preferences") or []
            if "travel_style" in data:
                profile.travel_style = data.get("travel_style") or ""
            if "budget_range" in data:
                profile.budget_range = data.get("budget_range") or ""
            if "previous_trips" in data:
                profile.previous_trips = data.get("previous_trips") or []

            profile.save()
            profile.refresh_from_db()

            serializer = TouristProfileSerializer(
                profile,
                context={"request": request}
            )
            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )
        except Exception as e:
            print("ERROR SAVING TOURIST PROFILE:", e)
            return Response(
                {"error": f"Failed to save profile: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )


@api_view(["GET"])
def destination_details(request, destination_id):

    try:
        destination = Destination.objects.get(
            destination_id=destination_id,
            status="Active"
        )

    except Destination.DoesNotExist:
        return Response(
            {
                "message": "Destination not found"
            },
            status=status.HTTP_404_NOT_FOUND
        )

    import re
    raw_area = (destination.area or destination.location or destination.name or "").strip()
    place_tokens = [p.strip() for p in re.split(r'[,/\-\|]', raw_area) if p.strip()]

    area_query = Q(destination=destination)
    for token in place_tokens:
        if len(token) >= 3:
            area_query |= Q(area__icontains=token)
            area_query |= Q(location__icontains=token)
            area_query |= Q(destination__area__icontains=token)
            area_query |= Q(destination__location__icontains=token)

    service_providers = ServiceProvider.objects.filter(
        area_query
    ).distinct().select_related(
        "destination",
        "hotel",
        "restaurant",
        "transportation",
        "activity"
    ).prefetch_related(
        "hotel__images",
        "hotel__facilities",
        "hotel__rooms__images",
        "restaurant__images",
        "restaurant__facilities",
        "transportation__images",
        "transportation__vehicles",
        "activity__images",
        "activity__items"
    )

    # Only the 4 required services
    hotels = service_providers.filter(
        service_type="Hotel"
    )

    restaurants = service_providers.filter(
        service_type="Restaurant"
    )

    transportation = service_providers.filter(
        service_type="Transportation"
    )

    activities = service_providers.filter(
        service_type="Activity"
    )

    return Response({

        "destination": DestinationSerializer(
            destination
        ).data,

        "hotels": ServiceProviderSerializer(
            hotels,
            many=True
        ).data,

        "restaurants": ServiceProviderSerializer(
            restaurants,
            many=True
        ).data,

        "transportation": ServiceProviderSerializer(
            transportation,
            many=True
        ).data,

        "activities": ServiceProviderSerializer(
            activities,
            many=True
        ).data

    })

@api_view(["GET"])
def service_details(request, provider_id):

    try:

        provider = ServiceProvider.objects.select_related(
            "destination",
            "hotel"
        ).prefetch_related(
            "hotel__images",
            "hotel__facilities",
            "hotel__rooms__images"
        ).get(
            provider_id=provider_id
        )

    except ServiceProvider.DoesNotExist:

        return Response(
            {
                "message": "Service provider not found"
            },
            status=status.HTTP_404_NOT_FOUND
        )


    return Response({

        "provider": ServiceProviderSerializer(
            provider
        ).data

    })


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def add_room(request):
    try:
        hotel_id = request.data.get("hotel_id")
        if not hotel_id:
            return Response(
                {"error": "Hotel ID is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            hotel = Hotel.objects.get(hotel_id=hotel_id)
        except Hotel.DoesNotExist:
            return Response(
                {"error": "Hotel not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        room = Room.objects.create(
            hotel=hotel,
            room_name=request.data.get("room_name", ""),
            description=request.data.get("description", ""),
            price_per_night=request.data.get("price_per_night", 0),
            total_rooms=request.data.get("total_rooms", 0),
            maximum_guests=request.data.get("maximum_guests", 0)
        )

        room_images = request.FILES.getlist("room_images")
        if not room_images:
            room_images = request.FILES.getlist("images")

        for image in room_images:
            RoomImage.objects.create(
                room=room,
                image=image
            )

        return Response(
            {
                "message": "Room added successfully.",
                "room": RoomSerializer(room).data
            },
            status=status.HTTP_201_CREATED
        )

    except Exception as e:
        print("ERROR WHILE ADDING ROOM:", str(e))
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
def get_provider_hotel(request, provider_id):
    try:
        provider = ServiceProvider.objects.get(provider_id=provider_id)
        try:
            hotel = Hotel.objects.prefetch_related(
                "images",
                "facilities",
                "rooms__images"
            ).get(provider=provider)
            return Response({
                "hotel": HotelSerializer(hotel).data
            }, status=status.HTTP_200_OK)
        except Hotel.DoesNotExist:
            return Response({
                "message": "No hotel found for this provider.",
                "hotel": None
            }, status=status.HTTP_200_OK)

    except ServiceProvider.DoesNotExist:
        return Response(
            {"error": "Service provider not found."},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(["POST", "PUT"])
@parser_classes([MultiPartParser, FormParser])
def edit_hotel(request, hotel_id):
    try:
        hotel = get_object_or_404(Hotel, hotel_id=hotel_id)

        hotel.hotel_name = request.data.get("hotel_name", hotel.hotel_name)
        hotel.description = request.data.get("description", hotel.description)
        hotel.address = request.data.get("address", hotel.address)
        hotel.district = request.data.get("district", hotel.district)
        hotel.location = request.data.get("location", hotel.location)
        hotel.contact_number = request.data.get("contact_number", hotel.contact_number)
        hotel.email = request.data.get("email", hotel.email)
        hotel.check_in_time = request.data.get("check_in_time", hotel.check_in_time)
        hotel.check_out_time = request.data.get("check_out_time", hotel.check_out_time)
        hotel.save()

        facilities_data = request.data.get("facilities")
        if facilities_data is not None:
            try:
                facilities = json.loads(facilities_data)
                HotelFacility.objects.filter(hotel=hotel).delete()
                for facility in facilities:
                    if facility and facility.strip():
                        HotelFacility.objects.create(
                            hotel=hotel,
                            facility_name=facility.strip()
                        )
            except json.JSONDecodeError:
                pass

        hotel_images = request.FILES.getlist("hotel_images")
        for image in hotel_images:
            HotelImage.objects.create(
                hotel=hotel,
                image=image
            )

        hotel.refresh_from_db()
        return Response({
            "message": "Hotel updated successfully.",
            "hotel": HotelSerializer(hotel).data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print("ERROR WHILE EDITING HOTEL:", str(e))
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST", "PUT"])
@parser_classes([MultiPartParser, FormParser])
def edit_room(request, room_id):
    try:
        room = get_object_or_404(Room, room_id=room_id)

        room.room_name = request.data.get("room_name", room.room_name)
        room.description = request.data.get("description", room.description)
        room.price_per_night = request.data.get("price_per_night", room.price_per_night)
        room.total_rooms = request.data.get("total_rooms", room.total_rooms)
        room.maximum_guests = request.data.get("maximum_guests", room.maximum_guests)
        room.save()

        room_images = request.FILES.getlist("room_images")
        if not room_images:
            room_images = request.FILES.getlist("images")

        for image in room_images:
            RoomImage.objects.create(
                room=room,
                image=image
            )

        room.refresh_from_db()
        return Response({
            "message": "Room updated successfully.",
            "room": RoomSerializer(room).data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print("ERROR WHILE EDITING ROOM:", str(e))
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["DELETE", "POST"])
def delete_room(request, room_id):
    try:
        room = get_object_or_404(Room, room_id=room_id)
        room.delete()
        return Response({"message": "Room deleted successfully."}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def get_provider_info(request, provider_id):
    try:
        provider = ServiceProvider.objects.select_related(
            "destination", "hotel", "restaurant", "transportation", "activity"
        ).prefetch_related(
            "hotel__images", "hotel__facilities", "hotel__rooms__images",
            "restaurant__images", "restaurant__facilities",
            "transportation__images", "transportation__vehicles__images",
            "activity__images", "activity__items__images"
        ).get(provider_id=provider_id)
        
        return Response({
            "provider": ServiceProviderSerializer(provider).data
        }, status=status.HTTP_200_OK)

    except ServiceProvider.DoesNotExist:
        return Response(
            {"error": "Service provider not found."},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def add_restaurant(request):
    try:
        provider_id = request.data.get("provider_id")
        if not provider_id:
            return Response({"error": "Provider ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        provider = get_object_or_404(ServiceProvider, provider_id=provider_id)

        if provider.service_type != "Restaurant":
            return Response(
                {"error": f"Service type mismatch: Account is '{provider.service_type}', not 'Restaurant'."},
                status=status.HTTP_403_FORBIDDEN
            )

        restaurant = Restaurant.objects.create(
            provider=provider,
            restaurant_name=request.data.get("restaurant_name", ""),
            description=request.data.get("description", ""),
            address=request.data.get("address", ""),
            district=request.data.get("district", ""),
            location=request.data.get("location", ""),
            contact_number=request.data.get("contact_number", ""),
            email=request.data.get("email", ""),
            cuisine_type=request.data.get("cuisine_type", ""),
            opening_time=request.data.get("opening_time", "09:00"),
            closing_time=request.data.get("closing_time", "22:00")
        )

        r_loc = request.data.get("location")
        r_dist = request.data.get("district")
        r_area = request.data.get("area") or r_loc
        if r_loc or r_area or r_dist:
            if r_loc:
                provider.location = r_loc
            if r_dist:
                provider.district = r_dist
            if r_area:
                provider.area = r_area
            provider.save()

        restaurant_images = request.FILES.getlist("restaurant_images")
        if not restaurant_images:
            restaurant_images = request.FILES.getlist("images")
        for img in restaurant_images:
            RestaurantImage.objects.create(restaurant=restaurant, image=img)

        facilities_data = request.data.get("facilities", "[]")
        try:
            facilities = json.loads(facilities_data)
            for fac in facilities:
                if fac and fac.strip():
                    RestaurantFacility.objects.create(restaurant=restaurant, facility_name=fac.strip())
        except json.JSONDecodeError:
            pass

        return Response({"message": "Restaurant added successfully.", "restaurant": RestaurantSerializer(restaurant).data}, status=status.HTTP_201_CREATED)
    except Exception as e:
        print("ERROR IN ADD RESTAURANT:", str(e))
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST", "PUT"])
@parser_classes([MultiPartParser, FormParser])
def edit_restaurant(request, restaurant_id):
    try:
        restaurant = get_object_or_404(Restaurant, restaurant_id=restaurant_id)

        restaurant.restaurant_name = request.data.get("restaurant_name", restaurant.restaurant_name)
        restaurant.description = request.data.get("description", restaurant.description)
        restaurant.address = request.data.get("address", restaurant.address)
        restaurant.district = request.data.get("district", restaurant.district)
        restaurant.location = request.data.get("location", restaurant.location)
        restaurant.contact_number = request.data.get("contact_number", restaurant.contact_number)
        restaurant.email = request.data.get("email", restaurant.email)
        restaurant.cuisine_type = request.data.get("cuisine_type", restaurant.cuisine_type)
        restaurant.opening_time = request.data.get("opening_time", restaurant.opening_time)
        restaurant.closing_time = request.data.get("closing_time", restaurant.closing_time)
        restaurant.save()

        facilities_data = request.data.get("facilities")
        if facilities_data is not None:
            try:
                facilities = json.loads(facilities_data)
                RestaurantFacility.objects.filter(restaurant=restaurant).delete()
                for fac in facilities:
                    if fac and fac.strip():
                        RestaurantFacility.objects.create(restaurant=restaurant, facility_name=fac.strip())
            except json.JSONDecodeError:
                pass

        new_images = request.FILES.getlist("restaurant_images")
        for img in new_images:
            RestaurantImage.objects.create(restaurant=restaurant, image=img)

        restaurant.refresh_from_db()
        return Response({"message": "Restaurant updated successfully.", "restaurant": RestaurantSerializer(restaurant).data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def add_transportation(request):
    try:
        provider_id = request.data.get("provider_id")
        if not provider_id:
            return Response({"error": "Provider ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        provider = get_object_or_404(ServiceProvider, provider_id=provider_id)

        if provider.service_type != "Transportation":
            return Response(
                {"error": f"Service type mismatch: Account is '{provider.service_type}', not 'Transportation'."},
                status=status.HTTP_403_FORBIDDEN
            )

        transportation = Transportation.objects.create(
            provider=provider,
            service_name=request.data.get("service_name", ""),
            vehicle_type=request.data.get("vehicle_type", ""),
            description=request.data.get("description", ""),
            starting_location=request.data.get("starting_location", ""),
            service_area=request.data.get("service_area", ""),
            contact_number=request.data.get("contact_number", ""),
            email=request.data.get("email", ""),
            price_fare=request.data.get("price_fare", 0),
            availability_status=request.data.get("availability_status", "Available")
        )

        t_loc = request.data.get("starting_location") or request.data.get("service_area") or request.data.get("location")
        t_dist = request.data.get("district")
        t_area = request.data.get("area") or request.data.get("service_area") or t_loc
        if t_loc or t_area or t_dist:
            if t_loc:
                provider.location = t_loc
            if t_dist:
                provider.district = t_dist
            if t_area:
                provider.area = t_area
            provider.save()

        transportation_images = request.FILES.getlist("transportation_images")
        if not transportation_images:
            transportation_images = request.FILES.getlist("images")
        for img in transportation_images:
            TransportationImage.objects.create(transportation=transportation, image=img)

        return Response({"message": "Transportation service added successfully.", "transportation": TransportationSerializer(transportation).data}, status=status.HTTP_201_CREATED)
    except Exception as e:
        print("ERROR IN ADD TRANSPORTATION:", str(e))
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST", "PUT"])
@parser_classes([MultiPartParser, FormParser])
def edit_transportation(request, transportation_id):
    try:
        transportation = get_object_or_404(Transportation, transportation_id=transportation_id)

        transportation.service_name = request.data.get("service_name", transportation.service_name)
        transportation.vehicle_type = request.data.get("vehicle_type", transportation.vehicle_type)
        transportation.description = request.data.get("description", transportation.description)
        transportation.starting_location = request.data.get("starting_location", transportation.starting_location)
        transportation.service_area = request.data.get("service_area", transportation.service_area)
        transportation.contact_number = request.data.get("contact_number", transportation.contact_number)
        transportation.email = request.data.get("email", transportation.email)
        transportation.price_fare = request.data.get("price_fare", transportation.price_fare)
        transportation.availability_status = request.data.get("availability_status", transportation.availability_status)
        transportation.save()

        new_images = request.FILES.getlist("transportation_images")
        for img in new_images:
            TransportationImage.objects.create(transportation=transportation, image=img)

        transportation.refresh_from_db()
        return Response({"message": "Transportation service updated successfully.", "transportation": TransportationSerializer(transportation).data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def add_activity(request):
    try:
        provider_id = request.data.get("provider_id")
        if not provider_id:
            return Response({"error": "Provider ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        provider = get_object_or_404(ServiceProvider, provider_id=provider_id)

        if provider.service_type != "Activity":
            return Response(
                {"error": f"Service type mismatch: Account is '{provider.service_type}', not 'Activity'."},
                status=status.HTTP_403_FORBIDDEN
            )

        activity = Activity.objects.create(
            provider=provider,
            activity_name=request.data.get("activity_name", ""),
            description=request.data.get("description", ""),
            location=request.data.get("location", ""),
            district=request.data.get("district", ""),
            contact_number=request.data.get("contact_number", ""),
            email=request.data.get("email", ""),
            price=request.data.get("price", 0),
            duration=request.data.get("duration", ""),
            available_times=request.data.get("available_times", ""),
            capacity=request.data.get("capacity", 1),
            instructions=request.data.get("instructions", "")
        )

        a_loc = request.data.get("location")
        a_dist = request.data.get("district")
        a_area = request.data.get("area") or a_loc
        if a_loc or a_area or a_dist:
            if a_loc:
                provider.location = a_loc
            if a_dist:
                provider.district = a_dist
            if a_area:
                provider.area = a_area
            provider.save()

        activity_images = request.FILES.getlist("activity_images")
        if not activity_images:
            activity_images = request.FILES.getlist("images")
        for img in activity_images:
            ActivityImage.objects.create(activity=activity, image=img)

        return Response({"message": "Activity added successfully.", "activity": ActivitySerializer(activity).data}, status=status.HTTP_201_CREATED)
    except Exception as e:
        print("ERROR IN ADD ACTIVITY:", str(e))
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST", "PUT"])
@parser_classes([MultiPartParser, FormParser])
def edit_activity(request, activity_id):
    try:
        activity = get_object_or_404(Activity, activity_id=activity_id)

        activity.activity_name = request.data.get("activity_name", activity.activity_name)
        activity.description = request.data.get("description", activity.description)
        activity.location = request.data.get("location", activity.location)
        activity.district = request.data.get("district", activity.district)
        activity.contact_number = request.data.get("contact_number", activity.contact_number)
        activity.email = request.data.get("email", activity.email)
        activity.price = request.data.get("price", activity.price)
        activity.duration = request.data.get("duration", activity.duration)
        activity.available_times = request.data.get("available_times", activity.available_times)
        activity.capacity = request.data.get("capacity", activity.capacity)
        activity.instructions = request.data.get("instructions", activity.instructions)
        activity.save()

        new_images = request.FILES.getlist("activity_images")
        for img in new_images:
            ActivityImage.objects.create(activity=activity, image=img)

        activity.refresh_from_db()
        return Response({"message": "Activity updated successfully.", "activity": ActivitySerializer(activity).data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def add_vehicle(request):
    try:
        transportation_id = request.data.get("transportation_id")
        if not transportation_id:
            return Response({"error": "Transportation Agency ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        transportation = get_object_or_404(Transportation, transportation_id=transportation_id)

        vehicle = Vehicle.objects.create(
            transportation=transportation,
            vehicle_name=request.data.get("vehicle_name", ""),
            vehicle_type=request.data.get("vehicle_type", ""),
            description=request.data.get("description", ""),
            price_fare=request.data.get("price_fare", 0),
            fare_unit=request.data.get("fare_unit", "/ day"),
            seating_capacity=request.data.get("seating_capacity", 4),
            availability_status=request.data.get("availability_status", "Available")
        )

        vehicle_images = request.FILES.getlist("vehicle_images")
        if not vehicle_images:
            vehicle_images = request.FILES.getlist("images")

        for img in vehicle_images:
            VehicleImage.objects.create(vehicle=vehicle, image=img)

        vehicle.refresh_from_db()
        return Response({"message": "Vehicle added successfully.", "vehicle": VehicleSerializer(vehicle).data}, status=status.HTTP_201_CREATED)
    except Exception as e:
        print("ERROR ADDING VEHICLE:", str(e))
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST", "PUT"])
@parser_classes([MultiPartParser, FormParser])
def edit_vehicle(request, vehicle_id):
    try:
        vehicle = get_object_or_404(Vehicle, vehicle_id=vehicle_id)

        vehicle.vehicle_name = request.data.get("vehicle_name", vehicle.vehicle_name)
        vehicle.vehicle_type = request.data.get("vehicle_type", vehicle.vehicle_type)
        vehicle.description = request.data.get("description", vehicle.description)
        vehicle.price_fare = request.data.get("price_fare", vehicle.price_fare)
        vehicle.fare_unit = request.data.get("fare_unit", vehicle.fare_unit)
        vehicle.seating_capacity = request.data.get("seating_capacity", vehicle.seating_capacity)
        vehicle.availability_status = request.data.get("availability_status", vehicle.availability_status)
        vehicle.save()

        new_images = request.FILES.getlist("vehicle_images")
        if not new_images:
            new_images = request.FILES.getlist("images")

        for img in new_images:
            VehicleImage.objects.create(vehicle=vehicle, image=img)

        vehicle.refresh_from_db()
        return Response({"message": "Vehicle updated successfully.", "vehicle": VehicleSerializer(vehicle).data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["DELETE", "POST"])
def delete_vehicle(request, vehicle_id):
    try:
        vehicle = get_object_or_404(Vehicle, vehicle_id=vehicle_id)
        vehicle.delete()
        return Response({"message": "Vehicle deleted successfully."}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def add_activity_item(request):
    try:
        activity_id = request.data.get("activity_id")
        if not activity_id:
            return Response({"error": "Activity Center ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        activity = get_object_or_404(Activity, activity_id=activity_id)

        item = ActivityItem.objects.create(
            activity=activity,
            activity_title=request.data.get("activity_title", ""),
            category=request.data.get("category", ""),
            description=request.data.get("description", ""),
            price=request.data.get("price", 0),
            duration=request.data.get("duration", ""),
            available_times=request.data.get("available_times", ""),
            capacity=request.data.get("capacity", 1),
            instructions=request.data.get("instructions", "")
        )

        item_images = request.FILES.getlist("activity_item_images")
        if not item_images:
            item_images = request.FILES.getlist("images")

        for img in item_images:
            ActivityItemImage.objects.create(activity_item=item, image=img)

        item.refresh_from_db()
        return Response({"message": "Activity item added successfully.", "item": ActivityItemSerializer(item).data}, status=status.HTTP_201_CREATED)
    except Exception as e:
        print("ERROR ADDING ACTIVITY ITEM:", str(e))
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST", "PUT"])
@parser_classes([MultiPartParser, FormParser])
def edit_activity_item(request, item_id):
    try:
        item = get_object_or_404(ActivityItem, item_id=item_id)

        item.activity_title = request.data.get("activity_title", item.activity_title)
        item.category = request.data.get("category", item.category)
        item.description = request.data.get("description", item.description)
        item.price = request.data.get("price", item.price)
        item.duration = request.data.get("duration", item.duration)
        item.available_times = request.data.get("available_times", item.available_times)
        item.capacity = request.data.get("capacity", item.capacity)
        item.instructions = request.data.get("instructions", item.instructions)
        item.save()

        new_images = request.FILES.getlist("activity_item_images")
        if not new_images:
            new_images = request.FILES.getlist("images")

        for img in new_images:
            ActivityItemImage.objects.create(activity_item=item, image=img)

        item.refresh_from_db()
        return Response({"message": "Activity item updated successfully.", "item": ActivityItemSerializer(item).data}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["DELETE", "POST"])
def delete_activity_item(request, item_id):
    try:
        item = get_object_or_404(ActivityItem, item_id=item_id)
        item.delete()
        return Response({"message": "Activity item deleted successfully."}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["DELETE", "POST"])
def delete_hotel(request, hotel_id):
    try:
        hotel = get_object_or_404(Hotel, hotel_id=hotel_id)
        hotel.delete()
        return Response({"message": "Hotel deleted successfully."}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["DELETE", "POST"])
def delete_restaurant(request, restaurant_id):
    try:
        restaurant = get_object_or_404(Restaurant, restaurant_id=restaurant_id)
        restaurant.delete()
        return Response({"message": "Restaurant deleted successfully."}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["DELETE", "POST"])
def delete_transportation(request, transportation_id):
    try:
        transportation = get_object_or_404(Transportation, transportation_id=transportation_id)
        transportation.delete()
        return Response({"message": "Transportation service deleted successfully."}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["DELETE", "POST"])
def delete_activity(request, activity_id):
    try:
        activity = get_object_or_404(Activity, activity_id=activity_id)
        activity.delete()
        return Response({"message": "Activity deleted successfully."}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET", "PUT"])
def provider_profile(request, user_id):
    try:
        user = User.objects.get(user_id=user_id, role="service_provider")
    except User.DoesNotExist:
        return Response({"error": "Service provider not found."}, status=status.HTTP_404_NOT_FOUND)

    try:
        provider = ServiceProvider.objects.select_related(
            "hotel", "restaurant", "transportation", "activity"
        ).get(user=user)
    except ServiceProvider.DoesNotExist:
        return Response({"error": "Service provider details not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        phone = provider.phone or ""
        if not phone:
            if hasattr(provider, "hotel") and provider.hotel:
                phone = provider.hotel.contact_number or ""
            elif hasattr(provider, "restaurant") and provider.restaurant:
                phone = provider.restaurant.contact_number or ""
            elif hasattr(provider, "transportation") and provider.transportation:
                phone = provider.transportation.contact_number or ""
            elif hasattr(provider, "activity") and provider.activity:
                phone = provider.activity.contact_number or ""

        address = provider.address or ""
        district = provider.district or ""
        location = provider.location or ""
        if hasattr(provider, "hotel") and provider.hotel:
            address = address or provider.hotel.address or ""
            district = district or provider.hotel.district or ""
            location = location or provider.hotel.location or ""
        elif hasattr(provider, "restaurant") and provider.restaurant:
            address = address or provider.restaurant.address or ""
            district = district or provider.restaurant.district or ""
            location = location or provider.restaurant.location or ""
        elif hasattr(provider, "transportation") and provider.transportation:
            district = district or provider.transportation.district or ""
            location = location or provider.transportation.starting_location or ""
        elif hasattr(provider, "activity") and provider.activity:
            district = district or provider.activity.district or ""
            location = location or provider.activity.location or ""

        data = {
            "user_id": user.user_id,
            "full_name": user.full_name,
            "email": user.email,
            "phone": phone,
            "role": user.role,
            "status": user.status,
            "service_type": provider.service_type,
            "business_name": provider.business_name,
            "license_number": provider.license_number,
            "address": address,
            "district": district,
            "location": location,
            "created_at": provider.created_at,
        }
        return Response(data, status=status.HTTP_200_OK)

    elif request.method == "PUT":
        data = request.data
        full_name = data.get("full_name")
        email = data.get("email")
        phone = data.get("phone")
        business_name = data.get("business_name")
        license_number = data.get("license_number")

        if email and email != user.email:
            if User.objects.filter(email=email).exclude(user_id=user.user_id).exists():
                return Response({"error": "Email is already taken by another account."}, status=status.HTTP_400_BAD_REQUEST)
            user.email = email
            provider.email = email

        if full_name:
            user.full_name = full_name
        user.save()

        if phone is not None:
            provider.phone = phone
        if business_name:
            provider.business_name = business_name
        if license_number:
            provider.license_number = license_number
        provider.save()

        return Response({
            "message": "Profile updated successfully.",
            "user_id": user.user_id,
            "provider_id": provider.provider_id,
            "full_name": user.full_name,
            "email": user.email,
            "phone": provider.phone or "",
            "role": user.role,
            "status": user.status,
            "service_type": provider.service_type,
            "business_name": provider.business_name,
            "license_number": provider.license_number,
        }, status=status.HTTP_200_OK)


@api_view(["POST"])
def change_password(request, user_id):
    try:
        user = User.objects.get(user_id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    current_password = request.data.get("current_password")
    new_password = request.data.get("new_password")

    if not current_password or not new_password:
        return Response({"error": "Both current and new passwords are required."}, status=status.HTTP_400_BAD_REQUEST)

    if user.password != current_password:
        return Response({"error": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

    user.password = new_password
    user.save()
    return Response({"message": "Password changed successfully."}, status=status.HTTP_200_OK)


@api_view(["GET"])
def admin_stats(request):
    try:
        tourists_count = User.objects.filter(role="tourist").count()
        providers_count = ServiceProvider.objects.count()
        destinations_count = Destination.objects.count()
        pending_requests_count = ServiceProviderRequest.objects.filter(approval_status="Pending").count()

        return Response({
            "tourists_count": tourists_count,
            "providers_count": providers_count,
            "destinations_count": destinations_count,
            "pending_requests_count": pending_requests_count
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =========================================================================
# TRIP CART & UNIFIED BOOKING VIEWS
# =========================================================================

@api_view(["POST"])
def add_to_trip_cart(request):
    try:
        user_id = request.data.get("user_id")
        provider_id = request.data.get("provider_id")
        room_id = request.data.get("room_id")
        vehicle_id = request.data.get("vehicle_id")
        activity_item_id = request.data.get("activity_item_id")
        destination_id = request.data.get("destination_id")
        replace_existing = request.data.get("replace", False)
        booking_details = request.data.get("booking_details", {})

        if not user_id:
            return Response({"error": "User ID is required. Please login."}, status=status.HTTP_401_UNAUTHORIZED)
        if not provider_id:
            return Response({"error": "Provider ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(user_id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User account not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            provider = ServiceProvider.objects.select_related(
                "destination", "hotel", "restaurant", "transportation", "activity"
            ).get(provider_id=provider_id)
        except ServiceProvider.DoesNotExist:
            return Response({"error": "Service provider not found."}, status=status.HTTP_404_NOT_FOUND)

        # Get or create active trip cart for user
        cart, _ = TripCart.objects.get_or_create(user=user)

        # Update cart destination if empty or specified
        if destination_id:
            try:
                dest = Destination.objects.get(destination_id=destination_id)
                cart.destination = dest
                cart.save()
            except Destination.DoesNotExist:
                pass
        elif provider.destination and not cart.destination:
            cart.destination = provider.destination
            cart.save()

        # Check if this exact provider is already in the cart
        existing_item = TripCartItem.objects.filter(cart=cart, provider=provider).first()
        if existing_item:
            return Response({
                "message": f"'{provider.business_name}' is already in your Trip Cart.",
                "already_in_cart": True,
                "cart_item": TripCartItemSerializer(existing_item).data,
                "cart_count": cart.items.count()
            }, status=status.HTTP_200_OK)

        # Rule: Only 1 Hotel normally allowed per trip
        if provider.service_type == "Hotel":
            existing_hotel = TripCartItem.objects.filter(cart=cart, service_type="Hotel").first()
            if existing_hotel:
                if replace_existing:
                    existing_hotel.delete()
                else:
                    return Response({
                        "error": f"You already have a hotel ({existing_hotel.provider.business_name}) in your trip. Remove it or replace it.",
                        "has_existing_category": True,
                        "existing_provider_name": existing_hotel.provider.business_name,
                        "service_type": "Hotel"
                    }, status=status.HTTP_409_CONFLICT)

        # Rule: Only 1 Transportation service normally allowed per trip
        if provider.service_type == "Transportation":
            existing_transport = TripCartItem.objects.filter(cart=cart, service_type="Transportation").first()
            if existing_transport:
                if replace_existing:
                    existing_transport.delete()
                else:
                    return Response({
                        "error": f"You already have a transportation service ({existing_transport.provider.business_name}) in your trip. Remove it or replace it.",
                        "has_existing_category": True,
                        "existing_provider_name": existing_transport.provider.business_name,
                        "service_type": "Transportation"
                    }, status=status.HTTP_409_CONFLICT)

        # Sub-item links
        room_obj = None
        if room_id:
            try:
                room_obj = Room.objects.get(room_id=room_id)
            except Room.DoesNotExist:
                pass

        vehicle_obj = None
        if vehicle_id:
            try:
                vehicle_obj = Vehicle.objects.get(vehicle_id=vehicle_id)
            except Vehicle.DoesNotExist:
                pass

        activity_item_obj = None
        if activity_item_id:
            try:
                activity_item_obj = ActivityItem.objects.get(item_id=activity_item_id)
            except ActivityItem.DoesNotExist:
                pass

        new_item = TripCartItem.objects.create(
            cart=cart,
            provider=provider,
            service_type=provider.service_type,
            room=room_obj,
            vehicle=vehicle_obj,
            activity_item=activity_item_obj,
            booking_details=booking_details if isinstance(booking_details, dict) else {}
        )

        return Response({
            "message": f"'{provider.business_name}' added to your Trip Cart!",
            "item": TripCartItemSerializer(new_item).data,
            "cart_count": cart.items.count()
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        print("ERROR IN ADD TO TRIP CART:", str(e))
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def get_trip_cart(request, user_id):
    try:
        try:
            user = User.objects.get(user_id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        cart, _ = TripCart.objects.get_or_create(user=user)

        # Prefetch relations to make sure all service details, rooms, vehicles, items, facilities, images are present
        cart_data = TripCart.objects.prefetch_related(
            "items__provider__hotel__images",
            "items__provider__hotel__facilities",
            "items__provider__hotel__rooms__images",
            "items__provider__restaurant__images",
            "items__provider__restaurant__facilities",
            "items__provider__transportation__images",
            "items__provider__transportation__vehicles__images",
            "items__provider__activity__images",
            "items__provider__activity__items__images",
            "items__room",
            "items__vehicle",
            "items__activity_item"
        ).get(cart_id=cart.cart_id)

        serializer = TripCartSerializer(cart_data)
        return Response({
            "cart": serializer.data,
            "item_count": cart_data.items.count()
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print("ERROR FETCHING TRIP CART:", str(e))
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["DELETE", "POST"])
def remove_trip_cart_item(request, cart_item_id):
    try:
        try:
            item = TripCartItem.objects.get(cart_item_id=cart_item_id)
        except TripCartItem.DoesNotExist:
            return Response({"error": "Cart item not found."}, status=status.HTTP_404_NOT_FOUND)

        cart = item.cart
        item.delete()
        return Response({
            "message": "Service removed from trip cart.",
            "cart_count": cart.items.count()
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST", "DELETE"])
def clear_trip_cart(request, user_id):
    try:
        carts = TripCart.objects.filter(user_id=user_id)
        for cart in carts:
            cart.items.all().delete()
        return Response({"message": "Trip Cart cleared successfully."}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST", "PUT"])
def update_trip_cart_item_details(request, cart_item_id):
    try:
        try:
            item = TripCartItem.objects.get(cart_item_id=cart_item_id)
        except TripCartItem.DoesNotExist:
            return Response({"error": "Cart item not found."}, status=status.HTTP_404_NOT_FOUND)

        booking_details = request.data.get("booking_details")
        if booking_details is not None:
            item.booking_details = booking_details

        room_id = request.data.get("room_id")
        if room_id is not None:
            if room_id:
                try:
                    item.room = Room.objects.get(room_id=room_id)
                except Room.DoesNotExist:
                    pass
            else:
                item.room = None

        vehicle_id = request.data.get("vehicle_id")
        if vehicle_id is not None:
            if vehicle_id:
                try:
                    item.vehicle = Vehicle.objects.get(vehicle_id=vehicle_id)
                except Vehicle.DoesNotExist:
                    pass
            else:
                item.vehicle = None

        activity_item_id = request.data.get("activity_item_id")
        if activity_item_id is not None:
            if activity_item_id:
                try:
                    item.activity_item = ActivityItem.objects.get(item_id=activity_item_id)
                except ActivityItem.DoesNotExist:
                    pass
            else:
                item.activity_item = None

        item.save()
        return Response({
            "message": "Cart item details updated.",
            "item": TripCartItemSerializer(item).data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
def create_booking(request):
    """
    Creates ONE parent Booking record and multiple child BookingItem records.
    Validates service availability and calculations.
    """
    try:
        user_id = request.data.get("user_id")
        destination_id = request.data.get("destination_id")
        start_date = request.data.get("start_date")
        end_date = request.data.get("end_date")
        items_data = request.data.get("items", [])

        if not user_id:
            return Response({"error": "User ID is required."}, status=status.HTTP_401_UNAUTHORIZED)
        if not items_data or len(items_data) == 0:
            return Response({"error": "At least one service must be selected to book."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(user_id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        dest_obj = None
        if destination_id:
            try:
                dest_obj = Destination.objects.get(destination_id=destination_id)
            except Destination.DoesNotExist:
                pass

        total_booking_amount = 0
        validated_items = []

        from datetime import datetime

        for item_info in items_data:
            provider_id = item_info.get("provider_id")
            service_type = item_info.get("service_type")

            try:
                provider = ServiceProvider.objects.select_related(
                    "destination", "hotel", "restaurant", "transportation", "activity"
                ).get(provider_id=provider_id)
            except ServiceProvider.DoesNotExist:
                return Response({"error": f"Provider #{provider_id} not found."}, status=status.HTTP_400_BAD_REQUEST)

            if not dest_obj and provider.destination:
                dest_obj = provider.destination

            service_id = None
            item_name = provider.business_name
            item_amount = 0
            details = item_info.get("details", {})

            # Service-Specific Validations & Calculations
            if service_type == "Hotel" and hasattr(provider, "hotel"):
                hotel = provider.hotel
                service_id = hotel.hotel_id
                room_id = item_info.get("room_id") or details.get("room_id")
                check_in = item_info.get("check_in") or details.get("check_in")
                check_out = item_info.get("check_out") or details.get("check_out")
                rooms_count = int(item_info.get("rooms_count") or details.get("rooms_count") or 1)
                guests_count = int(item_info.get("guests_count") or details.get("guests_count") or 1)

                if not check_in or not check_out:
                    return Response({"error": f"Check-in and Check-out dates are required for {hotel.hotel_name}."}, status=status.HTTP_400_BAD_REQUEST)

                try:
                    d_in = datetime.strptime(str(check_in).strip(), "%Y-%m-%d").date()
                    d_out = datetime.strptime(str(check_out).strip(), "%Y-%m-%d").date()
                    nights = (d_out - d_in).days
                    if nights <= 0:
                        return Response({"error": f"Check-out date must be after Check-in date for {hotel.hotel_name}."}, status=status.HTTP_400_BAD_REQUEST)
                except ValueError:
                    nights = 1

                if room_id:
                    try:
                        room = Room.objects.get(room_id=room_id, hotel=hotel)
                        item_name = f"{hotel.hotel_name} - {room.room_name}"
                        item_amount = float(room.price_per_night) * nights * rooms_count
                        details["room_name"] = room.room_name
                        details["price_per_night"] = float(room.price_per_night)
                    except Room.DoesNotExist:
                        item_name = hotel.hotel_name
                        item_amount = float(item_info.get("amount", 0))
                else:
                    item_name = hotel.hotel_name
                    item_amount = float(item_info.get("amount", 0))

                details["check_in"] = str(check_in)
                details["check_out"] = str(check_out)
                details["nights"] = nights
                details["rooms_count"] = rooms_count
                details["guests_count"] = guests_count

            elif service_type == "Transportation" and hasattr(provider, "transportation"):
                transportation = provider.transportation
                service_id = transportation.transportation_id
                vehicle_id = item_info.get("vehicle_id") or details.get("vehicle_id")
                journey_date = item_info.get("journey_date") or details.get("journey_date")
                return_date = item_info.get("return_date") or details.get("return_date")
                pickup_location = item_info.get("pickup_location") or details.get("pickup_location", "")
                drop_location = item_info.get("drop_location") or details.get("drop_location", "")
                passengers_count = int(item_info.get("passengers_count") or details.get("passengers_count") or 1)

                days = 1
                if journey_date and return_date:
                    try:
                        d_start = datetime.strptime(str(journey_date).strip(), "%Y-%m-%d").date()
                        d_end = datetime.strptime(str(return_date).strip(), "%Y-%m-%d").date()
                        days = max(1, (d_end - d_start).days)
                    except ValueError:
                        days = 1

                if vehicle_id:
                    try:
                        vehicle = Vehicle.objects.get(vehicle_id=vehicle_id, transportation=transportation)
                        item_name = f"{transportation.service_name} - {vehicle.vehicle_name}"
                        item_amount = float(vehicle.price_fare) * days
                        details["vehicle_name"] = vehicle.vehicle_name
                        details["fare_unit"] = vehicle.fare_unit
                        details["price_fare"] = float(vehicle.price_fare)
                    except Vehicle.DoesNotExist:
                        item_name = transportation.service_name
                        item_amount = float(transportation.price_fare) * days
                else:
                    item_name = transportation.service_name
                    item_amount = float(transportation.price_fare) * days

                details["journey_date"] = str(journey_date) if journey_date else ""
                details["return_date"] = str(return_date) if return_date else ""
                details["pickup_location"] = pickup_location
                details["drop_location"] = drop_location
                details["passengers_count"] = passengers_count
                details["days"] = days

            elif service_type == "Activity" and hasattr(provider, "activity"):
                activity = provider.activity
                service_id = activity.activity_id
                activity_item_id = item_info.get("activity_item_id") or details.get("activity_item_id")
                activity_date = item_info.get("activity_date") or details.get("activity_date")
                time_slot = item_info.get("time_slot") or details.get("time_slot", "")
                participants_count = int(item_info.get("participants_count") or details.get("participants_count") or 1)

                if activity_item_id:
                    try:
                        act_item = ActivityItem.objects.get(item_id=activity_item_id, activity=activity)
                        item_name = f"{activity.activity_name} - {act_item.activity_title}"
                        item_amount = float(act_item.price) * participants_count
                        details["activity_title"] = act_item.activity_title
                        details["price_per_person"] = float(act_item.price)
                    except ActivityItem.DoesNotExist:
                        item_name = activity.activity_name
                        item_amount = float(activity.price) * participants_count
                else:
                    item_name = activity.activity_name
                    item_amount = float(activity.price) * participants_count

                details["activity_date"] = str(activity_date) if activity_date else ""
                details["time_slot"] = time_slot
                details["participants_count"] = participants_count

            elif service_type == "Restaurant" and hasattr(provider, "restaurant"):
                restaurant = provider.restaurant
                service_id = restaurant.restaurant_id
                item_name = restaurant.restaurant_name
                reservation_date = item_info.get("reservation_date") or details.get("reservation_date")
                reservation_time = item_info.get("reservation_time") or details.get("reservation_time")
                guests_count = int(item_info.get("guests_count") or details.get("guests_count") or 2)
                item_amount = float(item_info.get("amount", 0))

                details["reservation_date"] = str(reservation_date) if reservation_date else ""
                details["reservation_time"] = str(reservation_time) if reservation_time else ""
                details["guests_count"] = guests_count

            else:
                item_name = provider.business_name
                item_amount = float(item_info.get("amount", 0))

            total_booking_amount += item_amount
            validated_items.append({
                "provider": provider,
                "service_type": service_type,
                "service_id": service_id,
                "item_name": item_name,
                "amount": item_amount,
                "details": details
            })

        # Atomic Transaction to Create ONE Booking and Multiple BookingItems
        with transaction.atomic():
            booking = Booking.objects.create(
                user=user,
                destination=dest_obj,
                start_date=start_date if start_date else None,
                end_date=end_date if end_date else None,
                total_amount=total_booking_amount,
                booking_status="Confirmed",
                payment_status="Pending"
            )

            for vi in validated_items:
                BookingItem.objects.create(
                    booking=booking,
                    provider=vi["provider"],
                    service_type=vi["service_type"],
                    service_id=vi["service_id"],
                    item_name=vi["item_name"],
                    details=vi["details"],
                    amount=vi["amount"],
                    status="Confirmed"
                )

            # Clear User's Trip Cart
            TripCart.objects.filter(user=user).delete()

        # Return the created Booking
        booking_data = Booking.objects.prefetch_related(
            "items__provider", "destination"
        ).get(booking_id=booking.booking_id)

        return Response({
            "message": "Trip booked successfully! Your unified booking has been created.",
            "booking_id": booking.booking_id,
            "booking": BookingSerializer(booking_data).data
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        print("ERROR IN CREATE BOOKING:", str(e))
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def get_user_bookings(request, user_id):
    try:
        try:
            user = User.objects.get(user_id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        bookings = Booking.objects.filter(user=user).select_related(
            "destination", "user"
        ).prefetch_related(
            "items__provider__hotel",
            "items__provider__restaurant",
            "items__provider__transportation",
            "items__provider__activity"
        ).order_by("-booking_id")

        serializer = BookingSerializer(bookings, many=True)
        return Response({
            "bookings": serializer.data,
            "count": bookings.count()
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print("ERROR FETCHING USER BOOKINGS:", str(e))
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def get_booking_details(request, booking_id):
    try:
        try:
            booking = Booking.objects.select_related(
                "destination", "user"
            ).prefetch_related(
                "items__provider__hotel",
                "items__provider__restaurant",
                "items__provider__transportation",
                "items__provider__activity"
            ).get(booking_id=booking_id)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = BookingSerializer(booking)
        return Response({
            "booking": serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def get_provider_bookings(request, provider_id):
    """
    Returns all booking items assigned to a specific ServiceProvider.
    Enables Hotel owners to view room bookings, Transportation owners to view vehicle bookings,
    Activity owners to view package bookings, and Restaurant owners to view table reservations.
    """
    try:
        try:
            provider = ServiceProvider.objects.get(provider_id=provider_id)
        except ServiceProvider.DoesNotExist:
            return Response({"error": "Service Provider not found."}, status=status.HTTP_404_NOT_FOUND)

        booking_items = BookingItem.objects.filter(provider=provider).select_related(
            "booking", "booking__user", "booking__destination"
        ).order_by("-booking_item_id")

        items_data = []
        for item in booking_items:
            booking = item.booking
            user = booking.user if booking else None

            phone = ""
            if user:
                try:
                    if hasattr(user, 'tourist_profile'):
                        phone = user.tourist_profile.phone or ""
                except Exception:
                    phone = ""

            items_data.append({
                "booking_item_id": item.booking_item_id,
                "booking_id": booking.booking_id if booking else None,
                "service_type": item.service_type,
                "service_id": item.service_id,
                "item_name": item.item_name or (provider.business_name if provider else ""),
                "details": item.details or {},
                "amount": float(item.amount or 0),
                "status": item.status,
                "created_at": item.created_at,
                "tourist": {
                    "user_id": user.user_id if user else None,
                    "name": user.full_name if user else "Tourist",
                    "email": user.email if user else "",
                    "phone": phone
                },
                "destination": {
                    "destination_id": booking.destination.destination_id if booking and booking.destination else None,
                    "name": booking.destination.name if booking and booking.destination else "Kerala"
                } if booking and booking.destination else None,
                "booking_overall_status": booking.booking_status if booking else "Confirmed",
                "payment_status": booking.payment_status if booking else "Pending"
            })

        return Response({
            "provider_id": provider.provider_id,
            "business_name": provider.business_name,
            "service_type": provider.service_type,
            "bookings": items_data,
            "total_count": len(items_data),
            "total_revenue": sum(i["amount"] for i in items_data)
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print("ERROR FETCHING PROVIDER BOOKINGS:", str(e))
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
def update_booking_item_status(request, booking_item_id):
    """
    Allows service providers to update the status of their booking item
    (e.g., Confirmed, Completed, Cancelled).
    """
    try:
        try:
            item = BookingItem.objects.get(booking_item_id=booking_item_id)
        except BookingItem.DoesNotExist:
            return Response({"error": "Booking item not found."}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get("status")
        if not new_status:
            return Response({"error": "Status is required."}, status=status.HTTP_400_BAD_REQUEST)

        item.status = new_status
        item.save()

        return Response({
            "message": f"Booking item status updated to {new_status}.",
            "booking_item_id": item.booking_item_id,
            "status": item.status
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)






