import os
import shutil
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from tourism.models import (
    Destination, HotelImage, RoomImage, RestaurantImage,
    TransportationImage, VehicleImage, ActivityImage, ActivityItemImage
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MEDIA_IMAGES_DIR = os.path.join(BASE_DIR, "media", "images")
PUBLIC_IMAGES_DIR = os.path.normpath(os.path.join(BASE_DIR, "..", "frontend", "public", "images"))
ARTIFACT_DIR = r"C:\Users\ANJALY V.S\.gemini\antigravity\brain\643a72a7-e847-46e4-bde3-1140d97537ac"

os.makedirs(MEDIA_IMAGES_DIR, exist_ok=True)
os.makedirs(PUBLIC_IMAGES_DIR, exist_ok=True)

image_mapping = {
    "munnar_hillstation_1786984682772.jpg": "munnar.jpg",
    "fort_kochi_beach_1786984719794.jpg": "fort_kochi.jpg",
    "alleppey_backwaters_1786984743846.jpg": "alleppey.jpg",
    "wayanad_nature_1786984765212.jpg": "wayanad.jpg",
    "kovalam_beach_1786985257743.jpg": "kovalam.jpg",
}

# Duplicate copies for specific service categories
service_images = {
    "grand_kerala_hotel.jpg": "fort_kochi_beach_1786984719794.jpg",
    "deluxe_suite.jpg": "munnar_hillstation_1786984682772.jpg",
    "kerala_spice_restaurant.jpg": "fort_kochi_beach_1786984719794.jpg",
    "royal_cabs.jpg": "alleppey_backwaters_1786984743846.jpg",
    "innova_crysta.jpg": "alleppey_backwaters_1786984743846.jpg",
    "wayanad_park.jpg": "wayanad_nature_1786984765212.jpg",
    "zipline_kayak.jpg": "wayanad_nature_1786984765212.jpg",
}

print("--- SAVING ALL IMAGES INTO IMAGES FOLDER ---")

# 1. Save artifact images into media/images/ and public/images/
for src_name, target_name in image_mapping.items():
    src_path = os.path.join(ARTIFACT_DIR, src_name)
    if os.path.exists(src_path):
        shutil.copy(src_path, os.path.join(MEDIA_IMAGES_DIR, target_name))
        shutil.copy(src_path, os.path.join(PUBLIC_IMAGES_DIR, target_name))
        print(f"Saved: {target_name} to media/images/ and public/images/")

for target_name, src_name in service_images.items():
    src_path = os.path.join(ARTIFACT_DIR, src_name)
    if os.path.exists(src_path):
        shutil.copy(src_path, os.path.join(MEDIA_IMAGES_DIR, target_name))
        shutil.copy(src_path, os.path.join(PUBLIC_IMAGES_DIR, target_name))
        print(f"Saved: {target_name} to media/images/ and public/images/")

print("\n--- UPDATING DATABASE MODEL IMAGE PATHS TO IMAGES FOLDER ---")

# Update Destinations
dest_map = {
    "Munnar Tea Gardens & Hills": "images/munnar.jpg",
    "Fort Kochi Heritage & Beach": "images/fort_kochi.jpg",
    "Alleppey Backwaters & Houseboats": "images/alleppey.jpg",
    "Wayanad Wildlife & Waterfalls": "images/wayanad.jpg",
    "Kovalam Lighthouse Beach": "images/kovalam.jpg",
}

for dname, img_rel_path in dest_map.items():
    d = Destination.objects.filter(name=dname).first()
    if d:
        d.image = img_rel_path
        d.save()
        print(f"Updated Destination '{d.name}' -> {img_rel_path}")

# Update Hotel Images
for hi in HotelImage.objects.all():
    hi.image = "images/grand_kerala_hotel.jpg"
    hi.save()
    print(f"Updated HotelImage -> {hi.image}")

# Update Room Images
for ri in RoomImage.objects.all():
    ri.image = "images/deluxe_suite.jpg"
    ri.save()
    print(f"Updated RoomImage -> {ri.image}")

# Update Restaurant Images
for rsi in RestaurantImage.objects.all():
    rsi.image = "images/kerala_spice_restaurant.jpg"
    rsi.save()
    print(f"Updated RestaurantImage -> {rsi.image}")

# Update Transportation Images
for ti in TransportationImage.objects.all():
    ti.image = "images/royal_cabs.jpg"
    ti.save()
    print(f"Updated TransportationImage -> {ti.image}")

# Update Vehicle Images
for vi in VehicleImage.objects.all():
    vi.image = "images/innova_crysta.jpg"
    vi.save()
    print(f"Updated VehicleImage -> {vi.image}")

# Update Activity Images
for ai in ActivityImage.objects.all():
    ai.image = "images/wayanad_park.jpg"
    ai.save()
    print(f"Updated ActivityImage -> {ai.image}")

# Update Activity Item Images
for aii in ActivityItemImage.objects.all():
    aii.image = "images/zipline_kayak.jpg"
    aii.save()
    print(f"Updated ActivityItemImage -> {aii.image}")

print("--- ALL IMAGES SAVED IN IMAGES FOLDER & DATABASE UPDATED SUCCESSFULLY ---")
