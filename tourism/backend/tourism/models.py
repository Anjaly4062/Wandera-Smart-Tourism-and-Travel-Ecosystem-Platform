from django.db import models

class User(models.Model):

    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('tourist', 'Tourist'),
        ('service_provider', 'Service Provider'),
    )

    STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    )

    user_id = models.AutoField(primary_key=True)

    full_name = models.CharField(max_length=150)

    email = models.EmailField(unique=True)

    password = models.CharField(max_length=255)

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "users"

    def __str__(self):
        return self.full_name

class TouristProfile(models.Model):
    profile_id = models.AutoField(primary_key=True)

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="tourist_profile"
    )

    phone = models.CharField(max_length=15, blank=True, null=True)

    date_of_birth = models.DateField(
        blank=True,
        null=True
    )

    profile_image = models.ImageField(
        upload_to="tourist_profiles/",
        blank=True,
        null=True
    )

    travel_preferences = models.JSONField(
        default=list,
        blank=True
    )

    travel_style = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    budget_range = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    previous_trips = models.JSONField(
        default=list,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.user.full_name

class ServiceProviderRequest(models.Model):

    SERVICE_TYPES = (
        ('Hotel', 'Hotel Owner'),
        ('Restaurant', 'Restaurant Owner'),
        ('Transportation', 'Transportation Owner'),
        ('Activity', 'Activity Owner'),
    )

    APPROVAL_STATUS = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    )

    request_id = models.AutoField(primary_key=True)

    full_name = models.CharField(max_length=150)

    email = models.EmailField(unique=True)

    password = models.CharField(max_length=255)

    service_type = models.CharField(
        max_length=50,
        choices=SERVICE_TYPES
    )

    business_name = models.CharField(max_length=150)

    license_number = models.CharField(max_length=100)
    certificate = models.FileField(upload_to="certificates/",null=True)

    approval_status = models.CharField(
        max_length=20,
        choices=APPROVAL_STATUS,
        default='Pending'
    )

    requested_at = models.DateTimeField(auto_now_add=True)

    approved_at = models.DateTimeField(
        null=True,
        blank=True
    )

    class Meta:
        db_table = "service_provider_requests"

    def __str__(self):
        return self.business_name


class Destination(models.Model):
    destination_id = models.AutoField(primary_key=True)

    name = models.CharField(max_length=200)

    category = models.CharField(
        max_length=50,
        choices=[
            ("Beach", "Beach"),
            ("Hill Station", "Hill Station"),
            ("Waterfall", "Waterfall"),
            ("Temple", "Temple"),
            ("Wildlife", "Wildlife"),
            ("Museum", "Museum"),
            ("Other", "Other"),
        ]
    )

    district = models.CharField(max_length=100)
    description = models.TextField()
    location = models.CharField(max_length=200)
    area = models.CharField(max_length=100, blank=True, null=True)
    image = models.ImageField(upload_to="destinations/")
    status = models.CharField(
        max_length=10,
        choices=[("Active", "Active"), ("Inactive", "Inactive")],
        default="Active"
    )
    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True
    )
    longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True
    )

    class Meta:
        db_table = "destination"


class ServiceProvider(models.Model):

    SERVICE_TYPES = (
        ('Hotel', 'Hotel Owner'),
        ('Restaurant', 'Restaurant Owner'),
        ('Transportation', 'Transportation Owner'),
        ('Activity', 'Activity Owner'),
    )

    provider_id = models.AutoField(primary_key=True)

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="provider_details"
    )

    service_type = models.CharField(
        max_length=50,
        choices=SERVICE_TYPES
    )
    destination = models.ForeignKey(Destination,on_delete=models.CASCADE,related_name="service_providers",null=True,blank=True)

    business_name = models.CharField(max_length=150)

    license_number = models.CharField(max_length=100)

    
    phone = models.CharField(max_length=20,null=True)

    email = models.EmailField(null=True)

    address = models.TextField(null=True)

    district = models.CharField(max_length=100,null=True)

    location = models.CharField(max_length=255,null=True)

    area = models.CharField(max_length=100, blank=True, null=True)

    description = models.TextField(null=True)

    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True
    )
    longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "service_providers"

    def __str__(self):
        return self.business_name


class Hotel(models.Model):

    hotel_id = models.AutoField(primary_key=True)

    provider = models.OneToOneField(
        ServiceProvider,
        on_delete=models.CASCADE,
        related_name="hotel"
    )

    hotel_name = models.CharField(max_length=200)

    description = models.TextField()

    address = models.TextField()

    district = models.CharField(max_length=100)

    location = models.CharField(max_length=255)

    contact_number = models.CharField(max_length=20)

    email = models.EmailField()

    check_in_time = models.TimeField()

    check_out_time = models.TimeField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "hotels"

    def __str__(self):
        return self.hotel_name

class HotelImage(models.Model):

    image_id = models.AutoField(primary_key=True)

    hotel = models.ForeignKey(
        Hotel,
        on_delete=models.CASCADE,
        related_name="images"
    )

    image = models.ImageField(
        upload_to="hotels/"
    )

    class Meta:
        db_table = "hotel_images"

class HotelFacility(models.Model):

    facility_id = models.AutoField(primary_key=True)

    hotel = models.ForeignKey(
        Hotel,
        on_delete=models.CASCADE,
        related_name="facilities"
    )

    facility_name = models.CharField(max_length=100)

    class Meta:
        db_table = "hotel_facilities"

    def __str__(self):
        return self.facility_name

class Room(models.Model):

    room_id = models.AutoField(primary_key=True)

    hotel = models.ForeignKey(
        Hotel,
        on_delete=models.CASCADE,
        related_name="rooms"
    )

    room_name = models.CharField(max_length=150)

    description = models.TextField()

    price_per_night = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    total_rooms = models.PositiveIntegerField()

    maximum_guests = models.PositiveIntegerField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        db_table = "rooms"

    def __str__(self):
        return self.room_name


class RoomImage(models.Model):

    image_id = models.AutoField(primary_key=True)

    room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        related_name="images"
    )

    image = models.ImageField(
        upload_to="rooms/"
    )

    class Meta:
        db_table = "room_images"


class Restaurant(models.Model):
    restaurant_id = models.AutoField(primary_key=True)
    provider = models.OneToOneField(
        ServiceProvider,
        on_delete=models.CASCADE,
        related_name="restaurant"
    )
    restaurant_name = models.CharField(max_length=200)
    description = models.TextField()
    address = models.TextField()
    district = models.CharField(max_length=100)
    location = models.CharField(max_length=255)
    contact_number = models.CharField(max_length=20)
    email = models.EmailField()
    cuisine_type = models.CharField(max_length=150)
    opening_time = models.TimeField()
    closing_time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "restaurants"

    def __str__(self):
        return self.restaurant_name


class RestaurantImage(models.Model):
    image_id = models.AutoField(primary_key=True)
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="images"
    )
    image = models.ImageField(upload_to="restaurants/")

    class Meta:
        db_table = "restaurant_images"


class RestaurantFacility(models.Model):
    facility_id = models.AutoField(primary_key=True)
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="facilities"
    )
    facility_name = models.CharField(max_length=100)

    class Meta:
        db_table = "restaurant_facilities"


class Transportation(models.Model):
    transportation_id = models.AutoField(primary_key=True)
    provider = models.OneToOneField(
        ServiceProvider,
        on_delete=models.CASCADE,
        related_name="transportation"
    )
    service_name = models.CharField(max_length=200)
    vehicle_type = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField()
    address = models.TextField(blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    starting_location = models.CharField(max_length=255)
    service_area = models.CharField(max_length=255)
    contact_number = models.CharField(max_length=20)
    email = models.EmailField()
    price_fare = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    availability_status = models.CharField(max_length=50, default="Available")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "transportation_services"

    def __str__(self):
        return self.service_name


class TransportationImage(models.Model):
    image_id = models.AutoField(primary_key=True)
    transportation = models.ForeignKey(
        Transportation,
        on_delete=models.CASCADE,
        related_name="images"
    )
    image = models.ImageField(upload_to="transportation/")

    class Meta:
        db_table = "transportation_images"


class Vehicle(models.Model):
    vehicle_id = models.AutoField(primary_key=True)
    transportation = models.ForeignKey(
        Transportation,
        on_delete=models.CASCADE,
        related_name="vehicles"
    )
    vehicle_name = models.CharField(max_length=150)
    vehicle_type = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    price_fare = models.DecimalField(max_digits=10, decimal_places=2)
    fare_unit = models.CharField(max_length=50, default="/ day")
    seating_capacity = models.PositiveIntegerField(default=4)
    availability_status = models.CharField(max_length=50, default="Available")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "vehicles"

    def __str__(self):
        return self.vehicle_name


class VehicleImage(models.Model):
    image_id = models.AutoField(primary_key=True)
    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.CASCADE,
        related_name="images"
    )
    image = models.ImageField(upload_to="vehicles/")

    class Meta:
        db_table = "vehicle_images"


class Activity(models.Model):
    activity_id = models.AutoField(primary_key=True)
    provider = models.OneToOneField(
        ServiceProvider,
        on_delete=models.CASCADE,
        related_name="activity"
    )
    activity_name = models.CharField(max_length=200)
    description = models.TextField()
    location = models.CharField(max_length=255)
    district = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=20)
    email = models.EmailField()
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    duration = models.CharField(max_length=100, blank=True, null=True)
    available_times = models.CharField(max_length=255, blank=True, null=True)
    capacity = models.PositiveIntegerField(default=1)
    instructions = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "activities"

    def __str__(self):
        return self.activity_name


class ActivityImage(models.Model):
    image_id = models.AutoField(primary_key=True)
    activity = models.ForeignKey(
        Activity,
        on_delete=models.CASCADE,
        related_name="images"
    )
    image = models.ImageField(upload_to="activities/")

    class Meta:
        db_table = "activity_images"


class ActivityItem(models.Model):
    item_id = models.AutoField(primary_key=True)
    activity = models.ForeignKey(
        Activity,
        on_delete=models.CASCADE,
        related_name="items"
    )
    activity_title = models.CharField(max_length=200)
    category = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.CharField(max_length=100)
    available_times = models.CharField(max_length=255)
    capacity = models.PositiveIntegerField(default=1)
    instructions = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "activity_items"

    def __str__(self):
        return self.activity_title


class ActivityItemImage(models.Model):
    image_id = models.AutoField(primary_key=True)
    activity_item = models.ForeignKey(
        ActivityItem,
        on_delete=models.CASCADE,
        related_name="images"
    )
    image = models.ImageField(upload_to="activity_items/")

    class Meta:
        db_table = "activity_item_images"


class TripCart(models.Model):
    cart_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="trip_carts"
    )
    destination = models.ForeignKey(
        Destination,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="trip_carts"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "trip_carts"

    def __str__(self):
        return f"TripCart #{self.cart_id} - User {self.user.full_name}"


class TripCartItem(models.Model):
    cart_item_id = models.AutoField(primary_key=True)
    cart = models.ForeignKey(
        TripCart,
        on_delete=models.CASCADE,
        related_name="items"
    )
    provider = models.ForeignKey(
        ServiceProvider,
        on_delete=models.CASCADE,
        related_name="cart_items"
    )
    service_type = models.CharField(max_length=50)
    room = models.ForeignKey(
        Room,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    activity_item = models.ForeignKey(
        ActivityItem,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    booking_details = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "trip_cart_items"
        unique_together = ('cart', 'provider')

    def __str__(self):
        return f"{self.service_type} in Cart #{self.cart.cart_id}"


class Booking(models.Model):
    BOOKING_STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    )

    PAYMENT_STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
        ('Failed', 'Failed'),
        ('Refunded', 'Refunded'),
    )

    PAYMENT_METHOD_CHOICES = (
        ('Online', 'Online'),
        ('Offline', 'Offline'),
    )

    booking_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="bookings"
    )
    destination = models.ForeignKey(
        Destination,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="bookings"
    )
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    booking_status = models.CharField(
        max_length=20,
        choices=BOOKING_STATUS_CHOICES,
        default='Confirmed'
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default='Offline'
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='Pending'
    )
    razorpay_order_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "bookings"

    def __str__(self):
        return f"Booking #{self.booking_id} - {self.user.full_name}"


class BookingItem(models.Model):
    booking_item_id = models.AutoField(primary_key=True)
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name="items"
    )
    provider = models.ForeignKey(
        ServiceProvider,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="booking_items"
    )
    service_type = models.CharField(max_length=50)
    service_id = models.PositiveIntegerField(null=True, blank=True)
    item_name = models.CharField(max_length=255, blank=True, null=True)
    details = models.JSONField(default=dict, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, default='Confirmed')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "booking_items"

    def __str__(self):
        return f"{self.service_type} ({self.item_name}) - Booking #{self.booking.booking_id}"


class HiddenSpot(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    )

    TYPE_CHOICES = (
        ('Waterfall', 'Waterfall'),
        ('Viewpoint', 'Viewpoint'),
        ('Temple', 'Temple'),
        ('Beach', 'Beach'),
        ('Nature Spot', 'Nature Spot'),
        ('Cave', 'Cave'),
        ('Trekking Trail', 'Trekking Trail'),
        ('Lake', 'Lake'),
        ('Heritage', 'Heritage'),
        ('Other', 'Other'),
    )

    spot_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="hidden_spots"
    )
    name = models.CharField(max_length=200)
    spot_type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='Nature Spot')
    description = models.TextField()
    location = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    image = models.ImageField(upload_to="hidden_spots/", null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "hidden_spots"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.spot_type}) - {self.status}"


class HiddenSpotImage(models.Model):
    image_id = models.AutoField(primary_key=True)
    spot = models.ForeignKey(
        HiddenSpot,
        on_delete=models.CASCADE,
        related_name="images"
    )
    image = models.ImageField(upload_to="hidden_spots/")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "hidden_spot_images"

    def __str__(self):
        return f"Image #{self.image_id} for {self.spot.name}"





