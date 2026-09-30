from decimal import Decimal
from django.core.management.base import BaseCommand
from django.db import transaction
from tourism.models import Destination

DESTINATIONS_DATA = [
    {
        "name": "Munnar",
        "category": "Hill Station",
        "district": "Idukki",
        "location": "Munnar, Idukki, Kerala",
        "area": "Munnar Hills",
        "latitude": Decimal("10.0889000"),
        "longitude": Decimal("77.0595000"),
        "description": "Munnar is a world-renowned hill station in the Western Ghats of Idukki district, celebrated for its sprawling emerald tea plantations, misty rolling valleys, Anamudi peak, scenic waterfalls like Attukad and Lakkom, cool mountain climate, and popular trekking trails.",
        "image": "Munnar_hillstation_kerala.jpg"
    },
    {
        "name": "Thekkady",
        "category": "Wildlife",
        "district": "Idukki",
        "location": "Kumily, Thekkady, Idukki, Kerala",
        "area": "Periyar Tiger Reserve",
        "latitude": Decimal("9.6031000"),
        "longitude": Decimal("77.1615000"),
        "description": "Located near Kumily in Idukki district, Thekkady is centered around the Periyar National Park and Tiger Reserve, offering famous wildlife boat safaris on Periyar Lake, elephant sightings, spice plantation walks, and bamboo rafting amidst lush evergreen forests.",
        "image": "wildlife.jpg"
    },
    {
        "name": "Wayanad",
        "category": "Hill Station",
        "district": "Wayanad",
        "location": "Kalpetta, Wayanad, Kerala",
        "area": "Wayanad Hills",
        "latitude": Decimal("11.6854000"),
        "longitude": Decimal("76.1320000"),
        "description": "A verdant hill station in the Western Ghats known for mist-covered mountain peaks, ancient Neolithic rock etchings at Edakkal Caves, Chembra Peak heart-shaped lake, Banasura Sagar Dam, and lush spice and coffee plantations.",
        "image": "waynad hill.webp"
    },
    {
        "name": "Varkala",
        "category": "Beach",
        "district": "Thiruvananthapuram",
        "location": "North Cliff, Varkala, Thiruvananthapuram, Kerala",
        "area": "Varkala Cliff",
        "latitude": Decimal("8.7379000"),
        "longitude": Decimal("76.7163000"),
        "description": "A coastal gem famous for its dramatic red laterite cliffs bordering the Arabian Sea, golden Papanasam Beach with natural mineral springs, cliffside cafes, sunset viewpoints, and water sports.",
        "image": "Beach1.jpg"
    },
    {
        "name": "Kovalam",
        "category": "Beach",
        "district": "Thiruvananthapuram",
        "location": "Lighthouse Beach, Kovalam, Thiruvananthapuram, Kerala",
        "area": "Kovalam Lighthouse Beach",
        "latitude": Decimal("8.4004000"),
        "longitude": Decimal("76.9787000"),
        "description": "An internationally acclaimed beach destination featuring three adjacent crescent-shaped beaches, distinguished by the iconic 118-foot red-and-white striped Lighthouse Beach, Ayurvedic rejuvenation therapies, water sports, and sunset views.",
        "image": "Beach2.jpg"
    },
    {
        "name": "Alappuzha",
        "category": "Other",
        "district": "Alappuzha",
        "location": "Punnamada, Alappuzha, Kerala",
        "area": "Alappuzha Backwaters",
        "latitude": Decimal("9.4981000"),
        "longitude": Decimal("76.3388000"),
        "description": "Famously hailed as the 'Venice of the East', Alappuzha is renowned for its vast network of tranquil backwater canals, traditional kettuvallam houseboats, Nehru Trophy Snake Boat Race on Punnamada Lake, and rich coir heritage.",
        "image": "backwater1.jpg"
    },
    {
        "name": "Kumarakom",
        "category": "Other",
        "district": "Kottayam",
        "location": "Kumarakom, Kottayam, Kerala",
        "area": "Vembanad Lake Kumarakom",
        "latitude": Decimal("9.5843000"),
        "longitude": Decimal("76.4300000"),
        "description": "Set along the scenic shores of Vembanad Lake, Kumarakom is a cluster of peaceful islands featuring luxury backwater resorts, Kumarakom Bird Sanctuary trails with migratory birds, and serene canoe cruises.",
        "image": "backwater2.jpg"
    },
    {
        "name": "Fort Kochi",
        "category": "Other",
        "district": "Ernakulam",
        "location": "Fort Kochi, Ernakulam, Kerala",
        "area": "Fort Kochi Heritage Zone",
        "latitude": Decimal("9.9658000"),
        "longitude": Decimal("76.2421000"),
        "description": "A historic coastal enclave celebrated for its cantilevered Chinese fishing nets along the waterfront, colonial Portuguese and Dutch architecture, St. Francis Church, Mattancherry Palace, and vibrant art cafes.",
        "image": ""
    },
    {
        "name": "Athirappilly",
        "category": "Waterfall",
        "district": "Thrissur",
        "location": "Athirappilly, Chalakudy, Thrissur, Kerala",
        "area": "Athirappilly Rainforest",
        "latitude": Decimal("10.2851000"),
        "longitude": Decimal("76.5698000"),
        "description": "Known as the 'Niagara of India', Athirappilly Falls is an 80-foot majestic waterfall cascading on the Chalakudy River, surrounded by the dense tropical rainforests of the Sholayar range and scenic viewpoints.",
        "image": "pambanal.webp"
    },
    {
        "name": "Vagamon",
        "category": "Hill Station",
        "district": "Idukki",
        "location": "Vagamon, Idukki, Kerala",
        "area": "Vagamon Pine Hills",
        "latitude": Decimal("9.6869000"),
        "longitude": Decimal("76.9056000"),
        "description": "A tranquil hill station surrounded by misty pine forests, rolling green meadows at Kurisumala, tea plantations, and cool mountain breezes, perfect for paragliding and serene nature retreats.",
        "image": ""
    },
    {
        "name": "Bekal",
        "category": "Beach",
        "district": "Kasaragod",
        "location": "Bekal Fort Road, Kasaragod, Kerala",
        "area": "Bekal Fort Coastal Area",
        "latitude": Decimal("12.3927000"),
        "longitude": Decimal("75.0315000"),
        "description": "Famous for the historic 300-year-old keyhole-shaped Bekal Fort overlooking the Arabian Sea, pristine beach walkways, observation towers, and scenic coastal backwaters.",
        "image": ""
    },
    {
        "name": "Ponmudi",
        "category": "Hill Station",
        "district": "Thiruvananthapuram",
        "location": "Ponmudi Hills, Thiruvananthapuram, Kerala",
        "area": "Ponmudi Golden Peak",
        "latitude": Decimal("8.7600000"),
        "longitude": Decimal("77.1167000"),
        "description": "An enchanting hill retreat in Thiruvananthapuram with 22 hairpin bends, mist-clad Golden Peak trails, cool climate, tea plantations, and hiking paths near Peppara Wildlife Sanctuary.",
        "image": ""
    },
    {
        "name": "Silent Valley",
        "category": "Wildlife",
        "district": "Palakkad",
        "location": "Mukkali, Silent Valley National Park, Palakkad, Kerala",
        "area": "Silent Valley Rainforest",
        "latitude": Decimal("11.1300000"),
        "longitude": Decimal("76.4500000"),
        "description": "One of India's last undisturbed tracts of South Western Ghats tropical rainforest, home to the endangered lion-tailed macaque, pristine Kunthi River, and rare botanical flora.",
        "image": ""
    },
    {
        "name": "Marari Beach",
        "category": "Beach",
        "district": "Alappuzha",
        "location": "Mararikulam, Alappuzha, Kerala",
        "area": "Marari Beach Coastal Village",
        "latitude": Decimal("9.5997000"),
        "longitude": Decimal("76.2974000"),
        "description": "A peaceful, secluded coastal paradise lined with coconut palms, soft golden sands, eco-resorts, and authentic traditional fishing village charm in Mararikulam.",
        "image": ""
    },
    {
        "name": "Thenmala",
        "category": "Other",
        "district": "Kollam",
        "location": "Thenmala Dam, Kollam, Kerala",
        "area": "Thenmala Eco-Tourism",
        "latitude": Decimal("8.9600000"),
        "longitude": Decimal("77.0600000"),
        "description": "India's first planned eco-tourism destination, offering butterfly safari parks, elevated canopy walkway trails, suspension bridges, dam boating, and musical dancing fountains.",
        "image": ""
    }
]


class Command(BaseCommand):
    help = "Seed database with 15 realistic Kerala tourism destinations automatically without duplicates."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Starting Kerala Tourism destinations seeding..."))

        added_count = 0
        existing_count = 0
        skipped_invalid_count = 0
        total_processed = len(DESTINATIONS_DATA)

        with transaction.atomic():
            for item in DESTINATIONS_DATA:
                name = item["name"].strip()
                if not name:
                    skipped_invalid_count += 1
                    continue

                # Check whether the destination already exists (case-insensitive name check)
                existing = Destination.objects.filter(name__iexact=name).first()

                if existing:
                    existing_count += 1
                    # Ensure category, district, location, area, description, image, and coordinates are updated accurately
                    existing.category = item["category"]
                    existing.district = item["district"]
                    existing.location = item["location"]
                    existing.area = item.get("area", "")
                    existing.description = item["description"]
                    existing.latitude = item.get("latitude")
                    existing.longitude = item.get("longitude")
                    existing.image = item.get("image", "")
                    existing.status = "Active"
                    existing.save()
                    self.stdout.write(f"  [-] Preserved & updated existing destination '{name}' (ID: {existing.destination_id}).")
                else:
                    new_dest = Destination.objects.create(
                        name=name,
                        category=item["category"],
                        district=item["district"],
                        description=item["description"],
                        location=item["location"],
                        area=item.get("area", ""),
                        latitude=item.get("latitude"),
                        longitude=item.get("longitude"),
                        image=item.get("image", ""),
                        status="Active"
                    )
                    added_count += 1
                    self.stdout.write(self.style.SUCCESS(f"  [+] Added '{name}' (Category: {item['category']}, District: {item['district']}, ID: {new_dest.destination_id})."))

        self.stdout.write(self.style.SUCCESS("\n================ SEEDING SUMMARY ================"))
        self.stdout.write(f"Destinations added: {added_count}")
        self.stdout.write(f"Already existed: {existing_count}")
        self.stdout.write(f"Skipped/invalid: {skipped_invalid_count}")
        self.stdout.write(f"Total processed: {total_processed}")
        self.stdout.write(self.style.SUCCESS("=================================================="))
