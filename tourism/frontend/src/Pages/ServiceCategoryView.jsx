import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import Navbar from "../Components/Navbar";
import "../styles/ServicesView.css";

export default function ServiceCategoryView({
    serviceType = "Hotel",
    title = "Explore Hotels",
    fallbackIcon = "🏨",
    searchPlaceholder = "Search by name, location, district, or facilities..."
}) {
    const navigate = useNavigate();
    const location = useLocation();

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [addingProviderId, setAddingProviderId] = useState(null);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        getServices();
    }, [serviceType]);

    const getServices = async () => {
        try {
            setLoading(true);
            const response = await api.get(`services/${serviceType}/`);
            setServices(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error(`Error fetching ${serviceType} services:`, error);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (image) => {
        if (!image) return "";
        if (image.startsWith("http")) return image;
        return `http://127.0.0.1:8000${image.startsWith("/") ? "" : "/"}${image}`;
    };

    const getFirstImage = (service) => {
        const hotelImg = service.hotel?.images?.[0]?.image;
        if (hotelImg) return getImageUrl(hotelImg);

        const restImg = service.restaurant?.images?.[0]?.image;
        if (restImg) return getImageUrl(restImg);

        const transImg = service.transportation?.images?.[0]?.image;
        if (transImg) return getImageUrl(transImg);

        const actImg = service.activity?.images?.[0]?.image;
        if (actImg) return getImageUrl(actImg);

        return null;
    };

    const handleAddToTrip = async (service, replace = false) => {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
            navigate("/login", {
                state: { returnUrl: location.pathname + location.search }
            });
            return;
        }

        try {
            setAddingProviderId(service.provider_id);
            const response = await api.post("trip-cart/add/", {
                user_id: userId,
                provider_id: service.provider_id,
                destination_id: service.destination?.destination_id || service.destination || null,
                replace: replace
            });

            if (response.data?.already_in_cart) {
                setNotification({
                    type: "info",
                    message: response.data.message || `${service.business_name} is already in your Trip Cart.`
                });
            } else {
                setNotification({
                    type: "success",
                    message: response.data?.message || `${service.business_name} added to your Trip Cart!`
                });
            }
        } catch (err) {
            if (err.response?.status === 409 && err.response?.data?.has_existing_category) {
                const confirmReplace = window.confirm(
                    `${err.response.data.error}\n\nWould you like to replace '${err.response.data.existing_provider_name}' with '${service.business_name}'?`
                );
                if (confirmReplace) {
                    handleAddToTrip(service, true);
                    return;
                }
            } else {
                setNotification({
                    type: "error",
                    message: err.response?.data?.error || "Failed to add service to trip."
                });
            }
        } finally {
            setAddingProviderId(null);
        }
    };

    // Client-side search filtering across multiple fields
    const filteredServices = services.filter((service) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase().trim();

        const nameMatch = service.business_name?.toLowerCase().includes(query);
        const locMatch = service.location?.toLowerCase().includes(query);
        const distMatch = service.district?.toLowerCase().includes(query);
        const areaMatch = service.area?.toLowerCase().includes(query);
        const destMatch = service.destination_name?.toLowerCase().includes(query);
        const descMatch = service.description?.toLowerCase().includes(query);

        // Sub-details match
        const hotelNameMatch = service.hotel?.hotel_name?.toLowerCase().includes(query);
        const restNameMatch = service.restaurant?.restaurant_name?.toLowerCase().includes(query);
        const transNameMatch = service.transportation?.service_name?.toLowerCase().includes(query);
        const actNameMatch = service.activity?.activity_name?.toLowerCase().includes(query);

        // Facilities match
        const hotelFacilitiesMatch = service.hotel?.facilities?.some(f => f.facility_name?.toLowerCase().includes(query));
        const restFacilitiesMatch = service.restaurant?.facilities?.some(f => f.facility_name?.toLowerCase().includes(query));

        return (
            nameMatch ||
            locMatch ||
            distMatch ||
            areaMatch ||
            destMatch ||
            descMatch ||
            hotelNameMatch ||
            restNameMatch ||
            transNameMatch ||
            actNameMatch ||
            hotelFacilitiesMatch ||
            restFacilitiesMatch
        );
    });

    return (
        <div className="services-view-page">
            {/* Top Navigation */}
            <Navbar />

            {/* Notification Toast */}
            {notification && (
                <div className={`trip-toast-notification ${notification.type}`}>
                    <span>{notification.message}</span>
                    <div className="toast-actions-wrap">
                        <button
                            className="toast-goto-trip-btn"
                            onClick={() => navigate("/plan-your-trip")}
                        >
                            Plan Your Trip →
                        </button>
                        <button
                            className="toast-dismiss-btn"
                            onClick={() => setNotification(null)}
                            title="Close"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            <div className="services-container">
                {/* Hero Header Section */}
                <section className="services-hero-section">
                    <div className="services-hero-flex">
                        <div className="services-hero-title-group">
                            <h2 className="services-hero-title">{title}</h2>
                            {!loading && (
                                <span className="services-count-badge">
                                    {filteredServices.length} {filteredServices.length === 1 ? "Available" : "Available"}
                                </span>
                            )}
                        </div>

                        {/* Search Input Bar */}
                        <div className="services-search-bar">
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="services-search-input"
                            />
                            {searchQuery && (
                                <button
                                    className="clear-search-btn"
                                    onClick={() => setSearchQuery("")}
                                    title="Clear search"
                                >
                                    ✕
                                </button>
                            )}
                            <span style={{ fontSize: "15px" }}>🔍</span>
                        </div>
                    </div>
                </section>

                {/* Loading State */}
                {loading ? (
                    <div className="services-loading-state">
                        <div className="services-spinner"></div>
                        <p>Loading {title.toLowerCase()}...</p>
                    </div>
                ) : (
                    /* Services Grid */
                    <div className="services-grid-list">
                        {filteredServices.length > 0 ? (
                            filteredServices.map((service) => {
                                const cardImage = getFirstImage(service);
                                const displayName =
                                    service.hotel?.hotel_name ||
                                    service.restaurant?.restaurant_name ||
                                    service.transportation?.service_name ||
                                    service.activity?.activity_name ||
                                    service.business_name;

                                const displayLocation =
                                    service.location ||
                                    service.address ||
                                    service.district ||
                                    "Location not specified";

                                const displayDesc =
                                    service.description ||
                                    service.hotel?.description ||
                                    service.restaurant?.description ||
                                    service.transportation?.description ||
                                    service.activity?.description ||
                                    "No description available.";

                                return (
                                    <div
                                        className="service-item-card"
                                        key={service.provider_id}
                                    >
                                        {/* Image Section */}
                                        <div className="service-card-image-wrap">
                                            {cardImage ? (
                                                <img
                                                    src={cardImage}
                                                    alt={displayName}
                                                    className="service-card-img"
                                                />
                                            ) : (
                                                <div className="service-fallback-image">
                                                    <span className="service-fallback-icon">
                                                        {fallbackIcon}
                                                    </span>
                                                    <span className="service-fallback-text">
                                                        {service.service_type}
                                                    </span>
                                                </div>
                                            )}

                                            <span className="service-card-badge">
                                                {service.service_type}
                                            </span>

                                            {service.destination_name && service.destination_name !== "None" && (
                                                <span className="service-card-destination-tag">
                                                    📍 {service.destination_name}
                                                </span>
                                            )}
                                        </div>

                                        {/* Card Body */}
                                        <div className="service-card-details">
                                            <h3>{displayName}</h3>

                                            <p className="service-card-location">
                                                📍 {displayLocation}
                                            </p>

                                            <p className="service-card-desc">
                                                {displayDesc}
                                            </p>

                                            {/* Key Specs / Highlights Chips */}
                                            <div className="service-specs-row">
                                                {service.hotel && (
                                                    <>
                                                        {service.hotel.rooms?.length > 0 && (
                                                            <span className="service-spec-chip">
                                                                🛏️ {service.hotel.rooms.length} Room {service.hotel.rooms.length === 1 ? "Type" : "Types"}
                                                            </span>
                                                        )}
                                                        {service.hotel.facilities?.slice(0, 2).map((fac) => (
                                                            <span className="service-spec-chip" key={fac.facility_id}>
                                                                ✓ {fac.facility_name}
                                                            </span>
                                                        ))}
                                                    </>
                                                )}

                                                {service.transportation && (
                                                    <>
                                                        {service.transportation.vehicles?.length > 0 && (
                                                            <span className="service-spec-chip">
                                                                🚘 {service.transportation.vehicles.length} {service.transportation.vehicles.length === 1 ? "Vehicle" : "Vehicles"}
                                                            </span>
                                                        )}
                                                        {service.transportation.starting_location && (
                                                            <span className="service-spec-chip">
                                                                🚩 {service.transportation.starting_location}
                                                            </span>
                                                        )}
                                                    </>
                                                )}

                                                {service.restaurant && (
                                                    <>
                                                        {service.restaurant.facilities?.slice(0, 2).map((fac) => (
                                                            <span className="service-spec-chip" key={fac.facility_id}>
                                                                ✓ {fac.facility_name}
                                                            </span>
                                                        ))}
                                                        {service.phone && (
                                                            <span className="service-spec-chip">
                                                                📞 {service.phone}
                                                            </span>
                                                        )}
                                                    </>
                                                )}

                                                {service.activity && (
                                                    <>
                                                        {service.activity.items?.length > 0 && (
                                                            <span className="service-spec-chip">
                                                                🎯 {service.activity.items.length} {service.activity.items.length === 1 ? "Activity" : "Activities"}
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="service-card-actions-row">
                                                <Link
                                                    to={`/service/${service.provider_id}`}
                                                    className="service-view-btn"
                                                >
                                                    View Details →
                                                </Link>

                                                {service.service_type !== "Restaurant" && (
                                                    <button
                                                        className="service-add-trip-btn"
                                                        onClick={() => handleAddToTrip(service)}
                                                        disabled={addingProviderId === service.provider_id}
                                                    >
                                                        {addingProviderId === service.provider_id
                                                            ? "Adding..."
                                                            : "+ Add to Trip"}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="services-empty-box">
                                <div className="services-empty-icon">{fallbackIcon}</div>
                                <h3>
                                    {searchQuery
                                        ? `No ${serviceType.toLowerCase()}s found matching "${searchQuery}"`
                                        : `No ${title} Available`}
                                </h3>
                                <p>
                                    {searchQuery
                                        ? "Try searching with a different name, district, or keyword."
                                        : `There are currently no ${serviceType.toLowerCase()} services registered in the system.`}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
