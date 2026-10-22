import os
import re
import json
import math
import urllib.request
import urllib.error
from datetime import datetime, timedelta
from decimal import Decimal
from django.conf import settings
from .models import (
    Destination,
    ServiceProvider,
    Hotel,
    Room,
    HotelImage,
    Transportation,
    Vehicle,
    TransportationImage,
    Activity,
    ActivityItem,
    ActivityImage,
    Restaurant,
    RestaurantImage,
    HiddenSpot,
)

# Suggested daily food & dining allowance per person in Kerala (in INR)
ESTIMATED_DAILY_MEAL_PER_PERSON = 600.00


def get_available_destination_services(destination_id):
    """
    Retrieves all verified database services belonging to the specified destination.
    Returns:
        dict: destination details, hotels with rooms, transport with vehicles,
              activities with items, and restaurants.
    """
    try:
        dest = Destination.objects.get(destination_id=destination_id, status="Active")
    except Destination.DoesNotExist:
        return None

    # 1. Hotels & Rooms
    hotel_qs = Hotel.objects.filter(
        provider__destination=dest
    ).select_related("provider").prefetch_related("rooms__images", "images", "facilities")

    hotels_data = []
    for h in hotel_qs:
        rooms_list = []
        for r in h.rooms.all():
            room_imgs = [img.image.url if hasattr(img.image, "url") else f"/media/{img.image}" for img in r.images.all()]
            rooms_list.append({
                "room_id": r.room_id,
                "room_name": r.room_name,
                "description": r.description or "",
                "price_per_night": float(r.price_per_night or 0),
                "total_rooms": r.total_rooms,
                "maximum_guests": r.maximum_guests,
                "images": room_imgs,
            })
        
        if rooms_list:
            h_imgs = [img.image.url if hasattr(img.image, "url") else f"/media/{img.image}" for img in h.images.all()]
            facilities = [f.facility_name for f in h.facilities.all()]
            hotels_data.append({
                "hotel_id": h.hotel_id,
                "provider_id": h.provider.provider_id,
                "hotel_name": h.hotel_name,
                "address": h.address or "",
                "location": h.location or "",
                "district": h.district or "",
                "contact_number": h.contact_number or "",
                "email": h.email or "",
                "check_in_time": str(h.check_in_time) if h.check_in_time else "12:00 PM",
                "check_out_time": str(h.check_out_time) if h.check_out_time else "11:00 AM",
                "facilities": facilities,
                "images": h_imgs,
                "rooms": rooms_list,
            })

    # 2. Transportation & Vehicles
    transport_qs = Transportation.objects.filter(
        provider__destination=dest
    ).select_related("provider").prefetch_related("vehicles__images", "images")

    transport_data = []
    for t in transport_qs:
        vehicles_list = []
        for v in t.vehicles.all():
            v_imgs = [img.image.url if hasattr(img.image, "url") else f"/media/{img.image}" for img in v.images.all()]
            vehicles_list.append({
                "vehicle_id": v.vehicle_id,
                "vehicle_name": v.vehicle_name,
                "vehicle_type": v.vehicle_type,
                "description": v.description or "",
                "price_fare": float(v.price_fare or 0),
                "fare_unit": v.fare_unit or "/ day",
                "seating_capacity": v.seating_capacity,
                "availability_status": v.availability_status,
                "images": v_imgs,
            })
        
        if vehicles_list:
            t_imgs = [img.image.url if hasattr(img.image, "url") else f"/media/{img.image}" for img in t.images.all()]
            transport_data.append({
                "transportation_id": t.transportation_id,
                "provider_id": t.provider.provider_id,
                "service_name": t.service_name,
                "service_area": t.service_area or "",
                "contact_number": t.contact_number or "",
                "email": t.email or "",
                "images": t_imgs,
                "vehicles": vehicles_list,
            })

    # 3. Activities & Items
    activity_qs = Activity.objects.filter(
        provider__destination=dest
    ).select_related("provider").prefetch_related("items__images", "images")

    activities_data = []
    for a in activity_qs:
        items_list = []
        for item in a.items.all():
            item_imgs = [img.image.url if hasattr(img.image, "url") else f"/media/{img.image}" for img in item.images.all()]
            items_list.append({
                "item_id": item.item_id,
                "activity_title": item.activity_title,
                "category": item.category or "Sightseeing & Leisure",
                "description": item.description or "",
                "price": float(item.price or 0),
                "duration": item.duration or "2 Hours",
                "available_times": item.available_times or "Morning / Afternoon",
                "capacity": item.capacity,
                "instructions": item.instructions or "",
                "images": item_imgs,
            })

        if items_list:
            a_imgs = [img.image.url if hasattr(img.image, "url") else f"/media/{img.image}" for img in a.images.all()]
            activities_data.append({
                "activity_id": a.activity_id,
                "provider_id": a.provider.provider_id,
                "activity_name": a.activity_name,
                "location": a.location or "",
                "district": a.district or "",
                "contact_number": a.contact_number or "",
                "email": a.email or "",
                "images": a_imgs,
                "items": items_list,
            })

    # 4. Restaurants (for dining suggestions)
    restaurant_qs = Restaurant.objects.filter(
        provider__destination=dest
    ).select_related("provider").prefetch_related("images")

    restaurants_data = []
    for r in restaurant_qs:
        r_imgs = [img.image.url if hasattr(img.image, "url") else f"/media/{img.image}" for img in r.images.all()]
        restaurants_data.append({
            "restaurant_id": r.restaurant_id,
            "provider_id": r.provider.provider_id,
            "restaurant_name": r.restaurant_name,
            "cuisine_type": r.cuisine_type or "Kerala, South Indian",
            "location": r.location or "",
            "description": r.description or "",
            "opening_time": str(r.opening_time) if r.opening_time else "8:00 AM",
            "closing_time": str(r.closing_time) if r.closing_time else "10:00 PM",
            "images": r_imgs,
        })

    # 5. Hidden Spots (for sightseeing)
    hidden_spots = list(HiddenSpot.objects.filter(status="Approved", location__icontains=dest.name).values(
        "spot_id", "name", "description", "location"
    )[:4])

    dest_image = dest.image.url if hasattr(dest.image, "url") and dest.image else f"/media/{dest.image}" if dest.image else ""

    return {
        "destination": {
            "destination_id": dest.destination_id,
            "name": dest.name,
            "district": dest.district,
            "category": dest.category,
            "description": dest.description or "",
            "location": dest.location or "",
            "area": dest.area or "",
            "image": dest_image,
        },
        "hotels": hotels_data,
        "transportation": transport_data,
        "activities": activities_data,
        "restaurants": restaurants_data,
        "hidden_spots": hidden_spots,
    }


def call_ai_planner(preferences, catalog):
    """
    Optionally calls an AI Provider API (Gemini or OpenAI) if an API key is configured.
    Returns:
        tuple: (dict or None, str or None) -> (parsed_itinerary_data, engine_name)
    """
    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    if not gemini_key and not openai_key:
        return None, None

    dest_info = catalog["destination"]
    days = preferences["days"]
    style = preferences["travel_style"]
    budget = preferences["budget"]
    travellers = preferences["travellers"]

    # Build concise service catalog for AI prompt
    simplified_hotels = []
    for h in catalog["hotels"]:
        for r in h["rooms"]:
            simplified_hotels.append({
                "hotel_id": h["hotel_id"],
                "hotel_name": h["hotel_name"],
                "room_id": r["room_id"],
                "room_name": r["room_name"],
                "price_per_night": r["price_per_night"],
                "max_guests": r["maximum_guests"]
            })

    simplified_vehicles = []
    for t in catalog["transportation"]:
        for v in t["vehicles"]:
            simplified_vehicles.append({
                "transportation_id": t["transportation_id"],
                "service_name": t["service_name"],
                "vehicle_id": v["vehicle_id"],
                "vehicle_name": v["vehicle_name"],
                "vehicle_type": v["vehicle_type"],
                "price_fare": v["price_fare"],
                "seating_capacity": v["seating_capacity"]
            })

    simplified_activities = []
    for a in catalog["activities"]:
        for item in a["items"]:
            simplified_activities.append({
                "activity_id": a["activity_id"],
                "item_id": item["item_id"],
                "title": item["activity_title"],
                "category": item["category"],
                "price": item["price"],
                "duration": item["duration"],
                "available_times": item["available_times"]
            })

    prompt_data = {
        "task": "Create a personalized, day-by-day travel itinerary using ONLY the provided real database services.",
        "constraints": {
            "destination": dest_info["name"],
            "days": days,
            "travel_style": style,
            "budget_inr": budget,
            "travellers": travellers,
            "rules": [
                "You MUST select room_id from available_rooms only.",
                "You MUST select vehicle_id from available_vehicles only.",
                "You MUST select activity item_ids from available_activities only.",
                "DO NOT invent new IDs or prices.",
                "Organize days into practical morning, afternoon, and evening slots.",
                "Avoid scheduling the same activity multiple times."
            ]
        },
        "available_rooms": simplified_hotels,
        "available_vehicles": simplified_vehicles,
        "available_activities": simplified_activities,
        "restaurants": [r["restaurant_name"] for r in catalog["restaurants"][:4]],
        "hidden_spots": [s["name"] for s in catalog["hidden_spots"][:3]],
    }

    system_instruction = (
        "You are Wandera's AI Travel Planner. Respond ONLY in valid JSON format with keys: "
        "trip_title, trip_overview, selected_room_id, selected_vehicle_id, daily_plans (array of objects with day_number, day_theme, morning, afternoon, evening), travel_tips (array of strings)."
    )

    # 1. Try Gemini if configured
    if gemini_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": f"{system_instruction}\n\nInput:\n{json.dumps(prompt_data)}"}
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.2,
                    "responseMimeType": "application/json"
                }
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=12) as response:
                res_body = json.loads(response.read().decode("utf-8"))
                text = res_body["candidates"][0]["content"]["parts"][0]["text"]
                clean_json = re.sub(r"^```json\s*", "", text.strip())
                clean_json = re.sub(r"\s*```$", "", clean_json)
                return json.loads(clean_json), "Gemini 1.5 Flash AI"
        except Exception as e:
            print("Gemini API call failed, falling back to smart engine:", str(e))

    # 2. Try OpenAI if configured
    if openai_key:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": json.dumps(prompt_data)}
                ],
                "temperature": 0.2,
                "response_format": {"type": "json_object"}
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {openai_key}"
                }
            )
            with urllib.request.urlopen(req, timeout=12) as response:
                res_body = json.loads(response.read().decode("utf-8"))
                content = res_body["choices"][0]["message"]["content"]
                return json.loads(content), "OpenAI GPT-4o-mini"
        except Exception as e:
            print("OpenAI API call failed, falling back to smart engine:", str(e))

    return None, None


def generate_itinerary_recommendation(
    destination_id,
    days=3,
    budget=25000.0,
    travel_style="Family",
    travellers=2,
    start_date=None
):
    """
    Main recommendation service that retrieves real MySQL services, calculates validated
    costs, runs AI generation or the deterministic smart engine, and returns a comprehensive,
    production-ready itinerary with per-day breakdowns.
    """
    # 1. Retrieve all verified database services
    catalog = get_available_destination_services(destination_id)
    if not catalog:
        return {
            "success": False,
            "error": "The selected destination was not found or is currently inactive. Please choose another destination."
        }

    dest = catalog["destination"]
    hotels = catalog["hotels"]
    transport_list = catalog["transportation"]
    activities_list = catalog["activities"]
    restaurants = catalog["restaurants"]
    hidden_spots = catalog["hidden_spots"]

    # Check if destination has minimal services
    if not hotels and not activities_list and not transport_list:
        return {
            "success": False,
            "error": f"No active services (hotels, transport, or activities) are currently available in {dest['name']}. Please explore other Kerala destinations like Munnar, Wayanad, or Varkala."
        }

    # Normalize parameters
    try:
        days = max(1, min(14, int(days)))
    except (ValueError, TypeError):
        days = 3

    try:
        budget = max(1000.0, float(budget))
    except (ValueError, TypeError):
        budget = 25000.0

    try:
        travellers = max(1, min(20, int(travellers)))
    except (ValueError, TypeError):
        travellers = 2

    travel_style = str(travel_style).strip().capitalize()
    if travel_style not in ["Family", "Solo", "Couple", "Friends"]:
        travel_style = "Couple" if travellers == 2 else "Family" if travellers > 2 else "Solo"

    # Travel dates calculation
    start_dt = None
    if start_date:
        try:
            start_dt = datetime.strptime(str(start_date).strip(), "%Y-%m-%d")
        except ValueError:
            pass
    if not start_dt:
        start_dt = datetime.now() + timedelta(days=7) # Default: 1 week from today

    nights = max(1, days - 1)

    # 2. Select optimal hotel & room from real database records
    selected_hotel = None
    selected_room = None

    # Collect all available rooms
    all_rooms = []
    for h in hotels:
        for r in h["rooms"]:
            all_rooms.append((h, r))

    if all_rooms:
        # Sort rooms by fit for travel style and budget
        def room_sort_key(item):
            h, r = item
            cap = r["maximum_guests"]
            price = r["price_per_night"]
            rooms_needed = math.ceil(travellers / cap)
            total_room_cost = price * nights * rooms_needed
            # Penalty for being over budget or having insufficient capacity
            over_budget_penalty = 100000 if total_room_cost > (budget * 0.6) else 0
            return (over_budget_penalty, total_room_cost)

        all_rooms.sort(key=room_sort_key)
        selected_hotel, selected_room = all_rooms[0]

    # 3. Select optimal vehicle from real database records
    selected_transport = None
    selected_vehicle = None

    all_vehicles = []
    for t in transport_list:
        for v in t["vehicles"]:
            all_vehicles.append((t, v))

    if all_vehicles:
        # Filter for seating capacity first
        fitting_vehicles = [item for item in all_vehicles if item[1]["seating_capacity"] >= travellers]
        candidates = fitting_vehicles if fitting_vehicles else all_vehicles

        def vehicle_sort_key(item):
            t, v = item
            total_v_cost = v["price_fare"] * days
            over_budget = 100000 if total_v_cost > (budget * 0.4) else 0
            return (over_budget, total_v_cost)

        candidates.sort(key=vehicle_sort_key)
        selected_transport, selected_vehicle = candidates[0]

    # 4. Flatten all real activity items
    all_activity_items = []
    for a in activities_list:
        for item in a["items"]:
            all_activity_items.append((a, item))

    # 5. Try calling AI Provider API if configured
    preferences = {
        "days": days,
        "budget": budget,
        "travel_style": travel_style,
        "travellers": travellers,
    }
    ai_result, engine_name = call_ai_planner(preferences, catalog)

    # Validate AI selections against database IDs
    if ai_result:
        ai_room_id = ai_result.get("selected_room_id")
        if ai_room_id:
            for h, r in all_rooms:
                if r["room_id"] == ai_room_id:
                    selected_hotel, selected_room = h, r
                    break

        ai_vehicle_id = ai_result.get("selected_vehicle_id")
        if ai_vehicle_id:
            for t, v in all_vehicles:
                if v["vehicle_id"] == ai_vehicle_id:
                    selected_transport, selected_vehicle = t, v
                    break

    engine_label = engine_name if ai_result else "Wandera Smart Recommendation Engine"

    # 6. Build the Day-by-Day schedule
    rooms_required = math.ceil(travellers / selected_room["maximum_guests"]) if selected_room else 1
    room_price_per_night = selected_room["price_per_night"] if selected_room else 0.0
    total_hotel_cost = round(room_price_per_night * nights * rooms_required, 2)
    daily_room_cost = round(room_price_per_night * rooms_required, 2)

    vehicle_daily_fare = selected_vehicle["price_fare"] if selected_vehicle else 0.0
    total_transport_cost = round(vehicle_daily_fare * days, 2)
    daily_vehicle_cost = round(vehicle_daily_fare, 2)

    daily_meals_estimate = round(ESTIMATED_DAILY_MEAL_PER_PERSON * travellers, 2)
    total_meals_estimate = round(daily_meals_estimate * days, 2)

    daily_itinerary = []
    scheduled_items_tracker = set()
    total_activity_cost = 0.0

    # Pacing and style theme mappings
    style_themes = {
        "Family": [
            "Scenic Welcome & Relaxed Exploration",
            "Nature Wonders & Family Sightseeing",
            "Cultural Experience & Lakeside Serenity",
            "Adventure Trails & Memory Making",
            "Wildlife Encounters & Scenic Retreat",
            "Heritage Discovery & Local Flavors",
            "Souvenir Shopping & Peaceful Departure",
        ],
        "Couple": [
            "Romantic Arrival & Sunset Vistas",
            "Enchanting Tea Garden Trails & Lake Cruise",
            "Misty Mountain Viewpoints & Candlelight Dining",
            "Waterfalls & Private Nature Exploration",
            "Spice Plantations & Serene Escapes",
            "Spa, Leisure & Tranquil Walks",
            "Final Sunrise & Cherished Memories",
        ],
        "Solo": [
            "Arrival, Orientation & Photography Walk",
            "High-Altitude Trekking & Hidden Trails",
            "Local Culture, Art & Community Discovery",
            "Wild Escapes & Deep Nature Immersion",
            "Off-Beat Pathways & Scenic Overlooks",
            "Cafes, Journaling & Sunset Reflections",
            "Departure with Unforgettable Stories",
        ],
        "Friends": [
            "Road Trip Arrival & Action-Packed Welcome",
            "High-Energy Trekking & Group Adventures",
            "Water Sports, Boating & Outdoor Excitement",
            "Campfire Evenings & Viewpoint Expeditions",
            "Wildlife Safari & Plantation Exploration",
            "Local Street Delicacies & Group Challenges",
            "Final Group Moments & Journey Home",
        ]
    }

    themes = style_themes.get(travel_style, style_themes["Couple"])

    # Build days sequentially
    for day_num in range(1, days + 1):
        day_date = start_dt + timedelta(days=day_num - 1)
        day_date_str = day_date.strftime("%d %b %Y, %A")
        theme_index = (day_num - 1) % len(themes)
        day_theme = themes[theme_index]

        # Allocate activities for this day (Morning & Afternoon)
        day_activities = []
        day_activity_cost = 0.0

        # Pick 1 or 2 distinct activity items
        available_for_day = [item for item in all_activity_items if item[1]["item_id"] not in scheduled_items_tracker]
        if not available_for_day:
            available_for_day = all_activity_items # Reuse if all exhausted

        # Morning slot
        morning_slot = None
        afternoon_slot = None
        evening_slot = None

        if day_num == 1:
            # Day 1 Morning: Arrival, Check-in & Orientation
            hotel_name = selected_hotel["hotel_name"] if selected_hotel else "your comfortable accommodation"
            morning_slot = {
                "time_slot": "09:30 AM – 12:30 PM",
                "title": f"Arrival in {dest['name']} & Check-in",
                "description": (
                    f"Arrive in {dest['name']} via your private {selected_vehicle['vehicle_name'] if selected_vehicle else 'transport'}. "
                    f"Check in to {hotel_name}, settle in, and refresh after your journey. "
                    f"Enjoy complimentary morning tea or fresh coconut water while taking in panoramic views of {dest['district']}."
                ),
                "service_type": "Hotel",
                "service_name": selected_hotel["hotel_name"] if selected_hotel else None,
                "service_id": selected_hotel["hotel_id"] if selected_hotel else None,
                "images": selected_hotel["images"][:1] if selected_hotel else [],
            }
        else:
            # Day 2+ Morning: Outdoor Activity / Sightseeing
            if available_for_day:
                act_obj, act_item = available_for_day.pop(0)
                scheduled_items_tracker.add(act_item["item_id"])
                item_cost = round(act_item["price"] * travellers, 2)
                day_activity_cost += item_cost
                day_activities.append({
                    "item_id": act_item["item_id"],
                    "title": act_item["activity_title"],
                    "price_per_person": act_item["price"],
                    "total_price": item_cost,
                    "duration": act_item["duration"],
                    "provider_name": act_obj["activity_name"]
                })
                morning_slot = {
                    "time_slot": act_item["available_times"] or "08:30 AM – 12:00 PM",
                    "title": act_item["activity_title"],
                    "description": act_item["description"] or f"Engage in {act_item['activity_title']} with experienced guides in {dest['name']}.",
                    "service_type": "Activity",
                    "service_name": act_obj["activity_name"],
                    "service_id": act_item["item_id"],
                    "price": act_item["price"],
                    "instructions": act_item["instructions"],
                    "images": act_item["images"][:1] or act_obj["images"][:1],
                }
            else:
                morning_slot = {
                    "time_slot": "08:30 AM – 12:00 PM",
                    "title": f"Scenic Exploration of {dest['name']}",
                    "description": f"Morning self-guided scenic walk across lush hills and natural viewpoints in {dest['name']}.",
                    "service_type": "Sightseeing",
                    "images": [dest["image"]] if dest["image"] else [],
                }

        # Afternoon slot
        if available_for_day and (day_num == 1 or len(all_activity_items) >= days * 1.5):
            act_obj, act_item = available_for_day.pop(0)
            scheduled_items_tracker.add(act_item["item_id"])
            item_cost = round(act_item["price"] * travellers, 2)
            day_activity_cost += item_cost
            day_activities.append({
                "item_id": act_item["item_id"],
                "title": act_item["activity_title"],
                "price_per_person": act_item["price"],
                "total_price": item_cost,
                "duration": act_item["duration"],
                "provider_name": act_obj["activity_name"]
            })
            afternoon_slot = {
                "time_slot": "01:30 PM – 04:30 PM",
                "title": act_item["activity_title"],
                "description": act_item["description"] or f"Afternoon adventure: {act_item['activity_title']} in {dest['name']}.",
                "service_type": "Activity",
                "service_name": act_obj["activity_name"],
                "service_id": act_item["item_id"],
                "price": act_item["price"],
                "instructions": act_item["instructions"],
                "images": act_item["images"][:1] or act_obj["images"][:1],
            }
        else:
            # Highlight local destination landmark or restaurant
            rest = restaurants[(day_num - 1) % len(restaurants)] if restaurants else None
            spot = hidden_spots[(day_num - 1) % len(hidden_spots)] if hidden_spots else None
            
            spot_title = spot["name"] if spot else f"Sightseeing at {dest['location'] or dest['name']}"
            rest_note = f" Savor authentic Kerala lunch at {rest['restaurant_name']} ({rest['cuisine_type']})." if rest else ""
            
            afternoon_slot = {
                "time_slot": "01:00 PM – 04:30 PM",
                "title": spot_title,
                "description": (spot["description"] if spot and spot.get("description") else f"Explore renowned local attractions and scenic viewpoints across {dest['name']}.") + rest_note,
                "service_type": "Sightseeing & Dining",
                "service_name": rest["restaurant_name"] if rest else None,
                "images": rest["images"][:1] if rest and rest["images"] else ([dest["image"]] if dest["image"] else []),
            }

        # Evening slot
        if day_num == days:
            evening_slot = {
                "time_slot": "05:00 PM – 07:30 PM",
                "title": "Souvenir Shopping & Journey Farewell",
                "description": (
                    f"Spend your last evening picking up authentic Kerala spices, homemade chocolates, and handmade crafts. "
                    f"Depart with unforgettable memories of {dest['name']} in your {selected_vehicle['vehicle_name'] if selected_vehicle else 'vehicle'}."
                ),
                "service_type": "Leisure",
                "images": [dest["image"]] if dest["image"] else [],
            }
        else:
            rest = restaurants[day_num % len(restaurants)] if restaurants else None
            dining_text = f" Followed by traditional dinner at {rest['restaurant_name']}." if rest else " Enjoy a delightful dinner at your resort."
            evening_slot = {
                "time_slot": "05:30 PM – 08:30 PM",
                "title": f"Golden Hour Sunset & Evening Leisure",
                "description": f"Relax amidst tranquil surroundings as dusk falls over the Western Ghats.{dining_text}",
                "service_type": "Leisure & Dining",
                "service_name": rest["restaurant_name"] if rest else None,
                "images": rest["images"][:1] if rest and rest["images"] else [],
            }

        # Daily cost total
        # Hotel applies for nights 1..N (on final day night cost is 0 if departing)
        day_hotel_cost = daily_room_cost if day_num <= nights else 0.0
        day_total = round(day_hotel_cost + daily_vehicle_cost + day_activity_cost + daily_meals_estimate, 2)
        total_activity_cost += day_activity_cost

        daily_itinerary.append({
            "day_number": day_num,
            "date": day_date.strftime("%Y-%m-%d"),
            "display_date": day_date_str,
            "theme": day_theme,
            "schedule": {
                "morning": morning_slot,
                "afternoon": afternoon_slot,
                "evening": evening_slot,
            },
            "scheduled_activities": day_activities,
            "expenses": {
                "hotel_cost": day_hotel_cost,
                "transport_cost": daily_vehicle_cost,
                "activity_cost": round(day_activity_cost, 2),
                "meals_estimate": daily_meals_estimate,
                "day_total": day_total,
            }
        })

    # 7. Overall trip financial summary
    total_activity_cost = round(total_activity_cost, 2)
    grand_total_cost = round(total_hotel_cost + total_transport_cost + total_activity_cost + total_meals_estimate, 2)
    per_person_cost = round(grand_total_cost / travellers, 2)
    budget_variance = round(budget - grand_total_cost, 2)
    is_within_budget = grand_total_cost <= budget

    # Travel tips curated for destination and style
    tips = [
        f"Carry valid government photo ID for seamless check-in at {selected_hotel['hotel_name'] if selected_hotel else 'your hotel'}.",
        f"Pack comfortable walking shoes and light woolens for cool {dest['name']} evenings.",
        f"Pre-confirm pick-up timing with {selected_transport['service_name'] if selected_transport else 'your driver'} for early morning departures.",
        "Respect local ecology: avoid single-use plastics and follow guide instructions during treks."
    ]
    if travel_style == "Family":
        tips.append("Child-friendly food and high chairs are readily available at recommended family restaurants.")
    elif travel_style == "Couple":
        tips.append("Request a mountain/lake-facing room at check-in for enhanced romantic ambiance.")

    # 8. Assemble complete response payload
    return {
        "success": True,
        "engine": engine_label,
        "destination": dest,
        "trip_summary": {
            "title": f"{days}-Day {travel_style} Escape to {dest['name']}",
            "destination_name": dest["name"],
            "district": dest["district"],
            "category": dest["category"],
            "duration_days": days,
            "duration_nights": nights,
            "travellers_count": travellers,
            "travel_style": travel_style,
            "total_budget": budget,
            "start_date": start_dt.strftime("%Y-%m-%d"),
            "end_date": (start_dt + timedelta(days=days - 1)).strftime("%Y-%m-%d"),
            "start_date_display": start_dt.strftime("%d %b %Y"),
            "end_date_display": (start_dt + timedelta(days=days - 1)).strftime("%d %b %Y"),
        },
        "selected_services": {
            "hotel": {
                "provider_id": selected_hotel["provider_id"] if selected_hotel else None,
                "hotel_id": selected_hotel["hotel_id"] if selected_hotel else None,
                "hotel_name": selected_hotel["hotel_name"] if selected_hotel else "Not required",
                "room_id": selected_room["room_id"] if selected_room else None,
                "room_name": selected_room["room_name"] if selected_room else "Standard Room",
                "price_per_night": room_price_per_night,
                "rooms_required": rooms_required,
                "nights": nights,
                "total_cost": total_hotel_cost,
                "check_in_time": selected_hotel["check_in_time"] if selected_hotel else "12:00 PM",
                "check_out_time": selected_hotel["check_out_time"] if selected_hotel else "11:00 AM",
                "images": selected_room["images"] if selected_room and selected_room["images"] else (selected_hotel["images"] if selected_hotel else []),
                "facilities": selected_hotel["facilities"] if selected_hotel else [],
            } if selected_hotel else None,
            "transportation": {
                "provider_id": selected_transport["provider_id"] if selected_transport else None,
                "transportation_id": selected_transport["transportation_id"] if selected_transport else None,
                "service_name": selected_transport["service_name"] if selected_transport else "Self Transport",
                "vehicle_id": selected_vehicle["vehicle_id"] if selected_vehicle else None,
                "vehicle_name": selected_vehicle["vehicle_name"] if selected_vehicle else "Local Transit",
                "vehicle_type": selected_vehicle["vehicle_type"] if selected_vehicle else "Vehicle",
                "price_fare": vehicle_daily_fare,
                "fare_unit": selected_vehicle["fare_unit"] if selected_vehicle else "/ day",
                "seating_capacity": selected_vehicle["seating_capacity"] if selected_vehicle else travellers,
                "days": days,
                "total_cost": total_transport_cost,
                "images": selected_vehicle["images"] if selected_vehicle and selected_vehicle["images"] else (selected_transport["images"] if selected_transport else []),
            } if selected_transport else None,
            "activities": [
                {
                    "item_id": act[1]["item_id"],
                    "activity_title": act[1]["activity_title"],
                    "category": act[1]["category"],
                    "price_per_person": act[1]["price"],
                    "duration": act[1]["duration"],
                    "provider_name": act[0]["activity_name"],
                    "images": act[1]["images"] or act[0]["images"],
                }
                for act in all_activity_items if act[1]["item_id"] in scheduled_items_tracker
            ],
        },
        "financial_breakdown": {
            "total_trip_cost": grand_total_cost,
            "per_person_cost": per_person_cost,
            "user_budget": budget,
            "is_within_budget": is_within_budget,
            "remaining_budget": round(max(0.0, budget_variance), 2),
            "budget_excess": round(max(0.0, -budget_variance), 2),
            "budget_difference": budget_variance,
            "budget_status": "Within Budget" if is_within_budget else "Exceeds Budget",
            "travellers_count": travellers,
            "duration_days": days,
            "duration_nights": nights,
            "categories": {
                "accommodation": {
                    "total": total_hotel_cost,
                    "label": f"{rooms_required} room{'s' if rooms_required > 1 else ''} × {nights} night{'s' if nights > 1 else ''} @ ₹{room_price_per_night:,.2f}/night",
                    "percentage": round((total_hotel_cost / grand_total_cost * 100), 1) if grand_total_cost > 0 else 0
                },
                "transportation": {
                    "total": total_transport_cost,
                    "label": f"Dedicated vehicle × {days} day{'s' if days > 1 else ''} @ ₹{vehicle_daily_fare:,.2f}/day",
                    "percentage": round((total_transport_cost / grand_total_cost * 100), 1) if grand_total_cost > 0 else 0
                },
                "activities": {
                    "total": total_activity_cost,
                    "label": f"{len(scheduled_items_tracker)} planned experiences for {travellers} traveller{'s' if travellers > 1 else ''}",
                    "percentage": round((total_activity_cost / grand_total_cost * 100), 1) if grand_total_cost > 0 else 0
                },
                "meals_and_incidentals": {
                    "total": total_meals_estimate,
                    "label": f"Estimated meals @ ₹{ESTIMATED_DAILY_MEAL_PER_PERSON:.0f}/person/day",
                    "is_estimate": True,
                    "percentage": round((total_meals_estimate / grand_total_cost * 100), 1) if grand_total_cost > 0 else 0
                }
            }
        },
        "daily_itinerary": daily_itinerary,
        "travel_tips": tips,
    }
