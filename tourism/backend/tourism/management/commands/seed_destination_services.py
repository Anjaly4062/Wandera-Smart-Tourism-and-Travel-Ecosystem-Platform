import re
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.db import transaction
from tourism.models import (
    User, ServiceProvider, Destination,
    Hotel, HotelImage, HotelFacility, Room, RoomImage,
    Restaurant, RestaurantImage, RestaurantFacility,
    Transportation, TransportationImage, Vehicle, VehicleImage,
    Activity, ActivityImage, ActivityItem, ActivityItemImage
)

class Command(BaseCommand):
    help = "Ensure every existing destination has at least 2 Hotels, 2 Restaurants, 2 Activities, and 2 Transportation services with complete location & coordinate data."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("=== STARTING DESTINATION SERVICES & LOCATION POPULATION ==="))

        with transaction.atomic():
            # =================================================================
            # STEP 1: FIX MISSING DESTINATION COORDINATES & LOCATION DATA
            # =================================================================
            self.stdout.write("\n[1/3] Checking and fixing destination location data...")
            arthunkal = Destination.objects.filter(name__icontains="Arthunkal").first()
            if arthunkal:
                if not arthunkal.latitude or not arthunkal.longitude:
                    arthunkal.latitude = Decimal("9.6897000")
                    arthunkal.longitude = Decimal("76.2944000")
                    arthunkal.location = "Arthunkal Beach, Cherthala, Alappuzha, Kerala"
                    arthunkal.area = "Arthunkal Beach Coast"
                    arthunkal.description = "A serene golden sand beach in Alappuzha known for the historic St. Andrews Basilica, gentle waves, and authentic coastal fishing village atmosphere."
                    arthunkal.save()
                    self.stdout.write(self.style.SUCCESS(f"  Fixed coordinates & location for Destination '{arthunkal.name}'."))

            # Ensure all other destinations have non-null locations
            for dest in Destination.objects.all():
                if not dest.location:
                    dest.location = f"{dest.name}, {dest.district}, Kerala"
                    dest.save()

            # =================================================================
            # STEP 2: FIX EXISTING PROVIDERS WITH MISSING LOCATION / SERVICES
            # =================================================================
            self.stdout.write("\n[2/3] Updating existing approved providers and completing services...")

            munnar_dest = Destination.objects.filter(name__iexact="Munnar").first()
            thekkady_dest = Destination.objects.filter(name__iexact="Thekkady").first()
            wayanad_dest = Destination.objects.filter(name__iexact="Wayanad").first()
            alappuzha_dest = Destination.objects.filter(name__iexact="Alappuzha").first()
            fortkochi_dest = Destination.objects.filter(name__iexact="Fort Kochi").first()

            # Provider 2: Grand Munnar Palace (Hotel)
            sp2 = ServiceProvider.objects.filter(provider_id=2).first()
            if sp2 and munnar_dest:
                sp2.destination = munnar_dest
                sp2.district = "Idukki"
                sp2.save()

            # Provider 3: Munnar Spice Garden (Restaurant)
            sp3 = ServiceProvider.objects.filter(provider_id=3).first()
            if sp3 and munnar_dest:
                sp3.destination = munnar_dest
                sp3.district = "Idukki"
                sp3.save()

            # Provider 4: Kerala Cabs / Munnar Express (Transportation)
            sp4 = ServiceProvider.objects.filter(provider_id=4).first()
            if sp4 and munnar_dest:
                sp4.destination = munnar_dest
                sp4.district = "Idukki"
                sp4.save()

            # Provider 6: Kerala Trip Connect (Transportation)
            sp6 = ServiceProvider.objects.filter(provider_id=6).first()
            if sp6:
                if fortkochi_dest:
                    sp6.destination = fortkochi_dest
                sp6.district = "Ernakulam"
                sp6.location = "Ernakulam South, Kochi"
                sp6.address = "MG Road, Ernakulam South, Kochi, Kerala"
                sp6.latitude = Decimal("9.9715000")
                sp6.longitude = Decimal("76.2865000")
                sp6.save()

            # Provider 7: Munnar Adventure Trails (Activity)
            sp7 = ServiceProvider.objects.filter(provider_id=7).first()
            if sp7:
                if munnar_dest:
                    sp7.destination = munnar_dest
                sp7.district = "Idukki"
                sp7.location = "Munnar, Idukki"
                sp7.address = "Near Tea Museum, Munnar, Idukki, Kerala"
                sp7.latitude = Decimal("10.0892000")
                sp7.longitude = Decimal("77.0601000")
                sp7.save()

            # Provider 8: Hill View Resort (Hotel in Wayanad)
            sp8 = ServiceProvider.objects.filter(provider_id=8).first()
            if sp8 and wayanad_dest:
                sp8.destination = wayanad_dest
                sp8.district = "Wayanad"
                sp8.save()

            # Provider 9: Pepper Route Restaurant (Restaurant in Thekkady)
            sp9 = ServiceProvider.objects.filter(provider_id=9).first()
            if sp9 and thekkady_dest:
                sp9.destination = thekkady_dest
                sp9.district = "Idukki"
                sp9.save()

            # Provider 10: Green Peak Residency (Hotel)
            sp10 = ServiceProvider.objects.filter(provider_id=10).first()
            if sp10:
                if munnar_dest:
                    sp10.destination = munnar_dest
                sp10.district = "Idukki"
                sp10.location = "Old Munnar Road, Munnar"
                sp10.address = "Old Munnar Road, Munnar, Idukki, Kerala"
                sp10.latitude = Decimal("10.0834000")
                sp10.longitude = Decimal("77.0588000")
                sp10.save()

            # Provider 12: Backwater Breeze Hotel (Hotel in Alappuzha)
            sp12 = ServiceProvider.objects.filter(provider_id=12).first()
            if sp12 and alappuzha_dest:
                sp12.destination = alappuzha_dest
                sp12.district = "Alappuzha"
                sp12.save()

            # Provider 13: Wildlife Nature Walk (Activity in Thekkady)
            sp13 = ServiceProvider.objects.filter(provider_id=13).first()
            if sp13:
                sp13.district = "Idukki"
                sp13.location = "Kumily, Thekkady, Idukki"
                sp13.address = "Periyar Tiger Reserve Gate Road, Kumily, Thekkady, Idukki, Kerala"
                sp13.latitude = Decimal("9.6025000")
                sp13.longitude = Decimal("77.1620000")
                thekkady_dest = Destination.objects.filter(name__iexact="Thekkady").first()
                if thekkady_dest:
                    sp13.destination = thekkady_dest
                sp13.save()

                if not hasattr(sp13, 'activity') or not sp13.activity:
                    act = Activity.objects.create(
                        provider=sp13,
                        activity_name="Wildlife Nature Walk & Tiger Trail",
                        description="Guided eco-trek through Periyar Tiger Reserve with experienced naturalists exploring rich fauna and rare bird species.",
                        district="Idukki",
                        location="Kumily, Thekkady, Idukki",
                        contact_number="9847123456",
                        email=sp13.user.email,
                        price=Decimal("850.00"),
                        duration="3 Hours",
                        available_times="06:30 AM - 10:30 AM",
                        capacity=12,
                        instructions="Follow forest guide instructions. No flash photography."
                    )
                    ActivityItem.objects.create(
                        activity=act,
                        activity_title="Periyar Jungle Nature Walk",
                        category="Wildlife Trek",
                        description="Early morning guided nature trail in Periyar evergreen forests.",
                        price=Decimal("850.00"),
                        duration="3 Hours",
                        available_times="06:30 AM - 09:30 AM",
                        capacity=12
                    )
                    self.stdout.write(self.style.SUCCESS("  Created Activity record for existing provider 'Wildlife Nature Walk'."))

            # Provider 16: Beach Kayaking (Activity in Alappuzha)
            sp16 = ServiceProvider.objects.filter(provider_id=16).first()
            if sp16:
                sp16.district = "Alappuzha"
                sp16.location = "Alappuzha Beach, Alappuzha"
                sp16.address = "Beach Road, Alappuzha, Kerala"
                sp16.latitude = Decimal("9.4920000")
                sp16.longitude = Decimal("76.3210000")
                alappuzha_dest = Destination.objects.filter(name__iexact="Alappuzha").first()
                if alappuzha_dest:
                    sp16.destination = alappuzha_dest
                sp16.save()

                if not hasattr(sp16, 'activity') or not sp16.activity:
                    act = Activity.objects.create(
                        provider=sp16,
                        activity_name="Alappuzha Beach Kayaking & Sea Sports",
                        description="Exciting single and tandem ocean kayaking along the scenic coast of Alappuzha with safety gear and certified instructors.",
                        district="Alappuzha",
                        location="Alappuzha Beach, Alappuzha",
                        contact_number="9847234567",
                        email=sp16.user.email,
                        price=Decimal("600.00"),
                        duration="1.5 Hours",
                        available_times="07:00 AM - 05:30 PM",
                        capacity=8,
                        instructions="Life jackets provided. Suitable for beginners."
                    )
                    ActivityItem.objects.create(
                        activity=act,
                        activity_title="Guided Sea Kayaking Session",
                        category="Water Sports",
                        description="Enjoy ocean kayaking with certified instructors.",
                        price=Decimal("600.00"),
                        duration="1.5 Hours",
                        available_times="07:00 AM, 09:00 AM, 03:30 PM",
                        capacity=8
                    )
                    self.stdout.write(self.style.SUCCESS("  Created Activity record for existing provider 'Beach Kayaking'."))

            # Provider 17: Alappuzha Tourist Transport (Transportation in Alappuzha)
            sp17 = ServiceProvider.objects.filter(provider_id=17).first()
            if sp17:
                sp17.district = "Alappuzha"
                sp17.location = "Punnamada, Alappuzha"
                sp17.address = "Boat Jetty Road, Punnamada, Alappuzha, Kerala"
                sp17.latitude = Decimal("9.4975000")
                sp17.longitude = Decimal("76.3350000")
                alappuzha_dest = Destination.objects.filter(name__iexact="Alappuzha").first()
                if alappuzha_dest:
                    sp17.destination = alappuzha_dest
                sp17.save()

                if not hasattr(sp17, 'transportation') or not sp17.transportation:
                    trans = Transportation.objects.create(
                        provider=sp17,
                        service_name="Alappuzha Tourist Transport & Cabs",
                        vehicle_type="AC Sedan & Innova",
                        description="Reliable private cabs, airport transfers, and customized sightseeing tours across Alappuzha backwaters and beaches.",
                        district="Alappuzha",
                        address="Boat Jetty Road, Punnamada, Alappuzha, Kerala",
                        starting_location="Punnamada, Alappuzha",
                        service_area="Alappuzha, Marari, Kumarakom, Kochi",
                        contact_number="9847345678",
                        email=sp17.user.email,
                        price_fare=Decimal("2200.00"),
                        availability_status="Available"
                    )
                    Vehicle.objects.create(
                        transportation=trans,
                        vehicle_name="Toyota Innova Crysta",
                        vehicle_type="SUV",
                        description="Spacious 7-seater AC SUV for family backwater trips.",
                        price_fare=Decimal("2800.00"),
                        fare_unit="/ day",
                        seating_capacity=7,
                        availability_status="Available"
                    )
                    self.stdout.write(self.style.SUCCESS("  Created Transportation record for existing provider 'Alappuzha Tourist Transport'."))

            # =================================================================
            # STEP 3: ENSURE AT LEAST 2 SERVICES OF EACH TYPE PER DESTINATION
            # =================================================================
            self.stdout.write("\n[3/3] Checking service counts for every destination and populating missing services...")

            DESTINATION_SERVICE_TEMPLATES = {
                "Munnar": {
                    "activities": [
                        {
                            "business_name": "Munnar Tea Valley Trekking Club",
                            "owner_name": "Kiran Kumar",
                            "email_prefix": "act.munnar2",
                            "service_name": "Munnar Tea Valley Trek & Sunrise Camp",
                            "description": "Guided walking trek through scenic tea gardens, rolling mist ridges, and mountain sunrise viewpoints in Munnar.",
                            "price": Decimal("750.00"),
                            "duration": "3 Hours",
                            "hours": "06:00 AM - 11:00 AM",
                            "capacity": 15
                        }
                    ],
                    "transportation": [
                        {
                            "business_name": "Munnar Mountain Jeep Safari & Cabs",
                            "owner_name": "Anand P",
                            "email_prefix": "trans.munnar2",
                            "service_name": "Munnar Mountain Jeep & Tourist Cabs",
                            "vehicle_type": "4x4 Offroad Jeep & Sedan",
                            "vehicle_name": "Mahindra Thar 4x4",
                            "description": "Customized 4x4 offroad jeep safaris to Kolukkumalai peak, Top Station, and scenic tea estates around Munnar.",
                            "fare": Decimal("2500.00"),
                            "capacity": 6
                        }
                    ]
                },
                "Thekkady": {
                    "hotels": [
                        {
                            "business_name": "Thekkady Wild Woods Resort",
                            "owner_name": "Joseph Mathew",
                            "email_prefix": "hotel.thekkady1",
                            "service_name": "Thekkady Wild Woods Eco Resort",
                            "description": "A tranquil nature resort nestled on the periphery of Periyar Tiger Reserve featuring luxury cottages and spice garden balconies.",
                            "room_name": "Forest View Deluxe Cottage",
                            "price": Decimal("3800.00")
                        },
                        {
                            "business_name": "Periyar Heritage Court Hotel",
                            "owner_name": "Gopakumar R",
                            "email_prefix": "hotel.thekkady2",
                            "service_name": "Periyar Heritage Court Hotel",
                            "description": "Comfortable heritage stay in Kumily close to the Periyar boating sanctuary with modern amenities and multi-cuisine restaurant.",
                            "room_name": "Heritage Executive Room",
                            "price": Decimal("2900.00")
                        }
                    ],
                    "restaurants": [
                        {
                            "business_name": "Periyar Bamboo Hut Restaurant",
                            "owner_name": "Suresh Nair",
                            "email_prefix": "rest.thekkady2",
                            "service_name": "Periyar Bamboo Hut & Spice Restaurant",
                            "description": "Authentic Kerala cuisine restaurant serving clay-pot fish curry, Malabar biriyani, and organic farm-fresh spices.",
                            "cuisine": "Kerala Traditional & South Indian",
                            "hours": "07:30 AM - 10:30 PM"
                        }
                    ],
                    "activities": [
                        {
                            "business_name": "Periyar Lake Safari Adventures",
                            "owner_name": "Ramesh V",
                            "email_prefix": "act.thekkady2",
                            "service_name": "Periyar Lake Boat Safari & Bamboo Rafting",
                            "description": "Famous boat cruise on Periyar Lake to spot wild elephants, gaur herds, sambar deer, and rare aquatic birds.",
                            "price": Decimal("900.00"),
                            "duration": "2.5 Hours",
                            "hours": "07:00 AM - 04:30 PM",
                            "capacity": 20
                        }
                    ],
                    "transportation": [
                        {
                            "business_name": "Periyar Tourist Taxi & Safari Fleet",
                            "owner_name": "Pradeep Kumar",
                            "email_prefix": "trans.thekkady2",
                            "service_name": "Periyar Tourist Taxi & Safari Services",
                            "vehicle_type": "AC Tourist Taxi & 4x4 Jeep",
                            "vehicle_name": "Toyota Etios AC",
                            "description": "Professional 24/7 cab transfers and local sightseeing trips connecting Thekkady, Munnar, and Alleppey.",
                            "fare": Decimal("2000.00"),
                            "capacity": 4
                        }
                    ]
                },
                "Wayanad": {
                    "hotels": [
                        {
                            "business_name": "Wayanad Rainforest Retreat",
                            "owner_name": "Mathew Varghese",
                            "email_prefix": "hotel.wayanad1",
                            "service_name": "Wayanad Rainforest Eco Retreat",
                            "description": "Eco-friendly wooden treehouse and cottage resort surrounded by misty coffee plantations and Western Ghats biodiversity.",
                            "room_name": "Plantation View Tree Villa",
                            "price": Decimal("4200.00")
                        },
                        {
                            "business_name": "Vythiri Mist Meadows Resort",
                            "owner_name": "Shaji Thomas",
                            "email_prefix": "hotel.wayanad2",
                            "service_name": "Vythiri Mist Meadows Resort",
                            "description": "Hilltop luxury suites in Vythiri overlooking mist-clad valleys with swimming pool, spa, and guided nature trails.",
                            "room_name": "Misty Valley Deluxe Suite",
                            "price": Decimal("3500.00")
                        }
                    ],
                    "restaurants": [
                        {
                            "business_name": "Wayanad Malabar Spices Diner",
                            "owner_name": "Faisal K",
                            "email_prefix": "rest.wayanad2",
                            "service_name": "Wayanad Malabar Spices Diner",
                            "description": "Renowned for authentic Thalassery dum biriyani, Malabar parotta with beef roast, and spicy seafood platters.",
                            "cuisine": "Malabar & Kerala Traditional",
                            "hours": "08:00 AM - 11:00 PM"
                        }
                    ],
                    "activities": [
                        {
                            "business_name": "Chembra Peak Trekking Adventures",
                            "owner_name": "Biju George",
                            "email_prefix": "act.wayanad1",
                            "service_name": "Wayanad Chembra Peak Heart Lake Trek",
                            "description": "Challenging guided mountain trek to the famous heart-shaped lake (Hridaya Saras) on Chembra Peak.",
                            "price": Decimal("1100.00"),
                            "duration": "4.5 Hours",
                            "hours": "07:00 AM - 02:00 PM",
                            "capacity": 10
                        },
                        {
                            "business_name": "Banasura Kayaking & Zipline Club",
                            "owner_name": "Deepak Raj",
                            "email_prefix": "act.wayanad2",
                            "service_name": "Banasura Dam Kayaking & Zipline Safari",
                            "description": "Thrilling island kayaking and high-speed zipline flying over the vast waters of Banasura Sagar Dam reservoir.",
                            "price": Decimal("800.00"),
                            "duration": "2 Hours",
                            "hours": "09:00 AM - 05:30 PM",
                            "capacity": 15
                        }
                    ],
                    "transportation": [
                        {
                            "business_name": "Wayanad Hills Cabs & Tours",
                            "owner_name": "Nasir P",
                            "email_prefix": "trans.wayanad2",
                            "service_name": "Wayanad Hills Cabs & Sightseeing Travels",
                            "vehicle_type": "AC Sedan & 4WD SUV",
                            "vehicle_name": "Maruti Ertiga AC",
                            "description": "Experienced hill drivers providing safe mountain travel across Wayanad, Calicut Airport, and Bandipur.",
                            "fare": Decimal("2400.00"),
                            "capacity": 6
                        }
                    ]
                },
                "Alappuzha": {
                    "hotels": [
                        {
                            "business_name": "Alleppey Lake Palace Heritage Resort",
                            "owner_name": "Devadasan Nair",
                            "email_prefix": "hotel.alappuzha2",
                            "service_name": "Alleppey Lake Palace Heritage Resort",
                            "description": "Majestic lakefront resort on Punnamada Lake offering private cottage pavilions and luxury houseboat docks.",
                            "room_name": "Lake View Heritage Suite",
                            "price": Decimal("4600.00")
                        }
                    ],
                    "restaurants": [
                        {
                            "business_name": "Punnamada Lakeview Seafood Grill",
                            "owner_name": "Cherian Jacob",
                            "email_prefix": "rest.alappuzha1",
                            "service_name": "Punnamada Lakeview Seafood Grill",
                            "description": "Open-air waterfront dining serving freshly caught pearl spot (Karimeen Pollichathu), tiger prawns, and appam.",
                            "cuisine": "Kerala Seafood & Kuttanad Specialties",
                            "hours": "11:00 AM - 10:30 PM"
                        },
                        {
                            "business_name": "Royal Kettuvallam Spices Dine",
                            "owner_name": "Praveen V",
                            "email_prefix": "rest.alappuzha2",
                            "service_name": "Royal Kettuvallam Spices Dine",
                            "description": "Traditional Kerala vegetarian sadhya and backwater delicacies served on authentic banana leaves.",
                            "cuisine": "Kerala Traditional & Veg Sadhya",
                            "hours": "07:30 AM - 09:30 PM"
                        }
                    ],
                    "activities": [
                        {
                            "business_name": "Alappuzha Houseboat Cruises",
                            "owner_name": "Mani K",
                            "email_prefix": "act.alappuzha2",
                            "service_name": "Alappuzha Houseboat Day Cruise Experience",
                            "description": "Premium day cruise through tranquil palm-fringed canals, Kuttanad paddy fields below sea level, and village waterways.",
                            "price": Decimal("1800.00"),
                            "duration": "5 Hours",
                            "hours": "11:00 AM - 05:00 PM",
                            "capacity": 25
                        }
                    ]
                },
                "Fort Kochi": {
                    "hotels": [
                        {
                            "business_name": "Fort Kochi Heritage Colonial Stay",
                            "owner_name": "Alex Pereira",
                            "email_prefix": "hotel.fortkochi1",
                            "service_name": "Fort Kochi Heritage Colonial Stay",
                            "description": "Restored 19th-century colonial boutique hotel situated walking distance from Vasco da Gama Square and St. Francis Church.",
                            "room_name": "Colonial Heritage Room",
                            "price": Decimal("3900.00")
                        },
                        {
                            "business_name": "Old Harbour View Boutique Hotel",
                            "owner_name": "Paul Fernandez",
                            "email_prefix": "hotel.fortkochi2",
                            "service_name": "Old Harbour View Boutique Hotel",
                            "description": "Charming boutique hotel with Dutch architecture, landscaped courtyard, and sunset sea views in Fort Kochi.",
                            "room_name": "Harbour View Suite",
                            "price": Decimal("4400.00")
                        }
                    ],
                    "restaurants": [
                        {
                            "business_name": "Mattancherry Art Cafe & Seafood",
                            "owner_name": "Sarah Abraham",
                            "email_prefix": "rest.fortkochi1",
                            "service_name": "Mattancherry Art Cafe & Seafood",
                            "description": "Vibrant art cafe offering continental breakfast, artisanal coffees, and freshly grilled ocean catches in Jew Town.",
                            "cuisine": "Continental, Italian & Seafood",
                            "hours": "08:00 AM - 10:30 PM"
                        },
                        {
                            "business_name": "Chinese Fishing Net Deck Dining",
                            "owner_name": "Sebastian Joy",
                            "email_prefix": "rest.fortkochi2",
                            "service_name": "Chinese Fishing Net Deck Dining",
                            "description": "Seaside restaurant where you can select fresh fish from the nets and enjoy it cooked to order in Kerala spice batter.",
                            "cuisine": "Coastal Kerala & Fresh Catch",
                            "hours": "11:30 AM - 11:00 PM"
                        }
                    ],
                    "activities": [
                        {
                            "business_name": "Fort Kochi Tuk-Tuk Heritage Tours",
                            "owner_name": "Antony Cruz",
                            "email_prefix": "act.fortkochi1",
                            "service_name": "Fort Kochi Heritage Walk & Tuk-Tuk Tour",
                            "description": "Guided exploration of Chinese fishing nets, Santa Cruz Basilica, Jew Town spice warehouses, and Paradesi Synagogue.",
                            "price": Decimal("500.00"),
                            "duration": "2.5 Hours",
                            "hours": "09:00 AM - 05:00 PM",
                            "capacity": 4
                        },
                        {
                            "business_name": "Kathakali & Kalaripayattu Cultural Centre",
                            "owner_name": "Rajan Menon",
                            "email_prefix": "act.fortkochi2",
                            "service_name": "Kathakali Culture & Martial Arts Live Show",
                            "description": "Evening classical performance featuring Kathakali makeup demonstrations, mudra storytelling, and dynamic Kalaripayattu martial arts.",
                            "price": Decimal("650.00"),
                            "duration": "2 Hours",
                            "hours": "05:00 PM - 07:30 PM",
                            "capacity": 50
                        }
                    ],
                    "transportation": [
                        {
                            "business_name": "Cochin Port Tourist Cabs & Transfers",
                            "owner_name": "Varghese Xavier",
                            "email_prefix": "trans.fortkochi2",
                            "service_name": "Cochin Port Tourist Cabs & Airport Express",
                            "vehicle_type": "AC Sedan & Urbania Fleet",
                            "vehicle_name": "Force Urbania 12-Seater",
                            "description": "Premium tourist transportation for Cochin Airport, port cruise terminal transfers, and city heritage tours.",
                            "fare": Decimal("2600.00"),
                            "capacity": 12
                        }
                    ]
                },
                "Varkala": {
                    "hotels": [
                        {
                            "business_name": "Varkala Cliff Palms Resort",
                            "owner_name": "Harikrishnan M",
                            "email_prefix": "hotel.varkala1",
                            "service_name": "Varkala Cliff Palms Resort",
                            "description": "Clifftop resort offering panoramic views of the Arabian Sea, private sea-facing balconies, and direct beach steps.",
                            "room_name": "Oceanfront Cliff Villa",
                            "price": Decimal("3600.00")
                        },
                        {
                            "business_name": "Papanasam Sands Beach Stay",
                            "owner_name": "Abhilash S",
                            "email_prefix": "hotel.varkala2",
                            "service_name": "Papanasam Sands Beach Stay",
                            "description": "Peaceful coastal retreat situated right near Papanasam Beach featuring yoga halls and Ayurvedic wellness packages.",
                            "room_name": "Deluxe Beach Cottage",
                            "price": Decimal("2800.00")
                        }
                    ],
                    "restaurants": [
                        {
                            "business_name": "Varkala Cliffside Bay Cafe",
                            "owner_name": "Rohit Pillai",
                            "email_prefix": "rest.varkala1",
                            "service_name": "Varkala Cliffside Bay Cafe",
                            "description": "Scenic cliffside cafe serving woodfired pizzas, smoothie bowls, Israeli shakshuka, and candlelit seafood dinners at sunset.",
                            "cuisine": "Continental, Mediterranean & Seafood",
                            "hours": "07:30 AM - 11:30 PM"
                        },
                        {
                            "business_name": "Arabian Sunset Seafood Diner",
                            "owner_name": "Manaf H",
                            "email_prefix": "rest.varkala2",
                            "service_name": "Arabian Sunset Seafood Diner",
                            "description": "Fresh tandoori lobster, butter garlic prawns, and authentic Kerala fish curry served right by the breaking waves.",
                            "cuisine": "Seafood & Tandoori",
                            "hours": "12:00 PM - 11:00 PM"
                        }
                    ],
                    "activities": [
                        {
                            "business_name": "Varkala Surf & Paragliding School",
                            "owner_name": "Siddharth N",
                            "email_prefix": "act.varkala1",
                            "service_name": "Varkala Cliff Tandem Paragliding & Surfing",
                            "description": "Soar high above the red Varkala cliffs with licensed pilots or learn coastal board surfing with professional instructors.",
                            "price": Decimal("2500.00"),
                            "duration": "1 Hour",
                            "hours": "06:30 AM - 05:30 PM",
                            "capacity": 6
                        },
                        {
                            "business_name": "Papanasam Yoga & Healing Circle",
                            "owner_name": "Ananya Sharma",
                            "email_prefix": "act.varkala2",
                            "service_name": "Papanasam Natural Springs & Sunset Yoga",
                            "description": "Revitalizing Hatha yoga and guided meditation session atop North Cliff followed by a visit to holy mineral springs.",
                            "price": Decimal("500.00"),
                            "duration": "1.5 Hours",
                            "hours": "06:00 AM & 05:00 PM",
                            "capacity": 20
                        }
                    ],
                    "transportation": [
                        {
                            "business_name": "Varkala Coastal Cabs & Travels",
                            "owner_name": "Sajeev B",
                            "email_prefix": "trans.varkala1",
                            "service_name": "Varkala Coastal Cabs & Tourist Taxis",
                            "vehicle_type": "AC Sedan & Hatchback",
                            "vehicle_name": "Maruti Dzire AC",
                            "description": "Round-the-clock taxi service for Trivandrum Airport pickups, Jatayu Earth Center day trips, and local drop-offs.",
                            "fare": Decimal("1800.00"),
                            "capacity": 4
                        },
                        {
                            "business_name": "Varkala Beach Express Travels",
                            "owner_name": "Manoj Kumar",
                            "email_prefix": "trans.varkala2",
                            "service_name": "Varkala Beach Express Travels",
                            "vehicle_type": "AC SUV & Auto Fleet",
                            "vehicle_name": "Toyota Innova AC",
                            "description": "Comfortable family transfers between Varkala, Kollam, Munroe Island, and Kovalam.",
                            "fare": Decimal("2400.00"),
                            "capacity": 7
                        }
                    ]
                },
                "Kovalam": {
                    "hotels": [
                        {
                            "business_name": "Kovalam Lighthouse View Beach Resort",
                            "owner_name": "Vivek Nambiar",
                            "email_prefix": "hotel.kovalam1",
                            "service_name": "Kovalam Lighthouse View Beach Resort",
                            "description": "Iconic beach resort offering direct views of the red-and-white striped Vizhinjam Lighthouse, palm gardens, and infinity pool.",
                            "room_name": "Lighthouse Panorama Room",
                            "price": Decimal("4500.00")
                        },
                        {
                            "business_name": "Soma Palm Beach Wellness Retreat",
                            "owner_name": "Dr. Jayakumar",
                            "email_prefix": "hotel.kovalam2",
                            "service_name": "Soma Palm Beach Wellness Retreat",
                            "description": "Traditional Kerala Ayurvedic healing resort nestled amidst coconut groves with specialized panchakarma treatments.",
                            "room_name": "Ayurveda Heritage Cottage",
                            "price": Decimal("3800.00")
                        }
                    ],
                    "restaurants": [
                        {
                            "business_name": "Kovalam Marina Bay Seafood Restaurant",
                            "owner_name": "Robin V",
                            "email_prefix": "rest.kovalam1",
                            "service_name": "Kovalam Marina Bay Seafood Restaurant",
                            "description": "Seaside dining on Lighthouse Beach featuring live crab, calamari, lemon butter prawns, and chilled fresh juices.",
                            "cuisine": "Continental, Kerala Seafood & Grills",
                            "hours": "08:00 AM - 11:00 PM"
                        },
                        {
                            "business_name": "Lighthouse Terrace Lounge",
                            "owner_name": "Pooja Pillai",
                            "email_prefix": "rest.kovalam2",
                            "service_name": "Lighthouse Terrace Sunset Lounge",
                            "description": "Rooftop lounge overlooking the crescent bay, famous for woodfired pizzas, tropical mocktails, and tandoori grills.",
                            "cuisine": "Multi-Cuisine & Sunset Grills",
                            "hours": "12:00 PM - 11:30 PM"
                        }
                    ],
                    "activities": [
                        {
                            "business_name": "Kovalam Catamaran Sailing & Scuba",
                            "owner_name": "Captain Biju",
                            "email_prefix": "act.kovalam1",
                            "service_name": "Kovalam Catamaran Sailing & Snorkeling",
                            "description": "Traditional wooden catamaran boat sailing through the gentle waves of Hawah Beach and underwater snorkeling with colorful marine life.",
                            "price": Decimal("1200.00"),
                            "duration": "2 Hours",
                            "hours": "07:00 AM - 04:30 PM",
                            "capacity": 8
                        },
                        {
                            "business_name": "Kovalam Ayurvedic Rejuvenation Spa",
                            "owner_name": "Dr. Sreeja K",
                            "email_prefix": "act.kovalam2",
                            "service_name": "Traditional Ayurvedic Abhyanga & Shirodhara",
                            "description": "Therapeutic 90-minute herbal warm-oil body massage and warm medicated oil stream therapy by experienced therapists.",
                            "price": Decimal("1600.00"),
                            "duration": "1.5 Hours",
                            "hours": "08:00 AM - 06:00 PM",
                            "capacity": 6
                        }
                    ],
                    "transportation": [
                        {
                            "business_name": "Kovalam Beachline Cabs & Taxis",
                            "owner_name": "Satheesh G",
                            "email_prefix": "trans.kovalam1",
                            "service_name": "Kovalam Beachline Cabs & Tourist Taxis",
                            "vehicle_type": "AC Sedan & Tourist Cab",
                            "vehicle_name": "Toyota Etios AC",
                            "description": "Prompt airport pickups from Trivandrum International Airport, city sightseeing, and Kanyakumari day tours.",
                            "fare": Decimal("1600.00"),
                            "capacity": 4
                        },
                        {
                            "business_name": "Vizhinjam Coastal Travels",
                            "owner_name": "Chandran M",
                            "email_prefix": "trans.kovalam2",
                            "service_name": "Vizhinjam Coastal Travels & Fleet",
                            "vehicle_type": "AC SUV & Tempo Traveller",
                            "vehicle_name": "Toyota Innova Crysta",
                            "description": "Reliable tourist cabs for Poovar Island backwater boating transfers, Padmanabhaswamy Temple visits, and coastal trips.",
                            "fare": Decimal("2500.00"),
                            "capacity": 7
                        }
                    ]
                },
                "Kumarakom": {
                    "hotels": [
                        {
                            "business_name": "Kumarakom Lakefront Eco Villas",
                            "owner_name": "George Kuruvilla",
                            "email_prefix": "hotel.kumarakom1",
                            "service_name": "Kumarakom Lakefront Eco Villas",
                            "description": "Luxury private villas perched on the edge of Vembanad Lake featuring private plunge pools, fishing decks, and manicured lawns.",
                            "room_name": "Vembanad Lake Villa",
                            "price": Decimal("5200.00")
                        },
                        {
                            "business_name": "Vembanad Bird Sanctuary Resort",
                            "owner_name": "Mathew Chacko",
                            "email_prefix": "hotel.kumarakom2",
                            "service_name": "Vembanad Bird Sanctuary Resort",
                            "description": "Quiet riverside resort adjacent to the Kumarakom Bird Sanctuary with canal canoeing and tranquil sunset sit-outs.",
                            "room_name": "Canal View Cottage",
                            "price": Decimal("3600.00")
                        }
                    ],
                    "restaurants": [
                        {
                            "business_name": "Kumarakom Karimeen & Duck Hut",
                            "owner_name": "Kunjumon K",
                            "email_prefix": "rest.kumarakom1",
                            "service_name": "Kumarakom Karimeen & Duck Hut",
                            "description": "Specialty lakeside restaurant serving traditional Kuttanadan duck roast, spicy karimeen pollichathu, and hot kappa (tapioca).",
                            "cuisine": "Kuttanad & Backwater Traditional",
                            "hours": "11:30 AM - 10:00 PM"
                        },
                        {
                            "business_name": "Backwater Palm Grove Kitchen",
                            "owner_name": "Lissy Mathew",
                            "email_prefix": "rest.kumarakom2",
                            "service_name": "Backwater Palm Grove Kitchen",
                            "description": "Serene dining pavilion by the water offering fresh fish moilee, appam, tender coconut puddings, and filter coffee.",
                            "cuisine": "Kerala Home-Style & Seafood",
                            "hours": "07:30 AM - 09:30 PM"
                        }
                    ],
                    "activities": [
                        {
                            "business_name": "Kumarakom Bird Watching & Canoe Trails",
                            "owner_name": "Vinod Kumar",
                            "email_prefix": "act.kumarakom1",
                            "service_name": "Kumarakom Bird Watching & Canoe Tour",
                            "description": "Early morning silent country-canoe safari through bird sanctuary waterways to spot migratory siberian storks, kingfishers, and herons.",
                            "price": Decimal("800.00"),
                            "duration": "2.5 Hours",
                            "hours": "06:00 AM - 09:30 AM",
                            "capacity": 10
                        },
                        {
                            "business_name": "Vembanad Sunset Motorboat Safari",
                            "owner_name": "Pappan V",
                            "email_prefix": "act.kumarakom2",
                            "service_name": "Vembanad Sunset Motorboat Safari",
                            "description": "Relaxing motorboat cruise across Kerala's largest lake with complimentary snacks and golden horizon sunset photography.",
                            "price": Decimal("1200.00"),
                            "duration": "2 Hours",
                            "hours": "04:30 PM - 06:30 PM",
                            "capacity": 15
                        }
                    ],
                    "transportation": [
                        {
                            "business_name": "Kumarakom Backwater Tourist Transport",
                            "owner_name": "Anoop K",
                            "email_prefix": "trans.kumarakom1",
                            "service_name": "Kumarakom Backwater Tourist Transport",
                            "vehicle_type": "AC Sedan & Tourist Cab",
                            "vehicle_name": "Maruti Dzire AC",
                            "description": "Connecting Kumarakom resorts with Kottayam Railway Station, Cochin Airport, and Alleppey boat jetties.",
                            "fare": Decimal("1900.00"),
                            "capacity": 4
                        },
                        {
                            "business_name": "Kottayam Kumarakom Cabs",
                            "owner_name": "Reji Joseph",
                            "email_prefix": "trans.kumarakom2",
                            "service_name": "Kottayam Kumarakom Cabs & Travels",
                            "vehicle_type": "AC SUV & Van",
                            "vehicle_name": "Toyota Innova AC",
                            "description": "Spacious family vehicles for sightseeing across Kumarakom, Vagamon, Thekkady, and Marari Beach.",
                            "fare": Decimal("2600.00"),
                            "capacity": 7
                        }
                    ]
                },
                "Athirappilly": {
                    "hotels": [
                        {
                            "business_name": "Athirappilly Rainforest Waterfalls Resort",
                            "owner_name": "Kishore Kumar",
                            "email_prefix": "hotel.athirappilly1",
                            "service_name": "Athirappilly Rainforest Waterfalls Resort",
                            "description": "Breathtaking luxury retreat situated directly facing the roaring Athirappilly Falls with private balcony view of the cascades.",
                            "room_name": "Waterfall View Suite",
                            "price": Decimal("4800.00")
                        },
                        {
                            "business_name": "Chalakudy Riverbank Eco Stay",
                            "owner_name": "Vasu Menon",
                            "email_prefix": "hotel.athirappilly2",
                            "service_name": "Chalakudy Riverbank Eco Stay",
                            "description": "Lush riverside boutique cottages on the Chalakudy River surrounded by teak woods, bird songs, and private swimming pool.",
                            "room_name": "River Edge Deluxe Villa",
                            "price": Decimal("3200.00")
                        }
                    ],
                    "restaurants": [
                        {
                            "business_name": "Niagara View Hilltop Restaurant",
                            "owner_name": "Shaji K",
                            "email_prefix": "rest.athirappilly1",
                            "service_name": "Niagara View Hilltop Restaurant",
                            "description": "Panoramic view restaurant serving Kerala spicy chicken roast, beef dry fry, fresh river fish, and hot parottas.",
                            "cuisine": "Kerala Traditional & South Indian",
                            "hours": "08:00 AM - 09:30 PM"
                        },
                        {
                            "business_name": "Jungle Feast & Kerala Kitchen",
                            "owner_name": "Unnikrishnan P",
                            "email_prefix": "rest.athirappilly2",
                            "service_name": "Jungle Feast & Kerala Kitchen",
                            "description": "Wholesome vegetarian sadhya, meals with fried fish, and refreshing tender coconut and lime drinks.",
                            "cuisine": "Traditional Kerala Meals",
                            "hours": "11:00 AM - 07:00 PM"
                        }
                    ],
                    "activities": [
                        {
                            "business_name": "Athirappilly Waterfall Trek & Birding",
                            "owner_name": "Sanjay Nair",
                            "email_prefix": "act.athirappilly1",
                            "service_name": "Athirappilly Waterfall Trek & Birding",
                            "description": "Guided trek down to the bottom basin of the 80-foot waterfall with mist spray and hornbill bird watching.",
                            "price": Decimal("400.00"),
                            "duration": "2 Hours",
                            "hours": "08:00 AM - 05:00 PM",
                            "capacity": 20
                        },
                        {
                            "business_name": "Sholayar Rainforest Safari Club",
                            "owner_name": "Vijayan C",
                            "email_prefix": "act.athirappilly2",
                            "service_name": "Sholayar Rainforest Safari & River Walk",
                            "description": "Scenic off-road jungle drive through Sholayar rainforest to Charpa Falls, Vazhachal cascade, and tribal viewpoints.",
                            "price": Decimal("1400.00"),
                            "duration": "3.5 Hours",
                            "hours": "09:00 AM - 04:00 PM",
                            "capacity": 8
                        }
                    ],
                    "transportation": [
                        {
                            "business_name": "Athirappilly Jungle Cabs & Transfers",
                            "owner_name": "Mani G",
                            "email_prefix": "trans.athirappilly1",
                            "service_name": "Athirappilly Jungle Cabs & Transfers",
                            "vehicle_type": "AC Tourist Sedan & 4x4 Jeep",
                            "vehicle_name": "Toyota Etios AC",
                            "description": "Transfers from Cochin International Airport (Nedumbassery) and Chalakudy Railway Station to Athirappilly and Valparai.",
                            "fare": Decimal("1800.00"),
                            "capacity": 4
                        },
                        {
                            "business_name": "Chalakudy Falls Tourist Taxi",
                            "owner_name": "Devan P",
                            "email_prefix": "trans.athirappilly2",
                            "service_name": "Chalakudy Falls Tourist Taxi Fleet",
                            "vehicle_type": "AC SUV & MUV",
                            "vehicle_name": "Maruti Ertiga AC",
                            "description": "Safe family transport across Athirappilly, Vazhachal, Ezhattumugham, and Dreamworld Theme Park.",
                            "fare": Decimal("2200.00"),
                            "capacity": 6
                        }
                    ]
                },
                "Vagamon": {
                    "hotels": [
                        {
                            "business_name": "Vagamon Pine Forest Eco Valley Resort",
                            "owner_name": "Roy Mathew",
                            "email_prefix": "hotel.vagamon1",
                            "service_name": "Vagamon Pine Forest Eco Valley Resort",
                            "description": "Mist-clad mountain resort situated amidst dense pine forests with glass bridge views, campfire areas, and trekking trails.",
                            "room_name": "Pine View Mountain Chalet",
                            "price": Decimal("3200.00")
                        },
                        {
                            "business_name": "Kurisumala Mist Meadow Cottages",
                            "owner_name": "Joy Varghese",
                            "email_prefix": "hotel.vagamon2",
                            "service_name": "Kurisumala Mist Meadow Cottages",
                            "description": "Cozy hill cottages overlooking the rolling green meadows of Kurisumala Ashram with peaceful nature surroundings.",
                            "room_name": "Meadow Edge Deluxe Cottage",
                            "price": Decimal("2700.00")
                        }
                    ],
                    "restaurants": [
                        {
                            "business_name": "Vagamon Cloud 9 Hillside Diner",
                            "owner_name": "Rajesh T",
                            "email_prefix": "rest.vagamon1",
                            "service_name": "Vagamon Cloud 9 Hillside Diner",
                            "description": "Highrange diner serving hot Kerala appam with stew, chicken biriyani, spicy masala tea, and barbecue grills in the fog.",
                            "cuisine": "Kerala Highrange & Tandoori",
                            "hours": "07:30 AM - 10:00 PM"
                        },
                        {
                            "business_name": "Pine Valley Spice Restro",
                            "owner_name": "Sunny Joseph",
                            "email_prefix": "rest.vagamon2",
                            "service_name": "Pine Valley Spice Restro",
                            "description": "Comfortable family restaurant offering south Indian thalis, Chinese noodles, and hot cardamom-flavored snacks.",
                            "cuisine": "South Indian & Chinese",
                            "hours": "08:00 AM - 09:30 PM"
                        }
                    ],
                    "activities": [
                        {
                            "business_name": "Vagamon Paragliding & Trekking Adventure",
                            "owner_name": "Capt. Rahul",
                            "email_prefix": "act.vagamon1",
                            "service_name": "Vagamon Paragliding & Trekking Adventure",
                            "description": "Tandem paragliding joyride gliding over the lush Vagamon green hills with certified international instructors.",
                            "price": Decimal("3500.00"),
                            "duration": "1 Hour",
                            "hours": "08:00 AM - 05:00 PM",
                            "capacity": 8
                        },
                        {
                            "business_name": "Vagamon Pine Forest Offroad Safari",
                            "owner_name": "Sujith K",
                            "email_prefix": "act.vagamon2",
                            "service_name": "Pine Forest Offroad Jeep Safari & Lake Trek",
                            "description": "Thrilling 4x4 open jeep safari to Marmala Waterfalls, Suicide Point, and peaceful pine valley trails.",
                            "price": Decimal("1500.00"),
                            "duration": "3 Hours",
                            "hours": "08:30 AM - 05:30 PM",
                            "capacity": 6
                        }
                    ],
                    "transportation": [
                        {
                            "business_name": "Vagamon Mountain Cabs & Jeeps",
                            "owner_name": "Jose Thomas",
                            "email_prefix": "trans.vagamon1",
                            "service_name": "Vagamon Mountain Cabs & Jeeps",
                            "vehicle_type": "4WD Jeep & AC Sedan",
                            "vehicle_name": "Mahindra Bolero 4WD",
                            "description": "Experienced mountain drivers specializing in highrange hairpin routes connecting Vagamon, Kottayam, and Erattupetta.",
                            "fare": Decimal("2000.00"),
                            "capacity": 6
                        },
                        {
                            "business_name": "Idukki Highrange Travels",
                            "owner_name": "Manu Sebastian",
                            "email_prefix": "trans.vagamon2",
                            "service_name": "Idukki Highrange Travels & Tours",
                            "vehicle_type": "AC SUV & Tourist Cab",
                            "vehicle_name": "Toyota Innova AC",
                            "description": "Reliable transport service for Vagamon to Munnar and Thekkady inter-hill station tourist trips.",
                            "fare": Decimal("2800.00"),
                            "capacity": 7
                        }
                    ]
                },
                "Bekal": {
                    "hotels": [
                        {
                            "business_name": "Bekal Fort Coastal Sands Resort",
                            "owner_name": "Harish Poojary",
                            "email_prefix": "hotel.bekal1",
                            "service_name": "Bekal Fort Coastal Sands Resort",
                            "description": "Beachfront resort with direct views of the iconic 300-year-old Bekal Fort and private golden beach access.",
                            "room_name": "Fort View Luxury Villa",
                            "price": Decimal("4100.00")
                        },
                        {
                            "business_name": "Kasaragod Heritage Beach Stay",
                            "owner_name": "Ibrahim Kutty",
                            "email_prefix": "hotel.bekal2",
                            "service_name": "Kasaragod Heritage Beach Stay",
                            "description": "Authentic Malabar coastal stay featuring traditional wooden architecture, lush coconut groves, and seafood dining.",
                            "room_name": "Coastal Heritage Deluxe Room",
                            "price": Decimal("2600.00")
                        }
                    ],
                    "restaurants": [
                        {
                            "business_name": "Bekal Ocean Breeze Seafood Diner",
                            "owner_name": "Hameed K",
                            "email_prefix": "rest.bekal1",
                            "service_name": "Bekal Ocean Breeze Seafood Diner",
                            "description": "Coastal dining serving North Malabar fish curry meals, fresh mussels (Kallummakkaya fry), and kingfish tava fry.",
                            "cuisine": "North Malabar & Coastal Seafood",
                            "hours": "11:00 AM - 10:30 PM"
                        },
                        {
                            "business_name": "North Malabar Thalassery Kitchen",
                            "owner_name": "Ashraf B",
                            "email_prefix": "rest.bekal2",
                            "service_name": "North Malabar Thalassery Kitchen",
                            "description": "Famous Thalassery mutton and chicken biriyani, Pathiri with chicken curry, and traditional evening snacks.",
                            "cuisine": "Thalassery Malabar Traditional",
                            "hours": "08:00 AM - 11:00 PM"
                        }
                    ],
                    "activities": [
                        {
                            "business_name": "Bekal Fort Exploration & Coastal Walk",
                            "owner_name": "Raghunath Pai",
                            "email_prefix": "act.bekal1",
                            "service_name": "Bekal Fort Exploration & Coastal Walk",
                            "description": "Guided historical tour of the keyhole-shaped ramparts, observation towers, tunnel systems, and beach walkways.",
                            "price": Decimal("350.00"),
                            "duration": "2 Hours",
                            "hours": "08:00 AM - 05:30 PM",
                            "capacity": 30
                        },
                        {
                            "business_name": "Valiyaparamba Backwater Kayak Safari",
                            "owner_name": "Saneesh V",
                            "email_prefix": "act.bekal2",
                            "service_name": "Valiyaparamba Backwater Kayak Safari",
                            "description": "Pristine island kayaking through North Kerala's most picturesque backwater estuary near Bekal.",
                            "price": Decimal("950.00"),
                            "duration": "3 Hours",
                            "hours": "07:00 AM - 04:30 PM",
                            "capacity": 10
                        }
                    ],
                    "transportation": [
                        {
                            "business_name": "Bekal Tourist Cabs & Auto Fleet",
                            "owner_name": "Satheeshan K",
                            "email_prefix": "trans.bekal1",
                            "service_name": "Bekal Tourist Cabs & Auto Fleet",
                            "vehicle_type": "AC Sedan & Tourist Taxi",
                            "vehicle_name": "Maruti Dzire AC",
                            "description": "Local taxi service for Mangalore Airport transfers, Kasaragod Railway Station, and Bekal Fort sightseeing.",
                            "fare": Decimal("1700.00"),
                            "capacity": 4
                        },
                        {
                            "business_name": "Kasaragod Coastal Express Travels",
                            "owner_name": "Sukumaran N",
                            "email_prefix": "trans.bekal2",
                            "service_name": "Kasaragod Coastal Express Travels",
                            "vehicle_type": "AC SUV & Van",
                            "vehicle_name": "Toyota Innova AC",
                            "description": "Reliable vehicle rentals for North Malabar tours covering Bekal, Ranipuram hill station, and Anandashram.",
                            "fare": Decimal("2500.00"),
                            "capacity": 7
                        }
                    ]
                },
                "Ponmudi": {
                    "hotels": [
                        {
                            "business_name": "Ponmudi Golden Peak Mist Resort",
                            "owner_name": "Chandran S",
                            "email_prefix": "hotel.ponmudi1",
                            "service_name": "Ponmudi Golden Peak Mist Resort",
                            "description": "Scenic hilltop eco-resort with panoramic views of the Western Ghats mountain ridges and tea estates in Ponmudi.",
                            "room_name": "Golden Peak Chalet",
                            "price": Decimal("3100.00")
                        },
                        {
                            "business_name": "Peppara Forest Edge Cottages",
                            "owner_name": "Sudhir Nair",
                            "email_prefix": "hotel.ponmudi2",
                            "service_name": "Peppara Forest Edge Cottages",
                            "description": "Tranquil nature cottages located in the lush buffer zone of Peppara Wildlife Sanctuary near Ponmudi hills.",
                            "room_name": "Sanctuary View Deluxe Cottage",
                            "price": Decimal("2500.00")
                        }
                    ],
                    "restaurants": [
                        {
                            "business_name": "Ponmudi Valley View Cloud Diner",
                            "owner_name": "Girish V",
                            "email_prefix": "rest.ponmudi1",
                            "service_name": "Ponmudi Valley View Cloud Diner",
                            "description": "Hilltop view restaurant serving hot parotta with chicken roast, egg curry, fresh vegetable stew, and spiced tea.",
                            "cuisine": "Kerala Traditional & Highrange Grills",
                            "hours": "07:30 AM - 08:30 PM"
                        },
                        {
                            "business_name": "Hairpin 22 Hillside Cafe",
                            "owner_name": "Aneesh S",
                            "email_prefix": "rest.ponmudi2",
                            "service_name": "Hairpin 22 Hillside Cafe & Snacks",
                            "description": "Popular mountain-stop cafe offering freshly brewed tea, banana fritters (pazham pori), and south Indian snacks.",
                            "cuisine": "South Indian & Tea Lounge",
                            "hours": "07:00 AM - 07:30 PM"
                        }
                    ],
                    "activities": [
                        {
                            "business_name": "Ponmudi Golden Peak Sunrise Trek",
                            "owner_name": "Dileep Kumar",
                            "email_prefix": "act.ponmudi1",
                            "service_name": "Ponmudi Golden Peak Sunrise Trek",
                            "description": "Early morning guided trek to the golden misty peak with 360-degree views of mist-filled valley basins.",
                            "price": Decimal("450.00"),
                            "duration": "2.5 Hours",
                            "hours": "06:00 AM - 09:30 AM",
                            "capacity": 15
                        },
                        {
                            "business_name": "Peppara Sanctuary Wilderness Walk",
                            "owner_name": "Murugan K",
                            "email_prefix": "act.ponmudi2",
                            "service_name": "Peppara Sanctuary Wilderness Walk & River Trail",
                            "description": "Forest walking trail along the Kallar riverbed and Meenmutty falls with experienced local tribal guides.",
                            "price": Decimal("700.00"),
                            "duration": "3 Hours",
                            "hours": "08:30 AM - 03:30 PM",
                            "capacity": 10
                        }
                    ],
                    "transportation": [
                        {
                            "business_name": "Ponmudi Hairpin Hill Cabs",
                            "owner_name": "Sreejith P",
                            "email_prefix": "trans.ponmudi1",
                            "service_name": "Ponmudi Hairpin Hill Cabs",
                            "vehicle_type": "AC Hatchback & Sedan",
                            "vehicle_name": "Maruti Swift Dzire AC",
                            "description": "Safe hill drivers skilled at navigating the 22 hairpin bends between Trivandrum and Ponmudi peak.",
                            "fare": Decimal("1900.00"),
                            "capacity": 4
                        },
                        {
                            "business_name": "Trivandrum Ponmudi Express Taxi",
                            "owner_name": "Rajendran N",
                            "email_prefix": "trans.ponmudi2",
                            "service_name": "Trivandrum Ponmudi Express Taxi",
                            "vehicle_type": "AC SUV & MUV",
                            "vehicle_name": "Toyota Innova AC",
                            "description": "Family taxi service for Trivandrum Central Railway Station and Airport connections to Ponmudi and Kallar.",
                            "fare": Decimal("2600.00"),
                            "capacity": 7
                        }
                    ]
                },
                "Silent Valley": {
                    "hotels": [
                        {
                            "business_name": "Silent Valley Rainforest Eco Lodge",
                            "owner_name": "Dr. Ramanathan",
                            "email_prefix": "hotel.silentvalley1",
                            "service_name": "Silent Valley Rainforest Eco Lodge",
                            "description": "Sustainable rainforest lodge at Mukkali offering wooden suites, naturalist library, and organic vegetarian dining.",
                            "room_name": "Rainforest Canopy Suite",
                            "price": Decimal("3400.00")
                        },
                        {
                            "business_name": "Mukkali River Edge Green Resort",
                            "owner_name": "Balakrishnan K",
                            "email_prefix": "hotel.silentvalley2",
                            "service_name": "Mukkali River Edge Green Resort",
                            "description": "Riverside retreat nestled near Bhavani riverbed with green forest ambiance and bird watching decks.",
                            "room_name": "River Edge Green Cottage",
                            "price": Decimal("2600.00")
                        }
                    ],
                    "restaurants": [
                        {
                            "business_name": "Silent Valley Jungle Flavour Kitchen",
                            "owner_name": "Moideen K",
                            "email_prefix": "rest.silentvalley1",
                            "service_name": "Silent Valley Jungle Flavour Kitchen",
                            "description": "Traditional Palakkadan meals, spicy country chicken curry, and fresh herbal teas prepared by local cooks.",
                            "cuisine": "Palakkad Traditional & Kerala Meals",
                            "hours": "07:30 AM - 09:00 PM"
                        },
                        {
                            "business_name": "Palakkad Village Feast Restro",
                            "owner_name": "Sankaran Namboothiri",
                            "email_prefix": "rest.silentvalley2",
                            "service_name": "Palakkad Village Feast Restro",
                            "description": "Authentic pure vegetarian Kerala sadhya, Ramassery idli, and filter coffee in a serene village setting.",
                            "cuisine": "Pure Veg Kerala Traditional",
                            "hours": "07:00 AM - 08:30 PM"
                        }
                    ],
                    "activities": [
                        {
                            "business_name": "Silent Valley Forest Safari & Trek",
                            "owner_name": "Forest Guide Kunjumon",
                            "email_prefix": "act.silentvalley1",
                            "service_name": "Silent Valley National Park Guided Safari",
                            "description": "Official guided 4x4 safari into the core zone of Silent Valley up to Sairandhri watch tower and Kunthi River bridge.",
                            "price": Decimal("1200.00"),
                            "duration": "5 Hours",
                            "hours": "08:00 AM - 01:00 PM",
                            "capacity": 6
                        },
                        {
                            "business_name": "Kunthi River Trek & Bird Watching",
                            "owner_name": "Manoj Palakkad",
                            "email_prefix": "act.silentvalley2",
                            "service_name": "Kunthi River Trek & Bird Watching Trail",
                            "description": "Guided walking trail along the crystal-clear Kunthi River to spot rare lion-tailed macaques and Malabar pied hornbills.",
                            "price": Decimal("650.00"),
                            "duration": "3 Hours",
                            "hours": "07:00 AM - 11:30 AM",
                            "capacity": 8
                        }
                    ],
                    "transportation": [
                        {
                            "business_name": "Silent Valley 4x4 Jeep & Safari Taxis",
                            "owner_name": "Soman P",
                            "email_prefix": "trans.silentvalley1",
                            "service_name": "Silent Valley 4x4 Jeep & Safari Taxis",
                            "vehicle_type": "4WD Forest Jeep",
                            "vehicle_name": "Mahindra 4x4 Safari Jeep",
                            "description": "Specialized 4WD vehicles permitted for rugged terrain travel between Mannarkkad, Mukkali, and Sairandhri.",
                            "fare": Decimal("2200.00"),
                            "capacity": 6
                        },
                        {
                            "business_name": "Palakkad Jungle Safari Transport",
                            "owner_name": "Krishnadas M",
                            "email_prefix": "trans.silentvalley2",
                            "service_name": "Palakkad Jungle Safari Transport",
                            "vehicle_type": "AC Tourist Taxi & Sedan",
                            "vehicle_name": "Toyota Etios AC",
                            "description": "Connecting Palakkad Junction Railway Station and Coimbatore Airport to Silent Valley National Park.",
                            "fare": Decimal("2400.00"),
                            "capacity": 4
                        }
                    ]
                },
                "Marari Beach": {
                    "hotels": [
                        {
                            "business_name": "Marari Beach Palm Grove Eco Resort",
                            "owner_name": "Xavier Varghese",
                            "email_prefix": "hotel.marari1",
                            "service_name": "Marari Beach Palm Grove Eco Resort",
                            "description": "Boutique thatched-roof cottages set in sprawling coconut groves right on the peaceful sands of Marari Beach.",
                            "room_name": "Palm Grove Beach Cottage",
                            "price": Decimal("4600.00")
                        },
                        {
                            "business_name": "Mararikulam Fishermens Villa Stay",
                            "owner_name": "Mathew Kurian",
                            "email_prefix": "hotel.marari2",
                            "service_name": "Mararikulam Fishermens Villa Stay",
                            "description": "Authentic village homestay offering sea views, hammocks under the trees, and fresh home-cooked coastal meals.",
                            "room_name": "Sea Breeze Homestay Room",
                            "price": Decimal("2900.00")
                        }
                    ],
                    "restaurants": [
                        {
                            "business_name": "Marari Seaside Fresh Catch Grill",
                            "owner_name": "Antony Joseph",
                            "email_prefix": "rest.marari1",
                            "service_name": "Marari Seaside Fresh Catch Grill",
                            "description": "Barefoot beachfront dining featuring fresh lobster, prawns, squid roast, and grilled fish marinated in coastal spices.",
                            "cuisine": "Fresh Seafood & Kerala Coastal",
                            "hours": "11:30 AM - 10:30 PM"
                        },
                        {
                            "business_name": "Coconut Cove Organic Cafe",
                            "owner_name": "Maya Nair",
                            "email_prefix": "rest.marari2",
                            "service_name": "Coconut Cove Organic Cafe",
                            "description": "Eco-friendly cafe serving farm-to-table organic salads, fresh fruit juices, and traditional Kerala seafood curry.",
                            "cuisine": "Organic Cafe & Seafood",
                            "hours": "08:00 AM - 09:30 PM"
                        }
                    ],
                    "activities": [
                        {
                            "business_name": "Marari Coastal Biking & Village Tour",
                            "owner_name": "Georgekutty P",
                            "email_prefix": "act.marari1",
                            "service_name": "Marari Coastal Biking & Village Tour",
                            "description": "Bicycle exploration of quiet coastal lanes, coir making cottage units, and local fishermen fish auction beaches.",
                            "price": Decimal("450.00"),
                            "duration": "2.5 Hours",
                            "hours": "07:00 AM - 10:00 AM",
                            "capacity": 10
                        },
                        {
                            "business_name": "Traditional Catamaran Fishing Club",
                            "owner_name": "Francis K",
                            "email_prefix": "act.marari2",
                            "service_name": "Traditional Catamaran Fishing Experience",
                            "description": "Head out with seasoned local fishermen on a traditional wooden boat to experience authentic net fishing in the Arabian Sea.",
                            "price": Decimal("900.00"),
                            "duration": "2 Hours",
                            "hours": "06:30 AM - 08:30 AM",
                            "capacity": 6
                        }
                    ],
                    "transportation": [
                        {
                            "business_name": "Marari Beachline Cabs & Auto",
                            "owner_name": "Sunil Kumar",
                            "email_prefix": "trans.marari1",
                            "service_name": "Marari Beachline Cabs & Auto Fleet",
                            "vehicle_type": "AC Tourist Taxi & Sedan",
                            "vehicle_name": "Maruti Dzire AC",
                            "description": "Reliable transfers between Marari Beach, Alleppey backwaters, Cherthala, and Cochin Airport.",
                            "fare": Decimal("1700.00"),
                            "capacity": 4
                        },
                        {
                            "business_name": "Mararikulam Express Tourist Taxi",
                            "owner_name": "Bijumon K",
                            "email_prefix": "trans.marari2",
                            "service_name": "Mararikulam Express Tourist Taxi",
                            "vehicle_type": "AC SUV & Van",
                            "vehicle_name": "Toyota Innova AC",
                            "description": "Family vehicle transfers for beach hops across Marari, Alappuzha, and Fort Kochi.",
                            "fare": Decimal("2400.00"),
                            "capacity": 7
                        }
                    ]
                },
                "Thenmala": {
                    "hotels": [
                        {
                            "business_name": "Thenmala Eco Tourism Dam Resort",
                            "owner_name": "Rajasekharan Nair",
                            "email_prefix": "hotel.thenmala1",
                            "service_name": "Thenmala Eco Tourism Dam Resort",
                            "description": "Forest eco-resort overlooking the Thenmala reservoir featuring tented villas and tree-canopy view balconies.",
                            "room_name": "Eco Dam View Villa",
                            "price": Decimal("3100.00")
                        },
                        {
                            "business_name": "Kallar Valley Wilderness Camp",
                            "owner_name": "Mohanan P",
                            "email_prefix": "hotel.thenmala2",
                            "service_name": "Kallar Valley Wilderness Camp & Resort",
                            "description": "Nature adventure camp offering wooden cabins, rock climbing walls, and river swimming in the Western Ghats foothills.",
                            "room_name": "Wilderness Luxury Cottage",
                            "price": Decimal("2500.00")
                        }
                    ],
                    "restaurants": [
                        {
                            "business_name": "Thenmala Butterfly Park Forest Cafe",
                            "owner_name": "Santhosh K",
                            "email_prefix": "rest.thenmala1",
                            "service_name": "Thenmala Butterfly Park Forest Cafe",
                            "description": "Eco-friendly dining serving Kerala thalis, bamboo biriyani, freshly squeezed fruit juices, and herbal tea.",
                            "cuisine": "Kerala Traditional & Forest Specialties",
                            "hours": "08:00 AM - 08:30 PM"
                        },
                        {
                            "business_name": "Kollam Foothills Green Dining",
                            "owner_name": "Gopakumar T",
                            "email_prefix": "rest.thenmala2",
                            "service_name": "Kollam Foothills Green Dining",
                            "description": "Wholesome south Indian meals, parottas, chicken and fish fry served in a scenic open-air garden setting.",
                            "cuisine": "South Indian & Kerala Meals",
                            "hours": "07:30 AM - 09:30 PM"
                        }
                    ],
                    "activities": [
                        {
                            "business_name": "Thenmala Canopy Walk & Adventure Zone",
                            "owner_name": "Praveen Kumar",
                            "email_prefix": "act.thenmala1",
                            "service_name": "Thenmala Canopy Walk & Rock Climbing Tour",
                            "description": "Elevated walkway trail through tree crowns, mountain biking, suspension bridge crossing, and rock climbing.",
                            "price": Decimal("600.00"),
                            "duration": "3 Hours",
                            "hours": "09:00 AM - 05:00 PM",
                            "capacity": 25
                        },
                        {
                            "business_name": "Thenmala Dam Boating & Musical Fountain",
                            "owner_name": "Shyam Sunder",
                            "email_prefix": "act.thenmala2",
                            "service_name": "Thenmala Dam Boating & Dancing Fountain Show",
                            "description": "Scenic boat cruise in the reservoir followed by evening choreographed sound and laser musical fountain performance.",
                            "price": Decimal("400.00"),
                            "duration": "2 Hours",
                            "hours": "03:30 PM - 07:30 PM",
                            "capacity": 30
                        }
                    ],
                    "transportation": [
                        {
                            "business_name": "Thenmala Eco Tourism Cabs",
                            "owner_name": "Biju Varghese",
                            "email_prefix": "trans.thenmala1",
                            "service_name": "Thenmala Eco Tourism Cabs & Travels",
                            "vehicle_type": "AC Sedan & Tourist Taxi",
                            "vehicle_name": "Maruti Dzire AC",
                            "description": "Connecting Thenmala with Kollam Railway Station, Punalur Suspension Bridge, and Palaruvi Waterfalls.",
                            "fare": Decimal("1800.00"),
                            "capacity": 4
                        },
                        {
                            "business_name": "Kollam Thenmala Safari Travels",
                            "owner_name": "Sasi Kumar",
                            "email_prefix": "trans.thenmala2",
                            "service_name": "Kollam Thenmala Safari Travels",
                            "vehicle_type": "AC SUV & Van",
                            "vehicle_name": "Toyota Innova AC",
                            "description": "Day tour transportation for Shendurney Wildlife Sanctuary, Courtallam falls, and Thenmala ecotourism.",
                            "fare": Decimal("2600.00"),
                            "capacity": 7
                        }
                    ]
                },
                "Arthunkal Beach": {
                    "hotels": [
                        {
                            "business_name": "Arthunkal Beach Seaside Retreat",
                            "owner_name": "Sebastian Peter",
                            "email_prefix": "hotel.arthunkal1",
                            "service_name": "Arthunkal Beach Seaside Retreat",
                            "description": "Peaceful beachfront retreat offering direct sea views, coconut shade lawns, and authentic coastal dining.",
                            "room_name": "Seaside Deluxe Room",
                            "price": Decimal("2800.00")
                        },
                        {
                            "business_name": "St. Andrews Coastal Homestay",
                            "owner_name": "Joseph Fernandez",
                            "email_prefix": "hotel.arthunkal2",
                            "service_name": "St. Andrews Coastal Homestay",
                            "description": "Charming family homestay walking distance from St. Andrews Basilica and pristine Arthunkal golden sands.",
                            "room_name": "Coastal Heritage Room",
                            "price": Decimal("2200.00")
                        }
                    ],
                    "restaurants": [
                        {
                            "business_name": "Arthunkal Fisherman Seafood Shanty",
                            "owner_name": "Anto Varghese",
                            "email_prefix": "rest.arthunkal1",
                            "service_name": "Arthunkal Fisherman Seafood Shanty",
                            "description": "Authentic coastal eatery serving fresh sea fish curry, spicy crab fry, clams, and tapioca by the beach.",
                            "cuisine": "Coastal Kerala & Fresh Catch",
                            "hours": "11:00 AM - 09:30 PM"
                        },
                        {
                            "business_name": "Coastal Horizon Dine",
                            "owner_name": "Mathew K",
                            "email_prefix": "rest.arthunkal2",
                            "service_name": "Coastal Horizon Dine & Cafe",
                            "description": "Comfortable family dining offering traditional Kerala meals, appam with stew, and fresh fruit juices.",
                            "cuisine": "Kerala Traditional & Seafood",
                            "hours": "08:00 AM - 09:30 PM"
                        }
                    ],
                    "activities": [
                        {
                            "business_name": "Arthunkal Heritage & Beach Walk",
                            "owner_name": "Thomas Paul",
                            "email_prefix": "act.arthunkal1",
                            "service_name": "Arthunkal Heritage & Beach Walk",
                            "description": "Guided cultural walk exploring the 16th-century St. Andrews Basilica architecture and peaceful seashore.",
                            "price": Decimal("300.00"),
                            "duration": "1.5 Hours",
                            "hours": "08:00 AM - 05:00 PM",
                            "capacity": 20
                        },
                        {
                            "business_name": "Coastal Sunset Photography Tour",
                            "owner_name": "Joyal K",
                            "email_prefix": "act.arthunkal2",
                            "service_name": "Coastal Sunset Photography Tour",
                            "description": "Scenic evening photo tour capturing traditional fishing boats, sea breakers, and golden sunset reflections.",
                            "price": Decimal("400.00"),
                            "duration": "2 Hours",
                            "hours": "04:30 PM - 06:30 PM",
                            "capacity": 10
                        }
                    ],
                    "transportation": [
                        {
                            "business_name": "Arthunkal Coastal Cabs",
                            "owner_name": "Sabu M",
                            "email_prefix": "trans.arthunkal1",
                            "service_name": "Arthunkal Coastal Cabs",
                            "vehicle_type": "AC Tourist Taxi & Sedan",
                            "vehicle_name": "Maruti Dzire AC",
                            "description": "Connecting Arthunkal with Cherthala Railway Station, Marari Beach, and Cochin Airport.",
                            "fare": Decimal("1600.00"),
                            "capacity": 4
                        },
                        {
                            "business_name": "Cherthala Beachline Taxi Service",
                            "owner_name": "Varghese T",
                            "email_prefix": "trans.arthunkal2",
                            "service_name": "Cherthala Beachline Taxi Service",
                            "vehicle_type": "AC SUV & Tourist Cab",
                            "vehicle_name": "Toyota Innova AC",
                            "description": "Spacious family transport connecting coastal pilgrimage sites and Alappuzha beach destinations.",
                            "fare": Decimal("2200.00"),
                            "capacity": 7
                        }
                    ]
                }
            }

            # Coordinate offset matrix for natural clustering (~200m - 700m from destination)
            OFFSETS = {
                "hotel_1": (Decimal("0.0035"), Decimal("-0.0028")),
                "hotel_2": (Decimal("-0.0042"), Decimal("0.0036")),
                "restaurant_1": (Decimal("0.0021"), Decimal("0.0048")),
                "restaurant_2": (Decimal("-0.0031"), Decimal("-0.0039")),
                "activity_1": (Decimal("0.0062"), Decimal("0.0025")),
                "activity_2": (Decimal("-0.0055"), Decimal("-0.0045")),
                "transportation_1": (Decimal("0.0018"), Decimal("-0.0052")),
                "transportation_2": (Decimal("-0.0022"), Decimal("0.0061")),
            }

            added_counts = {"hotels": 0, "restaurants": 0, "activities": 0, "transportation": 0}

            for dest in Destination.objects.all().order_by("destination_id"):
                dname = dest.name.strip()
                template_data = DESTINATION_SERVICE_TEMPLATES.get(dname, {})
                base_lat = dest.latitude or Decimal("9.9312")
                base_lon = dest.longitude or Decimal("76.2673")

                # 1. HOTELS
                hotel_list = template_data.get("hotels", [])
                for idx, h_data in enumerate(hotel_list, start=1):
                    email = f"{h_data['email_prefix']}@wandera.com"
                    user, u_created = User.objects.get_or_create(
                        email=email,
                        defaults={
                            "full_name": h_data["owner_name"],
                            "password": "password123",
                            "role": "service_provider",
                            "status": "active"
                        }
                    )
                    off_lat, off_lon = OFFSETS.get(f"hotel_{idx}", (Decimal("0.002"), Decimal("0.002")))
                    sp, sp_created = ServiceProvider.objects.get_or_create(
                        user=user,
                        defaults={
                            "service_type": "Hotel",
                            "destination": dest,
                            "business_name": h_data["business_name"],
                            "license_number": f"LIC-HTL-{dest.destination_id}{idx:02d}",
                            "phone": f"9847{dest.destination_id:02d}{idx:04d}",
                            "email": email,
                            "address": f"{h_data['business_name']}, {dest.location}",
                            "district": dest.district,
                            "location": dest.location,
                            "area": dest.area or dest.name,
                            "description": h_data["description"],
                            "latitude": base_lat + off_lat,
                            "longitude": base_lon + off_lon
                        }
                    )
                    if not hasattr(sp, 'hotel') or not sp.hotel:
                        hotel = Hotel.objects.create(
                            provider=sp,
                            hotel_name=h_data["service_name"],
                            description=h_data["description"],
                            address=f"{h_data['business_name']}, {dest.location}",
                            district=dest.district,
                            location=dest.location,
                            contact_number=sp.phone,
                            email=email,
                            check_in_time="14:00:00",
                            check_out_time="11:00:00"
                        )
                        HotelImage.objects.create(
                            hotel=hotel,
                            image="hotels/alleppey-beach-resorts.jpg" if "beach" in dest.category.lower() else "hotels/mistmount.jpg"
                        )
                        HotelFacility.objects.create(hotel=hotel, facility_name="Free High-Speed Wi-Fi")
                        HotelFacility.objects.create(hotel=hotel, facility_name="24/7 Room Service & Dining")
                        HotelFacility.objects.create(hotel=hotel, facility_name="Air Conditioning")
                        Room.objects.create(
                            hotel=hotel,
                            room_name=h_data.get("room_name", "Deluxe Suite Room"),
                            description=f"Spacious and elegantly furnished luxury room with scenic views in {dest.name}.",
                            price_per_night=h_data.get("price", Decimal("3200.00")),
                            total_rooms=8,
                            maximum_guests=3
                        )
                        added_counts["hotels"] += 1
                        self.stdout.write(self.style.SUCCESS(f"  [+] Added Hotel '{h_data['service_name']}' for {dest.name}."))

                # 2. RESTAURANTS
                rest_list = template_data.get("restaurants", [])
                for idx, r_data in enumerate(rest_list, start=1):
                    email = f"{r_data['email_prefix']}@wandera.com"
                    user, u_created = User.objects.get_or_create(
                        email=email,
                        defaults={
                            "full_name": r_data["owner_name"],
                            "password": "password123",
                            "role": "service_provider",
                            "status": "active"
                        }
                    )
                    off_lat, off_lon = OFFSETS.get(f"restaurant_{idx}", (Decimal("0.002"), Decimal("0.002")))
                    sp, sp_created = ServiceProvider.objects.get_or_create(
                        user=user,
                        defaults={
                            "service_type": "Restaurant",
                            "destination": dest,
                            "business_name": r_data["business_name"],
                            "license_number": f"LIC-RST-{dest.destination_id}{idx:02d}",
                            "phone": f"9848{dest.destination_id:02d}{idx:04d}",
                            "email": email,
                            "address": f"{r_data['business_name']}, {dest.location}",
                            "district": dest.district,
                            "location": dest.location,
                            "area": dest.area or dest.name,
                            "description": r_data["description"],
                            "latitude": base_lat + off_lat,
                            "longitude": base_lon + off_lon
                        }
                    )
                    if not hasattr(sp, 'restaurant') or not sp.restaurant:
                        rest = Restaurant.objects.create(
                            provider=sp,
                            restaurant_name=r_data["service_name"],
                            description=r_data["description"],
                            address=f"{r_data['business_name']}, {dest.location}",
                            district=dest.district,
                            location=dest.location,
                            contact_number=sp.phone,
                            email=email,
                            cuisine_type=r_data.get("cuisine", "Kerala Traditional & Seafood"),
                            opening_time="07:30:00",
                            closing_time="22:30:00"
                        )
                        RestaurantImage.objects.create(
                            restaurant=rest,
                            image="restaurants/rest1.webp"
                        )
                        RestaurantFacility.objects.create(restaurant=rest, facility_name="Dine-in & Outdoor Seating")
                        RestaurantFacility.objects.create(restaurant=rest, facility_name="Authentic Kerala Dishes")
                        added_counts["restaurants"] += 1
                        self.stdout.write(self.style.SUCCESS(f"  [+] Added Restaurant '{r_data['service_name']}' for {dest.name}."))

                # 3. ACTIVITIES
                act_list = template_data.get("activities", [])
                for idx, a_data in enumerate(act_list, start=1):
                    email = f"{a_data['email_prefix']}@wandera.com"
                    user, u_created = User.objects.get_or_create(
                        email=email,
                        defaults={
                            "full_name": a_data["owner_name"],
                            "password": "password123",
                            "role": "service_provider",
                            "status": "active"
                        }
                    )
                    off_lat, off_lon = OFFSETS.get(f"activity_{idx}", (Decimal("0.003"), Decimal("0.003")))
                    sp, sp_created = ServiceProvider.objects.get_or_create(
                        user=user,
                        defaults={
                            "service_type": "Activity",
                            "destination": dest,
                            "business_name": a_data["business_name"],
                            "license_number": f"LIC-ACT-{dest.destination_id}{idx:02d}",
                            "phone": f"9846{dest.destination_id:02d}{idx:04d}",
                            "email": email,
                            "address": f"{a_data['business_name']}, {dest.location}",
                            "district": dest.district,
                            "location": dest.location,
                            "area": dest.area or dest.name,
                            "description": a_data["description"],
                            "latitude": base_lat + off_lat,
                            "longitude": base_lon + off_lon
                        }
                    )
                    if not hasattr(sp, 'activity') or not sp.activity:
                        act = Activity.objects.create(
                            provider=sp,
                            activity_name=a_data["service_name"],
                            description=a_data["description"],
                            location=dest.location,
                            district=dest.district,
                            contact_number=sp.phone,
                            email=email,
                            price=a_data.get("price", Decimal("600.00")),
                            duration=a_data.get("duration", "2 Hours"),
                            available_times=a_data.get("hours", "08:00 AM - 05:00 PM"),
                            capacity=a_data.get("capacity", 10),
                            instructions="Follow guide instructions and wear comfortable footwear."
                        )
                        ActivityImage.objects.create(
                            activity=act,
                            image="waynad hill.webp" if "hill" in dest.category.lower() else "pambanal.webp"
                        )
                        ActivityItem.objects.create(
                            activity=act,
                            activity_title=a_data["service_name"],
                            category="Guided Experience",
                            description=a_data["description"],
                            price=a_data.get("price", Decimal("600.00")),
                            duration=a_data.get("duration", "2 Hours"),
                            available_times=a_data.get("hours", "08:00 AM - 05:00 PM"),
                            capacity=a_data.get("capacity", 10)
                        )
                        added_counts["activities"] += 1
                        self.stdout.write(self.style.SUCCESS(f"  [+] Added Activity '{a_data['service_name']}' for {dest.name}."))

                # 4. TRANSPORTATION
                trans_list = template_data.get("transportation", [])
                for idx, t_data in enumerate(trans_list, start=1):
                    email = f"{t_data['email_prefix']}@wandera.com"
                    user, u_created = User.objects.get_or_create(
                        email=email,
                        defaults={
                            "full_name": t_data["owner_name"],
                            "password": "password123",
                            "role": "service_provider",
                            "status": "active"
                        }
                    )
                    off_lat, off_lon = OFFSETS.get(f"transportation_{idx}", (Decimal("0.002"), Decimal("-0.002")))
                    sp, sp_created = ServiceProvider.objects.get_or_create(
                        user=user,
                        defaults={
                            "service_type": "Transportation",
                            "destination": dest,
                            "business_name": t_data["business_name"],
                            "license_number": f"LIC-TRN-{dest.destination_id}{idx:02d}",
                            "phone": f"9845{dest.destination_id:02d}{idx:04d}",
                            "email": email,
                            "address": f"{t_data['business_name']}, {dest.location}",
                            "district": dest.district,
                            "location": dest.location,
                            "area": dest.area or dest.name,
                            "description": t_data["description"],
                            "latitude": base_lat + off_lat,
                            "longitude": base_lon + off_lon
                        }
                    )
                    if not hasattr(sp, 'transportation') or not sp.transportation:
                        trans = Transportation.objects.create(
                            provider=sp,
                            service_name=t_data["service_name"],
                            vehicle_type=t_data.get("vehicle_type", "AC Tourist Cab"),
                            description=t_data["description"],
                            address=f"{t_data['business_name']}, {dest.location}",
                            district=dest.district,
                            starting_location=dest.location,
                            service_area=f"{dest.name}, {dest.district}, Nearby Attractions",
                            contact_number=sp.phone,
                            email=email,
                            price_fare=t_data.get("fare", Decimal("2000.00")),
                            availability_status="Available"
                        )
                        TransportationImage.objects.create(
                            transportation=trans,
                            image="Dezire.jpg"
                        )
                        Vehicle.objects.create(
                            transportation=trans,
                            vehicle_name=t_data.get("vehicle_name", "Maruti Dzire AC"),
                            vehicle_type=t_data.get("vehicle_type", "Sedan"),
                            description=f"Clean and comfortable tourist cab for {dest.name} sightseeing.",
                            price_fare=t_data.get("fare", Decimal("2000.00")),
                            fare_unit="/ day",
                            seating_capacity=t_data.get("capacity", 4),
                            availability_status="Available"
                        )
                        added_counts["transportation"] += 1
                        self.stdout.write(self.style.SUCCESS(f"  [+] Added Transportation '{t_data['service_name']}' for {dest.name}."))

        self.stdout.write(self.style.SUCCESS("\n================ POPULATION SUMMARY ================"))
        self.stdout.write(f"New Hotels Added: {added_counts['hotels']}")
        self.stdout.write(f"New Restaurants Added: {added_counts['restaurants']}")
        self.stdout.write(f"New Activities Added: {added_counts['activities']}")
        self.stdout.write(f"New Transportation Added: {added_counts['transportation']}")
        self.stdout.write(f"Total New Services: {sum(added_counts.values())}")
        self.stdout.write(self.style.SUCCESS("====================================================="))
