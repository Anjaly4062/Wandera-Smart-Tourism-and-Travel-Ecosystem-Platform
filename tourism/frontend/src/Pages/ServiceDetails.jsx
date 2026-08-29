import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import Navbar from "../Components/Navbar";
import "../styles/ServiceDetails.css";

export default function ServiceDetails() {
    const { providerId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [addingId, setAddingId] = useState(null);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        getServiceDetails();
    }, [providerId]);

    const getServiceDetails = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(`service-details/${providerId}/`);
            if (response.data?.provider) {
                setProvider(response.data.provider);
            }
        } catch (err) {
            console.error("Error fetching service details:", err);
            setError(err.response?.data?.message || "Unable to load service details.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddToTrip = async (options = {}, replace = false) => {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
            navigate("/login", {
                state: { returnUrl: location.pathname + location.search }
            });
            return;
        }

        const triggerId = options.room_id || options.vehicle_id || options.activity_item_id || providerId;

        try {
            setAddingId(triggerId);
            const payload = {
                user_id: userId,
                provider_id: providerId,
                destination_id: provider?.destination?.destination_id || provider?.destination,
                room_id: options.room_id || null,
                vehicle_id: options.vehicle_id || null,
                activity_item_id: options.activity_item_id || null,
                replace: replace
            };

            const response = await api.post("trip-cart/add/", payload);

            if (response.data?.already_in_cart) {
                setNotification({
                    type: "info",
                    message: response.data.message || `${provider.business_name} is already in your Trip Cart.`
                });
            } else {
                setNotification({
                    type: "success",
                    message: response.data?.message || `${provider.business_name} added to your Trip Cart!`
                });
            }
        } catch (err) {
            if (err.response?.status === 409 && err.response?.data?.has_existing_category) {
                const confirmReplace = window.confirm(
                    `${err.response.data.error}\n\nWould you like to replace '${err.response.data.existing_provider_name}' with '${provider.business_name}'?`
                );
                if (confirmReplace) {
                    handleAddToTrip(options, true);
                    return;
                }
            } else {
                setNotification({
                    type: "error",
                    message: err.response?.data?.error || "Failed to add service to trip."
                });
            }
        } finally {
            setAddingId(null);
        }
    };

    const getImageUrl = (image) => {
        if (!image) return "";
        if (image.startsWith("http")) return image;
        return `http://127.0.0.1:8000${image}`;
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="service-loading">
                    <div className="loading-spinner"></div>
                    <h2>Loading service details...</h2>
                </div>
            </>
        );
    }

    if (error || !provider) {
        return (
            <>
                <Navbar />
                <div className="service-error">
                    <h2>Service Not Found</h2>
                    <p>{error || "The requested service could not be found."}</p>
                    <button onClick={() => navigate(-1)}>← Go Back</button>
                </div>
            </>
        );
    }

    const hotel = provider.hotel;
    const restaurant = provider.restaurant;
    const transportation = provider.transportation;
    const activity = provider.activity;

    const serviceTitle =
        hotel?.hotel_name ||
        restaurant?.restaurant_name ||
        transportation?.service_name ||
        activity?.activity_name ||
        provider.business_name;

    const serviceLocation =
        hotel?.location ||
        hotel?.address ||
        restaurant?.location ||
        restaurant?.address ||
        transportation?.starting_location ||
        activity?.location ||
        provider.location ||
        provider.address ||
        "Location not available";

    const images =
        hotel?.images ||
        restaurant?.images ||
        transportation?.images ||
        activity?.images ||
        [];

    const description =
        hotel?.description ||
        restaurant?.description ||
        transportation?.description ||
        activity?.description ||
        provider.description;

    return (
        <div className="service-details-page">
            <Navbar />

            {/* Notification Toast */}
            {notification && (
                <div className={`trip-notification-toast ${notification.type}`}>
                    <span>{notification.message}</span>
                    <div className="toast-actions">
                        <button
                            className="toast-plan-btn"
                            onClick={() => navigate("/plan-your-trip")}
                        >
                            Plan Your Trip →
                        </button>
                        <button
                            className="toast-close-btn"
                            onClick={() => setNotification(null)}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* HERO SECTION */}
            <section className="service-hero">
                <div className="service-hero-overlay"></div>
                <div className="service-hero-content">
                    <span className="service-type-badge">{provider.service_type}</span>
                    <h1>{serviceTitle}</h1>
                    <p>📍 {serviceLocation}</p>
                    <div className="hero-action-row" style={{ marginTop: "12px" }}>
                        <button
                            className="add-to-trip-hero-btn"
                            onClick={() => handleAddToTrip()}
                            disabled={addingId === providerId}
                            style={{
                                background: "#ffffff",
                                color: "#1c2621",
                                border: "1px solid #ccd2cf",
                                padding: "7px 16px",
                                borderRadius: "6px",
                                fontWeight: "600",
                                fontSize: "12.5px",
                                cursor: "pointer"
                            }}
                        >
                            {addingId === providerId ? "Adding to Trip..." : "+ Add to Trip"}
                        </button>
                    </div>
                </div>
            </section>

            {/* MAIN CONTAINER */}
            <main className="service-container">
                {/* BACK BUTTON AT TOP RIGHT BELOW NAVBAR */}
                <div className="service-back-wrapper">
                    <button className="service-back-button" onClick={() => navigate(-1)}>
                        ← Back to Services
                    </button>
                </div>

                {/* IMAGES GALLERY */}
                {images && images.length > 0 && (
                    <section className="hotel-gallery-section">
                        <div className="section-heading">
                            <span>GALLERY</span>
                            <h2>{serviceTitle}</h2>
                        </div>
                        <div className="hotel-gallery">
                            {images.map((img) => (
                                <div className="gallery-image" key={img.image_id}>
                                    <img src={getImageUrl(img.image)} alt={serviceTitle} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ABOUT SECTION */}
                <section className="hotel-about-section">
                    <div className="section-heading">
                        <span>ABOUT</span>
                        <h2>{serviceTitle}</h2>
                    </div>
                    <p className="hotel-description">
                        {description || "No description available."}
                    </p>
                </section>

                {/* HOTEL SPECIFIC - ROOMS */}
                {hotel?.rooms && hotel.rooms.length > 0 && (
                    <section className="hotel-rooms-section">
                        <div className="section-heading">
                            <span>ACCOMMODATION</span>
                            <h2>Available Rooms</h2>
                        </div>
                        <div className="rooms-grid">
                            {hotel.rooms.map((room) => (
                                <div className="room-detail-card" key={room.room_id}>
                                    {room.images && room.images.length > 0 && (
                                        <div className="room-main-image">
                                            <img src={getImageUrl(room.images[0].image)} alt={room.room_name} />
                                        </div>
                                    )}
                                    <div className="room-content">
                                        <h3>{room.room_name}</h3>
                                        <p className="room-description">{room.description}</p>
                                        <div className="room-info">
                                            <div>
                                                <span>👥</span>
                                                <p>Max Guests</p>
                                                <strong>{room.maximum_guests}</strong>
                                            </div>
                                            <div>
                                                <span>🏠</span>
                                                <p>Total Rooms</p>
                                                <strong>{room.total_rooms}</strong>
                                            </div>
                                        </div>
                                        <div className="room-price">
                                            <span>Starting from</span>
                                            <strong>₹{room.price_per_night}</strong>
                                            <small>/ night</small>
                                        </div>
                                        <button
                                            className="select-item-trip-btn"
                                            onClick={() => handleAddToTrip({ room_id: room.room_id })}
                                            disabled={addingId === room.room_id}
                                            style={{
                                                marginTop: "10px",
                                                width: "100%",
                                                background: "#1c2621",
                                                color: "#ffffff",
                                                border: "none",
                                                padding: "7px 12px",
                                                borderRadius: "5px",
                                                fontWeight: "500",
                                                fontSize: "12px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            {addingId === room.room_id ? "Adding..." : "+ Select Room for Trip"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* TRANSPORTATION SPECIFIC - VEHICLES FLEET */}
                {transportation?.vehicles && transportation.vehicles.length > 0 && (
                    <section className="hotel-rooms-section">
                        <div className="section-heading">
                            <span>FLEET VEHICLES</span>
                            <h2>Available Vehicles for Rent/Booking</h2>
                        </div>
                        <div className="rooms-grid">
                            {transportation.vehicles.map((veh) => (
                                <div className="room-detail-card" key={veh.vehicle_id}>
                                    {veh.images && veh.images.length > 0 && (
                                        <div className="room-main-image">
                                            <img src={getImageUrl(veh.images[0].image)} alt={veh.vehicle_name} />
                                        </div>
                                    )}
                                    <div className="room-content">
                                        <h3>{veh.vehicle_name}</h3>
                                        <p className="room-description">{veh.description || veh.vehicle_type}</p>
                                        <div className="room-info">
                                            <div>
                                                <span>🚘</span>
                                                <p>Type</p>
                                                <strong>{veh.vehicle_type}</strong>
                                            </div>
                                            <div>
                                                <span>👥</span>
                                                <p>Capacity</p>
                                                <strong>{veh.seating_capacity} Seats</strong>
                                            </div>
                                        </div>
                                        <div className="room-price">
                                            <span>Rate / Fare</span>
                                            <strong>₹{veh.price_fare}</strong>
                                            <small>{veh.fare_unit}</small>
                                        </div>
                                        <button
                                            className="select-item-trip-btn"
                                            onClick={() => handleAddToTrip({ vehicle_id: veh.vehicle_id })}
                                            disabled={addingId === veh.vehicle_id}
                                            style={{
                                                marginTop: "10px",
                                                width: "100%",
                                                background: "#1c2621",
                                                color: "#ffffff",
                                                border: "none",
                                                padding: "7px 12px",
                                                borderRadius: "5px",
                                                fontWeight: "500",
                                                fontSize: "12px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            {addingId === veh.vehicle_id ? "Adding..." : "+ Select Vehicle for Trip"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ACTIVITY SPECIFIC - PACKAGES */}
                {activity?.items && activity.items.length > 0 && (
                    <section className="hotel-rooms-section">
                        <div className="section-heading">
                            <span>EXPERIENCES</span>
                            <h2>Available Activity Packages</h2>
                        </div>
                        <div className="rooms-grid">
                            {activity.items.map((item) => (
                                <div className="room-detail-card" key={item.item_id}>
                                    {item.images && item.images.length > 0 && (
                                        <div className="room-main-image">
                                            <img src={getImageUrl(item.images[0].image)} alt={item.activity_title} />
                                        </div>
                                    )}
                                    <div className="room-content">
                                        <h3>{item.activity_title}</h3>
                                        <p className="room-description">{item.description}</p>
                                        <div className="room-info">
                                            <div>
                                                <span>⏱️</span>
                                                <p>Duration</p>
                                                <strong>{item.duration}</strong>
                                            </div>
                                            <div>
                                                <span>👥</span>
                                                <p>Capacity</p>
                                                <strong>{item.capacity} Persons</strong>
                                            </div>
                                        </div>
                                        <div className="room-price">
                                            <span>Price</span>
                                            <strong>₹{item.price}</strong>
                                            <small>/ person</small>
                                        </div>
                                        <button
                                            className="select-item-trip-btn"
                                            onClick={() => handleAddToTrip({ activity_item_id: item.item_id })}
                                            disabled={addingId === item.item_id}
                                            style={{
                                                marginTop: "10px",
                                                width: "100%",
                                                background: "#1c2621",
                                                color: "#ffffff",
                                                border: "none",
                                                padding: "7px 12px",
                                                borderRadius: "5px",
                                                fontWeight: "500",
                                                fontSize: "12px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            {addingId === item.item_id ? "Adding..." : "+ Select Package for Trip"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* SERVICE PROVIDER CARD */}
                <section className="provider-section">
                    <div className="section-heading">
                        <span>SERVICE PROVIDER</span>
                        <h2>Contact & Info</h2>
                    </div>
                    <div className="provider-card">
                        <div>
                            <span>Business Name</span>
                            <strong>{provider.business_name}</strong>
                        </div>
                        <div>
                            <span>Service Type</span>
                            <strong>{provider.service_type}</strong>
                        </div>
                        {(provider.phone || hotel?.contact_number || restaurant?.contact_number || transportation?.contact_number || activity?.contact_number) && (
                            <div>
                                <span>Phone</span>
                                <strong>
                                    {provider.phone ||
                                        hotel?.contact_number ||
                                        restaurant?.contact_number ||
                                        transportation?.contact_number ||
                                        activity?.contact_number}
                                </strong>
                            </div>
                        )}
                        {(provider.email || hotel?.email || restaurant?.email || transportation?.email || activity?.email) && (
                            <div>
                                <span>Email</span>
                                <strong>
                                    {provider.email ||
                                        hotel?.email ||
                                        restaurant?.email ||
                                        transportation?.email ||
                                        activity?.email}
                                </strong>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}