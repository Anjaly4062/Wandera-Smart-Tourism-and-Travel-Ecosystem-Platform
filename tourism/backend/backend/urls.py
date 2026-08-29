from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from tourism import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/tourist-register/", views.tourist_register),
    path("api/provider-register/", views.provider_register),
    path("api/login/", views.login),
    path("api/tourist-profile/<int:user_id>/",views.tourist_profile,name="tourist-profile"),
    path("api/provider-requests/", views.provider_requests),
    path("api/provider-request/<int:request_id>/accept/",views.accept_provider_request),
    path("api/provider-request/<int:request_id>/reject/",views.reject_provider_request),
    path("api/destinations/", views.add_destination),
    path("api/destination-list/", views.destination_list),
    path("api/add-hotel/",views.add_hotel,name="add-hotel"),
    path("api/edit-hotel/<int:hotel_id>/",views.edit_hotel,name="edit-hotel"),
    path("api/delete-hotel/<int:hotel_id>/",views.delete_hotel,name="delete-hotel"),

    path("api/delete-restaurant/<int:restaurant_id>/",views.delete_restaurant,name="delete-restaurant"),
    path("api/delete-transportation/<int:transportation_id>/",views.delete_transportation,name="delete-transportation"),
    path("api/delete-activity/<int:activity_id>/",views.delete_activity,name="delete-activity"),
    path("api/add-room/",views.add_room,name="add-room"),
    path("api/edit-room/<int:room_id>/",views.edit_room,name="edit-room"),
    path("api/delete-room/<int:room_id>/",views.delete_room,name="delete-room"),
    path("api/provider-hotel/<int:provider_id>/",views.get_provider_hotel,name="provider-hotel"),
    path("api/provider-info/<int:provider_id>/",views.get_provider_info,name="provider-info"),

    path("api/add-restaurant/",views.add_restaurant,name="add-restaurant"),
    path("api/edit-restaurant/<int:restaurant_id>/",views.edit_restaurant,name="edit-restaurant"),

    path("api/add-transportation/",views.add_transportation,name="add-transportation"),
    path("api/edit-transportation/<int:transportation_id>/",views.edit_transportation,name="edit-transportation"),
    path("api/add-vehicle/",views.add_vehicle,name="add-vehicle"),
    path("api/edit-vehicle/<int:vehicle_id>/",views.edit_vehicle,name="edit-vehicle"),
    path("api/delete-vehicle/<int:vehicle_id>/",views.delete_vehicle,name="delete-vehicle"),

    path("api/add-activity/",views.add_activity,name="add-activity"),
    path("api/edit-activity/<int:activity_id>/",views.edit_activity,name="edit-activity"),
    path("api/add-activity-item/",views.add_activity_item,name="add-activity-item"),
    path("api/edit-activity-item/<int:item_id>/",views.edit_activity_item,name="edit-activity-item"),
    path("api/delete-activity-item/<int:item_id>/",views.delete_activity_item,name="delete-activity-item"),

    path("api/destination-details/<int:destination_id>/",views.destination_details,name="destination-details"),
    path("api/service-details/<int:provider_id>/",views.service_details,name="service-details"),
    path("api/provider-profile/<int:user_id>/",views.provider_profile,name="provider-profile"),
    path("api/change-password/<int:user_id>/",views.change_password,name="change-password"),
    path("api/admin-stats/", views.admin_stats, name="admin-stats"),
    path("api/trip-cart/add/", views.add_to_trip_cart, name="add-to-trip-cart"),
    path("api/trip-cart/<int:user_id>/", views.get_trip_cart, name="get-trip-cart"),
    path("api/trip-cart/item/<int:cart_item_id>/delete/", views.remove_trip_cart_item, name="remove-trip-cart-item"),
    path("api/trip-cart/clear/<int:user_id>/", views.clear_trip_cart, name="clear-trip-cart"),
    path("api/trip-cart/item/<int:cart_item_id>/update/", views.update_trip_cart_item_details, name="update-trip-cart-item"),
    path("api/booking/create/", views.create_booking, name="create-booking"),
    path("api/user-bookings/<int:user_id>/", views.get_user_bookings, name="user-bookings"),
    path("api/booking-details/<int:booking_id>/", views.get_booking_details, name="booking-details"),
    path("api/provider-bookings/<int:provider_id>/", views.get_provider_bookings, name="provider-bookings"),
    path("api/provider-booking-item/<int:booking_item_id>/status/", views.update_booking_item_status, name="update-booking-item-status"),
]

import os
import re
import urllib.parse
from django.http import FileResponse
from django.views.static import serve as django_static_serve

def serve_media(request, path):
    """
    Serves media files directly from the root-level Images folder (settings.MEDIA_ROOT)
    with support for path stripping, whitespace normalization, and Django hash fallback.
    """
    unquoted_path = urllib.parse.unquote(path)
    media_root = str(settings.MEDIA_ROOT)

    # 1. Direct path check
    direct_file = os.path.join(media_root, unquoted_path)
    if os.path.isfile(direct_file):
        return FileResponse(open(direct_file, 'rb'))

    # 2. Check basename (strips prefixes like 'destinations/', 'hotels/', 'rooms/')
    base_name = os.path.basename(unquoted_path)
    base_file = os.path.join(media_root, base_name)
    if os.path.isfile(base_file):
        return FileResponse(open(base_file, 'rb'))

    # 3. Check space vs underscore variations
    alt_name_space = base_name.replace("_", " ")
    alt_file_space = os.path.join(media_root, alt_name_space)
    if os.path.isfile(alt_file_space):
        return FileResponse(open(alt_file_space, 'rb'))

    alt_name_under = base_name.replace(" ", "_")
    alt_file_under = os.path.join(media_root, alt_name_under)
    if os.path.isfile(alt_file_under):
        return FileResponse(open(alt_file_under, 'rb'))

    # 4. Check for Django random hash suffixes (e.g. 'images_qoBc1PQ.jpg' -> 'images.jpg')
    match = re.match(r'^(.*)_[a-zA-Z0-9]{6,10}(\.[a-zA-Z0-9]+)$', base_name)
    if match:
        clean_name = match.group(1) + match.group(2)
        clean_file = os.path.join(media_root, clean_name)
        if os.path.isfile(clean_file):
            return FileResponse(open(clean_file, 'rb'))

    # 5. Case-insensitive lookup in MEDIA_ROOT
    if os.path.isdir(media_root):
        existing_files = os.listdir(media_root)
        for existing in existing_files:
            if existing.lower() in (base_name.lower(), alt_name_space.lower(), alt_name_under.lower()):
                return FileResponse(open(os.path.join(media_root, existing), 'rb'))

    # 6. Fallback to standard Django static serve
    return django_static_serve(request, path, document_root=settings.MEDIA_ROOT)

urlpatterns += [
    path("media/<path:path>", serve_media, name="media-serve"),
    path("images/<path:path>", serve_media, name="images-serve"),
]