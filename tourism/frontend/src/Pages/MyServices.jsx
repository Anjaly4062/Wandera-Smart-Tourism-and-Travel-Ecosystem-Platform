import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ServiceProviderNavbar from "../Components/ServiceProviderNavbar";
import EditHotelModal from "../Components/EditHotelModal";
import EditRoomModal from "../Components/EditRoomModal";
import EditRestaurantModal from "../Components/EditRestaurantModal";
import EditTransportationModal from "../Components/EditTransportationModal";
import EditActivityModal from "../Components/EditActivityModal";
import EditVehicleModal from "../Components/EditVehicleModal";
import EditActivityItemModal from "../Components/EditActivityItemModal";
import api from "../services/api";
import "../styles/MyServices.css";

export default function MyServices() {
    const navigate = useNavigate();
    const [providerInfo, setProviderInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);

    // Modals
    const [isEditHotelOpen, setIsEditHotelOpen] = useState(false);
    const [isEditRestaurantOpen, setIsEditRestaurantOpen] = useState(false);
    const [isEditTransportationOpen, setIsEditTransportationOpen] = useState(false);
    const [isEditActivityOpen, setIsEditActivityOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [editingActivityItem, setEditingActivityItem] = useState(null);

    const fetchProviderInfo = async () => {
        const providerId = localStorage.getItem("provider_id");
        if (!providerId) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get(`provider-info/${providerId}/`);
            if (response.data?.provider) {
                setProviderInfo(response.data.provider);
                if (response.data.provider.service_type) {
                    localStorage.setItem("service_type", response.data.provider.service_type);
                }
            }
        } catch (error) {
            console.error("Error fetching provider info:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProviderInfo();
    }, []);

    const handleDeleteRoom = async (roomId, roomName) => {
        if (!window.confirm(`Are you sure you want to delete room "${roomName}"?`)) return;

        try {
            const response = await api.delete(`delete-room/${roomId}/`);
            if (response.status === 200) {
                alert("Room deleted successfully!");
                fetchProviderInfo();
            }
        } catch (error) {
            console.error("Error deleting room:", error);
            alert("Failed to delete room.");
        }
    };

    const handleDeleteVehicle = async (vehicleId, vehicleName) => {
        if (!window.confirm(`Are you sure you want to delete vehicle "${vehicleName}"?`)) return;

        try {
            const response = await api.delete(`delete-vehicle/${vehicleId}/`);
            if (response.status === 200) {
                alert("Vehicle deleted successfully!");
                fetchProviderInfo();
            }
        } catch (error) {
            console.error("Error deleting vehicle:", error);
            alert("Failed to delete vehicle.");
        }
    };

    const handleDeleteActivityItem = async (itemId, title) => {
        if (!window.confirm(`Are you sure you want to delete activity "${title}"?`)) return;

        try {
            const response = await api.delete(`delete-activity-item/${itemId}/`);
            if (response.status === 200) {
                alert("Activity item deleted successfully!");
                fetchProviderInfo();
            }
        } catch (error) {
            console.error("Error deleting activity item:", error);
            alert("Failed to delete activity item.");
        }
    };

    const handleDeleteHotel = async (hotelId, hotelName) => {
        if (!window.confirm(`Are you sure you want to delete hotel "${hotelName}"?`)) return;

        try {
            const response = await api.delete(`delete-hotel/${hotelId}/`);
            if (response.status === 200) {
                alert("Hotel deleted successfully!");
                fetchProviderInfo();
            }
        } catch (error) {
            console.error("Error deleting hotel:", error);
            alert("Failed to delete hotel.");
        }
    };

    const handleDeleteRestaurant = async (restaurantId, restaurantName) => {
        if (!window.confirm(`Are you sure you want to delete restaurant "${restaurantName}"?`)) return;

        try {
            const response = await api.delete(`delete-restaurant/${restaurantId}/`);
            if (response.status === 200) {
                alert("Restaurant deleted successfully!");
                fetchProviderInfo();
            }
        } catch (error) {
            console.error("Error deleting restaurant:", error);
            alert("Failed to delete restaurant.");
        }
    };

    const handleDeleteTransportation = async (transportationId, serviceName) => {
        if (!window.confirm(`Are you sure you want to delete transportation service "${serviceName}"?`)) return;

        try {
            const response = await api.delete(`delete-transportation/${transportationId}/`);
            if (response.status === 200) {
                alert("Transportation service deleted successfully!");
                fetchProviderInfo();
            }
        } catch (error) {
            console.error("Error deleting transportation service:", error);
            alert("Failed to delete transportation service.");
        }
    };

    const handleDeleteActivity = async (activityId, activityName) => {
        if (!window.confirm(`Are you sure you want to delete activity "${activityName}"?`)) return;

        try {
            const response = await api.delete(`delete-activity/${activityId}/`);
            if (response.status === 200) {
                alert("Activity deleted successfully!");
                fetchProviderInfo();
            }
        } catch (error) {
            console.error("Error deleting activity:", error);
            alert("Failed to delete activity.");
        }
    };

    const serviceType = providerInfo?.service_type || localStorage.getItem("service_type") || "Hotel";
    const hotel = providerInfo?.hotel;
    const transportation = providerInfo?.transportation;
    const restaurant = providerInfo?.restaurant;
    const activity = providerInfo?.activity;

    return (
        <div className="service-provider-layout">
            <ServiceProviderNavbar />

            <main className="my-services-content">
                {/* PAGE TOP HEADER */}
                <div className="my-services-header">
                    <div>
                        <h2>My Services</h2>
                        <p>
                            Dashboard <span>›</span> My Services <span>›</span> {serviceType} Account
                        </p>
                    </div>

                    {/* TOP DYNAMIC ADD BUTTON */}
                    {serviceType === "Hotel" && hotel && (
                        <button
                            className="single-add-room-btn"
                            onClick={() =>
                                navigate("/provider/add-room", {
                                    state: { hotel_id: hotel.hotel_id },
                                })
                            }
                        >
                            + Add Room
                        </button>
                    )}

                    {serviceType === "Transportation" && transportation && (
                        <button
                            className="single-add-room-btn"
                            onClick={() =>
                                navigate("/provider/add-vehicle", {
                                    state: { transportation_id: transportation.transportation_id },
                                })
                            }
                        >
                            + Add Vehicle
                        </button>
                    )}

                    {serviceType === "Activity" && activity && (
                        <button
                            className="single-add-room-btn"
                            onClick={() =>
                                navigate("/provider/add-activity-item", {
                                    state: { activity_id: activity.activity_id },
                                })
                            }
                        >
                            + Add Activity Package
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="services-loading-box">
                        <div className="loading-spinner"></div>
                        <p>Loading service details...</p>
                    </div>
                ) : serviceType === "Transportation" ? (
                    /* ================= TRANSPORTATION OWNER SERVICE VIEW ================= */
                    transportation ? (
                        <div className="services-details-wrapper">
                            <div className="hotel-details-card">
                                {transportation.images && transportation.images.length > 0 && (
                                    <div className="hotel-gallery-section">
                                        <div className="main-image-container">
                                            <img
                                                src={`http://127.0.0.1:8000${transportation.images[activeImage]?.image}`}
                                                alt={transportation.service_name}
                                                className="hotel-main-img"
                                            />
                                            <span className="hotel-type-badge">🚍 Transportation Agency</span>
                                        </div>
                                        {transportation.images.length > 1 && (
                                            <div className="thumbnail-row">
                                                {transportation.images.map((img, idx) => (
                                                    <img
                                                        key={img.image_id}
                                                        src={`http://127.0.0.1:8000${img.image}`}
                                                        alt={`Thumbnail ${idx + 1}`}
                                                        className={`thumbnail-img ${
                                                            activeImage === idx ? "active" : ""
                                                        }`}
                                                        onClick={() => setActiveImage(idx)}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="hotel-info-header-row">
                                    <div>
                                        <span className="hotel-type-badge">🚍 Travel Agency</span>
                                        <h1 className="hotel-name-title">{transportation.service_name}</h1>
                                        <p className="hotel-address-text">
                                            📍 Main Hub: <strong>{transportation.starting_location}</strong>, {transportation.district} | Service Area: <span className="location-tag">{transportation.service_area}</span>
                                        </p>
                                    </div>
                                    <div style={{ display: "flex", gap: "10px" }}>
                                        <button
                                            className="edit-hotel-btn"
                                            onClick={() => setIsEditTransportationOpen(true)}
                                        >
                                            ✏️ Edit Details
                                        </button>
                                        <button
                                            className="edit-hotel-btn"
                                            style={{ background: "#ef4444", borderColor: "#ef4444", color: "white" }}
                                            onClick={() => handleDeleteTransportation(transportation.transportation_id, transportation.service_name)}
                                        >
                                            🗑️ Delete Service
                                        </button>
                                    </div>
                                </div>

                                <div className="hotel-info-grid">
                                    <div className="info-box">
                                        <span className="info-label">📞 Booking Contact</span>
                                        <span className="info-value">{transportation.contact_number}</span>
                                    </div>
                                    <div className="info-box">
                                        <span className="info-label">✉️ Email Address</span>
                                        <span className="info-value">{transportation.email}</span>
                                    </div>
                                    <div className="info-box">
                                        <span className="info-label">📍 Main Hub</span>
                                        <span className="info-value">{transportation.starting_location}</span>
                                    </div>
                                    <div className="info-box">
                                        <span className="info-label">🚗 Total Vehicles</span>
                                        <span className="info-value">{transportation.vehicles ? transportation.vehicles.length : 0} Vehicle(s)</span>
                                    </div>
                                </div>

                                {transportation.description && (
                                    <div className="hotel-section-block">
                                        <h3>Agency Description</h3>
                                        <p className="hotel-description-text">{transportation.description}</p>
                                    </div>
                                )}
                            </div>

                            {/* VEHICLES LIST SECTION */}
                            <div className="rooms-section-card">
                                <div className="rooms-header-bar">
                                    <div>
                                        <h3>Registered Vehicles ({transportation.vehicles ? transportation.vehicles.length : 0})</h3>
                                        <p>Available fleet vehicles registered for {transportation.service_name}</p>
                                    </div>
                                    <button
                                        className="single-add-room-btn"
                                        style={{ fontSize: "11px", padding: "8px 16px" }}
                                        onClick={() =>
                                            navigate("/provider/add-vehicle", {
                                                state: { transportation_id: transportation.transportation_id },
                                            })
                                        }
                                    >
                                        + Add Vehicle
                                    </button>
                                </div>

                                {!transportation.vehicles || transportation.vehicles.length === 0 ? (
                                    <div className="empty-rooms-container">
                                        <div className="empty-room-icon">🚗</div>
                                        <h4>No Vehicles Added Yet</h4>
                                        <p>Click "+ Add Vehicle" to add SUV, Sedan, or Tempo Traveller vehicles to your agency.</p>
                                    </div>
                                ) : (
                                    <div className="rooms-grid-list">
                                        {transportation.vehicles.map((veh) => (
                                            <div key={veh.vehicle_id} className="room-card-item">
                                                <div className="room-card-img-wrapper">
                                                    {veh.images && veh.images.length > 0 ? (
                                                        <img
                                                            src={`http://127.0.0.1:8000${veh.images[0].image}`}
                                                            alt={veh.vehicle_name}
                                                            className="room-img"
                                                        />
                                                    ) : (
                                                        <div className="room-img-placeholder">🚗 No Image</div>
                                                    )}
                                                    <span className="room-price-badge">
                                                        ₹{veh.price_fare} <sub>{veh.fare_unit}</sub>
                                                    </span>
                                                </div>
                                                <div className="room-card-content">
                                                    <div className="room-title-actions">
                                                        <h4 className="room-title">{veh.vehicle_name}</h4>
                                                        <div className="room-action-buttons">
                                                            <button
                                                                className="btn-room-edit"
                                                                title="Edit Vehicle"
                                                                onClick={() => setEditingVehicle(veh)}
                                                            >
                                                                ✏️
                                                            </button>
                                                            <button
                                                                className="btn-room-delete"
                                                                title="Delete Vehicle"
                                                                onClick={() => handleDeleteVehicle(veh.vehicle_id, veh.vehicle_name)}
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="room-description">{veh.description || veh.vehicle_type}</p>
                                                    <div className="room-specs">
                                                        <span className="spec-tag">🚘 {veh.vehicle_type}</span>
                                                        <span className="spec-tag">👥 {veh.seating_capacity} Seats</span>
                                                        <span className="spec-tag" style={{ color: "#059669" }}>🟢 {veh.availability_status}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="empty-services-card">
                            <div className="empty-icon-circle">🚍</div>
                            <h3>No Transportation Agency Added Yet</h3>
                            <p>You haven't added your transportation agency details yet. Click below to add your agency.</p>
                            <button
                                className="create-hotel-btn"
                                onClick={() => navigate("/provider/add-transportation")}
                            >
                                + Add Transportation Agency Details
                            </button>
                        </div>
                    )
                ) : serviceType === "Hotel" ? (
                    /* ================= HOTEL OWNER SERVICE VIEW ================= */
                    hotel ? (
                        <div className="services-details-wrapper">
                            <div className="hotel-details-card">
                                {hotel.images && hotel.images.length > 0 && (
                                    <div className="hotel-gallery-section">
                                        <div className="main-image-container">
                                            <img
                                                src={`http://127.0.0.1:8000${hotel.images[activeImage]?.image}`}
                                                alt={hotel.hotel_name}
                                                className="hotel-main-img"
                                            />
                                            <span className="hotel-type-badge">🏨 Hotel</span>
                                        </div>
                                        {hotel.images.length > 1 && (
                                            <div className="thumbnail-row">
                                                {hotel.images.map((img, idx) => (
                                                    <img
                                                        key={img.image_id}
                                                        src={`http://127.0.0.1:8000${img.image}`}
                                                        alt={`Thumbnail ${idx + 1}`}
                                                        className={`thumbnail-img ${
                                                            activeImage === idx ? "active" : ""
                                                        }`}
                                                        onClick={() => setActiveImage(idx)}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="hotel-info-header-row">
                                    <div>
                                        {!hotel.images?.length && (
                                            <span className="hotel-type-badge">🏨 Hotel Service</span>
                                        )}
                                        <h1 className="hotel-name-title">{hotel.hotel_name}</h1>
                                        <p className="hotel-address-text">
                                            📍 <strong>{hotel.address}</strong>, {hotel.district}{" "}
                                            <span className="location-tag">({hotel.location})</span>
                                        </p>
                                    </div>
                                    <div style={{ display: "flex", gap: "10px" }}>
                                        <button
                                            className="edit-hotel-btn"
                                            onClick={() => setIsEditHotelOpen(true)}
                                        >
                                            ✏️ Edit Details
                                        </button>
                                        <button
                                            className="edit-hotel-btn"
                                            style={{ background: "#ef4444", borderColor: "#ef4444", color: "white" }}
                                            onClick={() => handleDeleteHotel(hotel.hotel_id, hotel.hotel_name)}
                                        >
                                            🗑️ Delete Service
                                        </button>
                                    </div>
                                </div>

                                <div className="hotel-info-grid">
                                    <div className="info-box">
                                        <span className="info-label">📞 Contact Number</span>
                                        <span className="info-value">{hotel.contact_number}</span>
                                    </div>
                                    <div className="info-box">
                                        <span className="info-label">✉️ Email Address</span>
                                        <span className="info-value">{hotel.email}</span>
                                    </div>
                                    <div className="info-box">
                                        <span className="info-label">🕐 Check-in Time</span>
                                        <span className="info-value">{hotel.check_in_time}</span>
                                    </div>
                                    <div className="info-box">
                                        <span className="info-label">🕚 Check-out Time</span>
                                        <span className="info-value">{hotel.check_out_time}</span>
                                    </div>
                                </div>

                                {hotel.description && (
                                    <div className="hotel-section-block">
                                        <h3>About Hotel</h3>
                                        <p className="hotel-description-text">{hotel.description}</p>
                                    </div>
                                )}

                                {hotel.facilities && hotel.facilities.length > 0 && (
                                    <div className="hotel-section-block">
                                        <h3>Hotel Facilities</h3>
                                        <div className="facilities-grid">
                                            {hotel.facilities.map((fac) => (
                                                <div key={fac.facility_id} className="facility-item-chip">
                                                    <span className="chip-icon">✓</span>
                                                    <span>{fac.facility_name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="rooms-section-card">
                                <div className="rooms-header-bar">
                                    <div>
                                        <h3>Added Rooms ({hotel.rooms ? hotel.rooms.length : 0})</h3>
                                        <p>Available room types registered for this hotel</p>
                                    </div>
                                </div>

                                {!hotel.rooms || hotel.rooms.length === 0 ? (
                                    <div className="empty-rooms-container">
                                        <div className="empty-room-icon">🛏️</div>
                                        <h4>No Rooms Added Yet</h4>
                                        <p>Click "+ Add Room" above to add room types for {hotel.hotel_name}.</p>
                                    </div>
                                ) : (
                                    <div className="rooms-grid-list">
                                        {hotel.rooms.map((room) => (
                                            <div key={room.room_id} className="room-card-item">
                                                <div className="room-card-img-wrapper">
                                                    {room.images && room.images.length > 0 ? (
                                                        <img
                                                            src={`http://127.0.0.1:8000${room.images[0].image}`}
                                                            alt={room.room_name}
                                                            className="room-img"
                                                        />
                                                    ) : (
                                                        <div className="room-img-placeholder">🛏️ No Image</div>
                                                    )}
                                                    <span className="room-price-badge">
                                                        ₹{room.price_per_night} <sub>/ night</sub>
                                                    </span>
                                                </div>
                                                <div className="room-card-content">
                                                    <div className="room-title-actions">
                                                        <h4 className="room-title">{room.room_name}</h4>
                                                        <div className="room-action-buttons">
                                                            <button
                                                                className="btn-room-edit"
                                                                title="Edit Room"
                                                                onClick={() => setEditingRoom(room)}
                                                            >
                                                                ✏️
                                                            </button>
                                                            <button
                                                                className="btn-room-delete"
                                                                title="Delete Room"
                                                                onClick={() =>
                                                                    handleDeleteRoom(
                                                                        room.room_id,
                                                                        room.room_name
                                                                    )
                                                                }
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {room.description && (
                                                        <p className="room-description">
                                                            {room.description}
                                                        </p>
                                                    )}
                                                    <div className="room-specs">
                                                        <span className="spec-tag">
                                                            🚪 {room.total_rooms} Rooms
                                                        </span>
                                                        <span className="spec-tag">
                                                            👥 Max {room.maximum_guests} Guests
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="empty-services-card">
                            <div className="empty-icon-circle">🏨</div>
                            <h3>No Hotel Added Yet</h3>
                            <p>You haven't added details for your hotel yet. Click below to add your hotel information.</p>
                            <button
                                className="create-hotel-btn"
                                onClick={() => navigate("/provider/add-hotel")}
                            >
                                + Add Hotel Details
                            </button>
                        </div>
                    )
                ) : serviceType === "Restaurant" ? (
                    /* ================= RESTAURANT OWNER SERVICE VIEW ================= */
                    restaurant ? (
                        <div className="services-details-wrapper">
                            <div className="hotel-details-card">
                                {restaurant.images && restaurant.images.length > 0 && (
                                    <div className="hotel-gallery-section">
                                        <div className="main-image-container">
                                            <img
                                                src={`http://127.0.0.1:8000${restaurant.images[activeImage]?.image}`}
                                                alt={restaurant.restaurant_name}
                                                className="hotel-main-img"
                                            />
                                            <span className="hotel-type-badge">🍽️ Restaurant</span>
                                        </div>
                                    </div>
                                )}

                                <div className="hotel-info-header-row">
                                    <div>
                                        <span className="hotel-type-badge">🍽️ Restaurant Service</span>
                                        <h1 className="hotel-name-title">{restaurant.restaurant_name}</h1>
                                        <p className="hotel-address-text">
                                            📍 <strong>{restaurant.address}</strong>, {restaurant.district} <span className="location-tag">({restaurant.location})</span>
                                        </p>
                                    </div>
                                    <div style={{ display: "flex", gap: "10px" }}>
                                        <button
                                            className="edit-hotel-btn"
                                            onClick={() => setIsEditRestaurantOpen(true)}
                                        >
                                            ✏️ Edit Details
                                        </button>
                                        <button
                                            className="edit-hotel-btn"
                                            style={{ background: "#ef4444", borderColor: "#ef4444", color: "white" }}
                                            onClick={() => handleDeleteRestaurant(restaurant.restaurant_id, restaurant.restaurant_name)}
                                        >
                                            🗑️ Delete Service
                                        </button>
                                    </div>
                                </div>

                                <div className="hotel-info-grid">
                                    <div className="info-box">
                                        <span className="info-label">🍲 Cuisine Type</span>
                                        <span className="info-value">{restaurant.cuisine_type}</span>
                                    </div>
                                    <div className="info-box">
                                        <span className="info-label">📞 Contact Phone</span>
                                        <span className="info-value">{restaurant.contact_number}</span>
                                    </div>
                                    <div className="info-box">
                                        <span className="info-label">✉️ Email Address</span>
                                        <span className="info-value">{restaurant.email}</span>
                                    </div>
                                    <div className="info-box">
                                        <span className="info-label">⏰ Opening Hours</span>
                                        <span className="info-value">{restaurant.opening_time} - {restaurant.closing_time}</span>
                                    </div>
                                </div>

                                {restaurant.description && (
                                    <div className="hotel-section-block">
                                        <h3>About Restaurant</h3>
                                        <p className="hotel-description-text">{restaurant.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="empty-services-card">
                            <div className="empty-icon-circle">🍽️</div>
                            <h3>No Restaurant Added Yet</h3>
                            <p>Click below to add your restaurant details.</p>
                            <button
                                className="create-hotel-btn"
                                onClick={() => navigate("/provider/add-restaurant")}
                            >
                                + Add Restaurant Details
                            </button>
                        </div>
                    )
                ) : (
                    /* ================= ACTIVITY OWNER SERVICE VIEW ================= */
                    activity ? (
                        <div className="services-details-wrapper">
                            <div className="hotel-details-card">
                                {activity.images && activity.images.length > 0 && (
                                    <div className="hotel-gallery-section">
                                        <div className="main-image-container">
                                            <img
                                                src={`http://127.0.0.1:8000${activity.images[activeImage]?.image}`}
                                                alt={activity.activity_name}
                                                className="hotel-main-img"
                                            />
                                            <span className="hotel-type-badge">🧗 Activity Center</span>
                                        </div>
                                    </div>
                                )}

                                <div className="hotel-info-header-row">
                                    <div>
                                        <span className="hotel-type-badge">🧗 Adventure Park / Center</span>
                                        <h1 className="hotel-name-title">{activity.activity_name}</h1>
                                        <p className="hotel-address-text">
                                            📍 Spot: <strong>{activity.location}</strong>, {activity.district}
                                        </p>
                                    </div>
                                    <div style={{ display: "flex", gap: "10px" }}>
                                        <button
                                            className="edit-hotel-btn"
                                            onClick={() => setIsEditActivityOpen(true)}
                                        >
                                            ✏️ Edit Details
                                        </button>
                                        <button
                                            className="edit-hotel-btn"
                                            style={{ background: "#ef4444", borderColor: "#ef4444", color: "white" }}
                                            onClick={() => handleDeleteActivity(activity.activity_id, activity.activity_name)}
                                        >
                                            🗑️ Delete Service
                                        </button>
                                    </div>
                                </div>

                                <div className="hotel-info-grid">
                                    <div className="info-box">
                                        <span className="info-label">📞 Contact Phone</span>
                                        <span className="info-value">{activity.contact_number}</span>
                                    </div>
                                    <div className="info-box">
                                        <span className="info-label">✉️ Email Address</span>
                                        <span className="info-value">{activity.email}</span>
                                    </div>
                                    <div className="info-box">
                                        <span className="info-label">📍 District</span>
                                        <span className="info-value">{activity.district}</span>
                                    </div>
                                    <div className="info-box">
                                        <span className="info-label">🎯 Total Packages</span>
                                        <span className="info-value">{activity.items ? activity.items.length : 0} Package(s)</span>
                                    </div>
                                </div>

                                {activity.description && (
                                    <div className="hotel-section-block">
                                        <h3>About Activity Center</h3>
                                        <p className="hotel-description-text">{activity.description}</p>
                                    </div>
                                )}
                            </div>

                            {/* ACTIVITY PACKAGES LIST */}
                            <div className="rooms-section-card">
                                <div className="rooms-header-bar">
                                    <div>
                                        <h3>Activity Packages ({activity.items ? activity.items.length : 0})</h3>
                                        <p>Available activity packages registered for {activity.activity_name}</p>
                                    </div>
                                    <button
                                        className="single-add-room-btn"
                                        style={{ fontSize: "11px", padding: "8px 16px" }}
                                        onClick={() =>
                                            navigate("/provider/add-activity-item", {
                                                state: { activity_id: activity.activity_id },
                                            })
                                        }
                                    >
                                        + Add Activity Package
                                    </button>
                                </div>

                                {!activity.items || activity.items.length === 0 ? (
                                    <div className="empty-rooms-container">
                                        <div className="empty-room-icon">🧗</div>
                                        <h4>No Activity Packages Added Yet</h4>
                                        <p>Click "+ Add Activity Package" to offer zipline, kayaking, or trekking packages.</p>
                                    </div>
                                ) : (
                                    <div className="rooms-grid-list">
                                        {activity.items.map((item) => (
                                            <div key={item.item_id} className="room-card-item">
                                                <div className="room-card-img-wrapper">
                                                    {item.images && item.images.length > 0 ? (
                                                        <img
                                                            src={`http://127.0.0.1:8000${item.images[0].image}`}
                                                            alt={item.activity_title}
                                                            className="room-img"
                                                        />
                                                    ) : (
                                                        <div className="room-img-placeholder">🧗 No Image</div>
                                                    )}
                                                    <span className="room-price-badge">
                                                        ₹{item.price} <sub>/ person</sub>
                                                    </span>
                                                </div>
                                                <div className="room-card-content">
                                                    <div className="room-title-actions">
                                                        <h4 className="room-title">{item.activity_title}</h4>
                                                        <div className="room-action-buttons">
                                                            <button
                                                                className="btn-room-edit"
                                                                title="Edit Activity Package"
                                                                onClick={() => setEditingActivityItem(item)}
                                                            >
                                                                ✏️
                                                            </button>
                                                            <button
                                                                className="btn-room-delete"
                                                                title="Delete Activity Package"
                                                                onClick={() => handleDeleteActivityItem(item.item_id, item.activity_title)}
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="room-description">{item.description}</p>
                                                    <div className="room-specs">
                                                        <span className="spec-tag">⏱️ {item.duration}</span>
                                                        <span className="spec-tag">👥 Max {item.capacity} Persons</span>
                                                        <span className="spec-tag">📅 {item.available_times}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="empty-services-card">
                            <div className="empty-icon-circle">🧗</div>
                            <h3>No Activity Center Added Yet</h3>
                            <p>Click below to add your activity center details.</p>
                            <button
                                className="create-hotel-btn"
                                onClick={() => navigate("/provider/add-activity")}
                            >
                                + Add Activity Center Details
                            </button>
                        </div>
                    )
                )}
            </main>

            {/* EDIT HOTEL MODAL */}
            <EditHotelModal
                hotel={hotel}
                isOpen={isEditHotelOpen}
                onClose={() => setIsEditHotelOpen(false)}
                onHotelUpdated={() => fetchProviderInfo()}
            />

            {/* EDIT RESTAURANT MODAL */}
            <EditRestaurantModal
                restaurant={restaurant}
                isOpen={isEditRestaurantOpen}
                onClose={() => setIsEditRestaurantOpen(false)}
                onRestaurantUpdated={() => fetchProviderInfo()}
            />

            {/* EDIT TRANSPORTATION MODAL */}
            <EditTransportationModal
                transportation={transportation}
                isOpen={isEditTransportationOpen}
                onClose={() => setIsEditTransportationOpen(false)}
                onTransportationUpdated={() => fetchProviderInfo()}
            />

            {/* EDIT ACTIVITY MODAL */}
            <EditActivityModal
                activity={activity}
                isOpen={isEditActivityOpen}
                onClose={() => setIsEditActivityOpen(false)}
                onActivityUpdated={() => fetchProviderInfo()}
            />

            {/* EDIT VEHICLE MODAL */}
            <EditVehicleModal
                vehicle={editingVehicle}
                isOpen={Boolean(editingVehicle)}
                onClose={() => setEditingVehicle(null)}
                onVehicleUpdated={() => fetchProviderInfo()}
            />

            {/* EDIT ACTIVITY ITEM MODAL */}
            <EditActivityItemModal
                item={editingActivityItem}
                isOpen={Boolean(editingActivityItem)}
                onClose={() => setEditingActivityItem(null)}
                onItemUpdated={() => fetchProviderInfo()}
            />

            {/* EDIT ROOM MODAL */}
            <EditRoomModal
                room={editingRoom}
                isOpen={Boolean(editingRoom)}
                onClose={() => setEditingRoom(null)}
                onRoomUpdated={() => fetchProviderInfo()}
            />
        </div>
    );
}
