import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import Navbar from "../Components/Navbar";
import DestinationMapView, { calculateHaversineDistance } from "../Components/DestinationMapView";
import "../styles/DestinationDetails.css";

export default function DestinationDetails() {

    const { destinationId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [destination, setDestination] = useState(null);

    const [services, setServices] = useState({
        hotels: [],
        restaurants: [],
        transportation: [],
        activities: []
    });

    const [activeCategory, setActiveCategory] = useState("hotels");

    const [loading, setLoading] = useState(true);
    const [addingProviderId, setAddingProviderId] = useState(null);
    const [notification, setNotification] = useState(null);

    useEffect(() => {

        getDestinationDetails();

    }, [destinationId]);


    const getDestinationDetails = async () => {

        try {

            const response = await api.get(
                `destination-details/${destinationId}/`
            );

            console.log(
                "Destination Details:",
                response.data
            );

            setDestination(
                response.data.destination
            );

            setServices({

                hotels:
                    response.data.hotels || [],

                restaurants:
                    response.data.restaurants || [],

                transportation:
                    response.data.transportation || [],

                activities:
                    response.data.activities || []

            });

        } catch (error) {

            console.error(
                "Error fetching destination:",
                error
            );

        } finally {

            setLoading(false);

        }
    };


    const getImageUrl = (image) => {

        if (!image) {
            return "";
        }

        if (image.startsWith("http")) {
            return image;
        }

        return `http://127.0.0.1:8000${image}`;
    };


    const handleServiceClick = (providerId) => {

        navigate(`/service/${providerId}`);

    };

    const handleAddToTrip = async (service, replace = false) => {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
            // Preserve current page location so user returns here after login
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
                destination_id: destinationId,
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


    /*
     * Category names (Only the 4 supported service types)
     */

    const categories = [

        {
            key: "hotels",
            label: "Hotels"
        },

        {
            key: "restaurants",
            label: "Restaurants"
        },

        {
            key: "transportation",
            label: "Transportation"
        },

        {
            key: "activities",
            label: "Activities"
        }

    ];


    if (loading) {

        return (

            <>
                <Navbar />

                <div className="destination-loading">

                    <h2>
                        Loading...
                    </h2>

                </div>

            </>

        );

    }


    if (!destination) {

        return (

            <>
                <Navbar />

                <div className="destination-error">

                    <h2>
                        Destination not found
                    </h2>

                </div>

            </>

        );

    }


    /*
     * Currently selected services
     */

    const currentServices =
        services[activeCategory] || [];


    /*
     * Current category label
     */

    const currentCategory =
        categories.find(
            category =>
                category.key === activeCategory
        )?.label;


    return (

        <div className="destination-details-page">

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


            {/* ==================================
                DESTINATION HERO
            ================================== */}

            <section className="destination-detail-hero">

                <img
                    src={getImageUrl(
                        destination.image
                    )}
                    alt={destination.name}
                />

                <div className="hero-dark-overlay"></div>

                <div className="destination-detail-content">

                    <span className="destination-category">

                        {destination.category}

                    </span>

                    <h1>
                        {destination.name}
                    </h1>

                    <p>
                        📍 {destination.location}
                    </p>

                </div>

            </section>


            {/* ==================================
                DESTINATION DETAILS
            ================================== */}

            <section className="destination-about">

                <span className="section-small-title">
                    DISCOVER
                </span>

                <h2>
                    About {destination.name}
                </h2>

                <p className="destination-description">

                    {destination.description}

                </p>


                <div className="destination-info-boxes">

                    <div className="destination-info-box">

                        <div className="info-icon">
                            📍
                        </div>

                        <div>

                            <small>
                                District
                            </small>

                            <strong>
                                {destination.district}
                            </strong>

                        </div>

                    </div>


                    <div className="destination-info-box">

                        <div className="info-icon">
                            🗺️
                        </div>

                        <div>

                            <small>
                                Location
                            </small>

                            <strong>
                                {destination.location}
                            </strong>

                        </div>

                    </div>

                </div>

            </section>


            {/* ==================================
                DESTINATION MAP & NEARBY LOCATION
            ================================== */}
            <section className="destination-map-section" style={{ maxWidth: "1150px", margin: "0 auto", padding: "0 30px" }}>
                <DestinationMapView
                    destination={destination}
                    services={services}
                />
            </section>


            {/* ==================================
                NEARBY SERVICES
            ================================== */}

            <section className="nearby-services">

                <div className="nearby-heading">

                    <span className="section-small-title">
                        EXPLORE NEARBY
                    </span>

                    <h2>
                        Services Near {destination.name}
                    </h2>

                    <p>
                        Find hotels, restaurants,
                        activities and other services
                        near this destination.
                    </p>

                </div>


                {/* ==================================
                    SERVICE CATEGORY NAVIGATION
                ================================== */}

                <div className="service-category-nav">

                    {categories.map((category) => (

                        <button
                            key={category.key}
                            className={
                                activeCategory === category.key
                                    ? "service-category active"
                                    : "service-category"
                            }
                            onClick={() =>
                                setActiveCategory(
                                    category.key
                                )
                            }
                        >

                            {category.label}

                        </button>

                    ))}

                </div>


                {/* ==================================
                    SELECTED SERVICE CATEGORY
                ================================== */}

                <div className="selected-service-section">

                    <div className="selected-service-heading">

                        <h3>
                            {currentCategory} Near{" "}
                            {destination.name}
                        </h3>

                        <span>
                            {currentServices.length} available
                        </span>

                    </div>


                    {/* ==================================
                        NO SERVICES
                    ================================== */}

                    {currentServices.length === 0 ? (

                        <div className="no-services">

                            <div className="no-service-icon">
                                🔍
                            </div>

                            <h4>
                                No {currentCategory.toLowerCase()}
                                available
                            </h4>

                            <p>
                                There are currently no{" "}
                                {currentCategory.toLowerCase()}
                                registered near this destination.
                            </p>

                        </div>

                    ) : (


                        /* ==================================
                           SERVICE CARDS
                        ================================== */

                        <div className="services-grid">
                            {currentServices.map((service) => (
                                <div className="nearby-service-card" key={service.provider_id}>
                                    <div className="service-card-body">
                                        <span className="service-badge">
                                            {service.service_type}
                                        </span>

                                        <h4>{service.business_name}</h4>

                                        <p>
                                            📍{" "}
                                            {service.location ||
                                                service.address ||
                                                "Location not available"}
                                        </p>

                                        {destination?.latitude && destination?.longitude && service.latitude && service.longitude && (
                                            <p style={{ margin: "2px 0 6px 0", fontSize: "12px", color: "#059669", fontWeight: "600" }}>
                                                📏 {calculateHaversineDistance(destination.latitude, destination.longitude, service.latitude, service.longitude)} from {destination.name}
                                            </p>
                                        )}

                                        {service.description && (
                                            <p className="service-description">
                                                {service.description.length > 120
                                                    ? service.description.substring(0, 120) + "..."
                                                    : service.description}
                                            </p>
                                        )}

                                        <div className="service-card-actions">
                                            <button
                                                className="service-details-link"
                                                onClick={() => handleServiceClick(service.provider_id)}
                                            >
                                                View Details →
                                            </button>
                                            <button
                                                className="add-to-trip-btn"
                                                onClick={() => handleAddToTrip(service)}
                                                disabled={addingProviderId === service.provider_id}
                                            >
                                                {addingProviderId === service.provider_id
                                                    ? "Adding..."
                                                    : "+ Add to Trip"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    )}

                </div>

            </section>

        </div>

    );

}