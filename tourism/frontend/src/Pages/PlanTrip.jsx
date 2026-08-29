import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../Components/Navbar";
import "../styles/PlanTrip.css";

export default function PlanTrip() {
    const navigate = useNavigate();
    const userId = localStorage.getItem("user_id");

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingInProgress, setBookingInProgress] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successBooking, setSuccessBooking] = useState(null);

    // Form inputs state for each service item mapped by cart_item_id (initially unselected/blank)
    const [itemDetails, setItemDetails] = useState({});

    useEffect(() => {
        if (!userId) {
            navigate("/login", {
                state: { returnUrl: "/plan-your-trip" }
            });
            return;
        }
        fetchTripCart();
    }, [userId]);

    const fetchTripCart = async () => {
        try {
            setLoading(true);
            setErrorMsg("");
            const response = await api.get(`trip-cart/${userId}/`);
            const cartData = response.data?.cart;
            setCart(cartData);

            // Initialize itemDetails state with only explicitly saved or empty values
            if (cartData && cartData.items) {
                const initialDetails = {};
                cartData.items.forEach((item) => {
                    const saved = item.booking_details || {};

                    if (item.service_type === "Hotel") {
                        initialDetails[item.cart_item_id] = {
                            room_id: item.room?.room_id ? String(item.room.room_id) : (saved.room_id ? String(saved.room_id) : ""),
                            check_in: saved.check_in || "",
                            check_out: saved.check_out || "",
                            rooms_count: saved.rooms_count || "",
                            guests_count: saved.guests_count || ""
                        };
                    } else if (item.service_type === "Transportation") {
                        initialDetails[item.cart_item_id] = {
                            vehicle_id: item.vehicle?.vehicle_id ? String(item.vehicle.vehicle_id) : (saved.vehicle_id ? String(saved.vehicle_id) : ""),
                            journey_date: saved.journey_date || "",
                            return_date: saved.return_date || "",
                            pickup_location: saved.pickup_location || "",
                            drop_location: saved.drop_location || "",
                            passengers_count: saved.passengers_count || ""
                        };
                    } else if (item.service_type === "Activity") {
                        initialDetails[item.cart_item_id] = {
                            activity_item_id: item.activity_item?.item_id ? String(item.activity_item.item_id) : (saved.activity_item_id ? String(saved.activity_item_id) : ""),
                            activity_date: saved.activity_date || "",
                            time_slot: saved.time_slot || "",
                            participants_count: saved.participants_count || ""
                        };
                    } else if (item.service_type === "Restaurant") {
                        initialDetails[item.cart_item_id] = {
                            reservation_date: saved.reservation_date || "",
                            reservation_time: saved.reservation_time || "",
                            guests_count: saved.guests_count || ""
                        };
                    }
                });
                setItemDetails(initialDetails);
            }
        } catch (err) {
            console.error("Error fetching trip cart:", err);
            setErrorMsg("Failed to load your trip cart. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (cartItemId, field, value) => {
        setItemDetails((prev) => ({
            ...prev,
            [cartItemId]: {
                ...prev[cartItemId],
                [field]: value
            }
        }));
    };

    const handleRemoveItem = async (cartItemId, providerName) => {
        if (!window.confirm(`Are you sure you want to remove ${providerName || "this service"} from your trip?`)) {
            return;
        }

        try {
            await api.delete(`trip-cart/item/${cartItemId}/delete/`);
            fetchTripCart();
        } catch (err) {
            console.error("Error removing cart item:", err);
            alert("Failed to remove service from trip.");
        }
    };

    const handleClearCart = async () => {
        if (!window.confirm("Are you sure you want to clear all services from your trip plan?")) {
            return;
        }

        try {
            await api.post(`trip-cart/clear/${userId}/`);
            fetchTripCart();
        } catch (err) {
            console.error("Error clearing cart:", err);
            alert("Failed to clear trip.");
        }
    };

    const getImageUrl = (image) => {
        if (!image) return "";
        if (image.startsWith("http")) return image;
        return `http://127.0.0.1:8000${image}`;
    };

    // Calculate individual item prices based on user inputs
    const calculateItemPrice = (item) => {
        const details = itemDetails[item.cart_item_id] || {};
        const provider = item.provider || {};

        if (item.service_type === "Hotel") {
            const hotel = provider.hotel;
            const rooms = hotel?.rooms || [];
            const selectedRoom = rooms.find((r) => String(r.room_id) === String(details.room_id));
            const pricePerNight = selectedRoom ? parseFloat(selectedRoom.price_per_night || 0) : 0;

            let nights = 0;
            if (details.check_in && details.check_out) {
                const diff = new Date(details.check_out) - new Date(details.check_in);
                nights = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
            }
            const roomsCount = parseInt(details.rooms_count, 10) || 1;
            const total = (selectedRoom && nights > 0) ? pricePerNight * nights * roomsCount : 0;

            return {
                total,
                unitRate: pricePerNight,
                nights,
                multiplier: roomsCount,
                selectedSubItem: selectedRoom,
                isConfigured: Boolean(selectedRoom && details.check_in && details.check_out && nights > 0)
            };
        } else if (item.service_type === "Transportation") {
            const transportation = provider.transportation;
            const vehicles = transportation?.vehicles || [];
            const selectedVehicle = vehicles.find((v) => String(v.vehicle_id) === String(details.vehicle_id));
            const priceFare = selectedVehicle ? parseFloat(selectedVehicle.price_fare || 0) : parseFloat(transportation?.price_fare || 0);

            let days = 0;
            if (details.journey_date) {
                if (details.return_date) {
                    const diff = new Date(details.return_date) - new Date(details.journey_date);
                    days = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
                } else {
                    days = 1;
                }
            }
            const total = (selectedVehicle && days > 0) ? priceFare * days : 0;

            return {
                total,
                unitRate: priceFare,
                days,
                fareUnit: selectedVehicle?.fare_unit || "/ day",
                selectedSubItem: selectedVehicle,
                isConfigured: Boolean(selectedVehicle && details.journey_date && days > 0)
            };
        } else if (item.service_type === "Activity") {
            const activity = provider.activity;
            const packages = activity?.items || [];
            const selectedItem = packages.find((i) => String(i.item_id) === String(details.activity_item_id));
            const price = selectedItem ? parseFloat(selectedItem.price || 0) : parseFloat(activity?.price || 0);
            const participants = parseInt(details.participants_count, 10) || 0;
            const total = (selectedItem && participants > 0) ? price * participants : 0;

            return {
                total,
                unitRate: price,
                participants,
                selectedSubItem: selectedItem,
                isConfigured: Boolean(selectedItem && details.activity_date && participants > 0)
            };
        } else if (item.service_type === "Restaurant") {
            return {
                total: 0,
                unitRate: 0,
                guests: parseInt(details.guests_count, 10) || 0,
                isConfigured: Boolean(details.reservation_date && details.reservation_time)
            };
        }
        return { total: 0, unitRate: 0, isConfigured: false };
    };

    // Calculate Grand Total
    const items = cart?.items || [];
    const grandTotal = items.reduce((sum, item) => sum + calculateItemPrice(item).total, 0);

    // Group items by category
    const hotelItems = items.filter((i) => i.service_type === "Hotel");
    const transportItems = items.filter((i) => i.service_type === "Transportation");
    const activityItems = items.filter((i) => i.service_type === "Activity");
    const restaurantItems = items.filter((i) => i.service_type === "Restaurant");

    // Overall Trip Dates
    let tripStartDate = null;
    let tripEndDate = null;
    items.forEach((item) => {
        const d = itemDetails[item.cart_item_id];
        if (d) {
            const start = d.check_in || d.journey_date || d.activity_date || d.reservation_date;
            const end = d.check_out || d.return_date || d.activity_date || d.reservation_date;
            if (start && (!tripStartDate || start < tripStartDate)) tripStartDate = start;
            if (end && (!tripEndDate || end > tripEndDate)) tripEndDate = end;
        }
    });

    const handleBookThisTrip = async () => {
        if (!items || items.length === 0) {
            alert("Your trip is empty! Please add services to book.");
            return;
        }

        // Validate hotel items
        for (const item of hotelItems) {
            const d = itemDetails[item.cart_item_id] || {};
            const rooms = item.provider.hotel?.rooms || [];
            if (rooms.length > 0 && !d.room_id) {
                alert(`Please select a room for ${item.provider.business_name}.`);
                return;
            }
            if (!d.check_in || !d.check_out) {
                alert(`Please select Check-in and Check-out dates for ${item.provider.business_name}.`);
                return;
            }
            if (new Date(d.check_out) <= new Date(d.check_in)) {
                alert(`Check-out date must be after Check-in date for ${item.provider.business_name}.`);
                return;
            }
        }

        // Validate transportation items
        for (const item of transportItems) {
            const d = itemDetails[item.cart_item_id] || {};
            const vehicles = item.provider.transportation?.vehicles || [];
            if (vehicles.length > 0 && !d.vehicle_id) {
                alert(`Please select a vehicle for ${item.provider.business_name}.`);
                return;
            }
            if (!d.journey_date) {
                alert(`Please select Journey Date for ${item.provider.business_name}.`);
                return;
            }
        }

        // Validate activity items
        for (const item of activityItems) {
            const d = itemDetails[item.cart_item_id] || {};
            const packages = item.provider.activity?.items || [];
            if (packages.length > 0 && !d.activity_item_id) {
                alert(`Please select an experience package for ${item.provider.business_name}.`);
                return;
            }
            if (!d.activity_date) {
                alert(`Please select Activity Date for ${item.provider.business_name}.`);
                return;
            }
            if (!d.participants_count || parseInt(d.participants_count, 10) < 1) {
                alert(`Please enter the number of participants for ${item.provider.business_name}.`);
                return;
            }
        }

        // Prepare items payload
        const preparedItems = items.map((item) => {
            const details = itemDetails[item.cart_item_id] || {};
            const calc = calculateItemPrice(item);

            return {
                provider_id: item.provider.provider_id,
                service_type: item.service_type,
                room_id: details.room_id || null,
                vehicle_id: details.vehicle_id || null,
                activity_item_id: details.activity_item_id || null,
                check_in: details.check_in || null,
                check_out: details.check_out || null,
                rooms_count: parseInt(details.rooms_count, 10) || 1,
                guests_count: parseInt(details.guests_count, 10) || 1,
                journey_date: details.journey_date || null,
                return_date: details.return_date || null,
                pickup_location: details.pickup_location || "",
                drop_location: details.drop_location || "",
                passengers_count: parseInt(details.passengers_count, 10) || 1,
                activity_date: details.activity_date || null,
                time_slot: details.time_slot || "",
                participants_count: parseInt(details.participants_count, 10) || 1,
                reservation_date: details.reservation_date || null,
                reservation_time: details.reservation_time || "",
                amount: calc.total,
                details: {
                    ...details,
                    calculated_amount: calc.total
                }
            };
        });

        try {
            setBookingInProgress(true);
            const payload = {
                user_id: userId,
                destination_id: cart.destination?.destination_id || null,
                start_date: tripStartDate || null,
                end_date: tripEndDate || null,
                items: preparedItems
            };

            const response = await api.post("booking/create/", payload);
            setSuccessBooking(response.data.booking);
            fetchTripCart();
        } catch (err) {
            console.error("Booking error:", err);
            alert(err.response?.data?.error || "Failed to complete trip booking. Please check details.");
        } finally {
            setBookingInProgress(false);
        }
    };

    if (loading) {
        return (
            <div className="plan-trip-page">
                <div className="navbar-top-wrapper">
                    <Navbar />
                </div>
                <div className="plan-trip-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading trip details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="plan-trip-page">
            {/* TOP NAVBAR CONTAINER */}
            <div className="navbar-top-wrapper">
                <Navbar />
            </div>

            {/* PAGE HEADER */}
            <header className="plan-trip-header">
                <div className="header-inner">
                    
                    <h1>
                        {cart?.destination
                            ? `My Trip To - ${cart.destination.name}`
                            : "Plan Your Trip"}
                    </h1>
                    
                </div>
            </header>

            {/* MAIN TWO-COLUMN CONTENT */}
            <main className="plan-trip-container">
                {errorMsg && <div className="plan-trip-error-banner">{errorMsg}</div>}

                {/* EMPTY CART STATE */}
                {(!items || items.length === 0) && !successBooking ? (
                    <div className="empty-trip-card">
                        <div className="empty-trip-icon">🗺️</div>
                        <h2>Your Trip Cart is Empty</h2>
                        <p>
                            You haven't added any services yet. Explore destinations to add hotels, transportation, activities, or restaurants.
                        </p>
                        <button
                            className="explore-destinations-btn"
                            onClick={() => navigate("/destinations")}
                        >
                            Explore Destinations →
                        </button>
                    </div>
                ) : (
                    <div className="plan-trip-grid-layout">
                        {/* LEFT COLUMN: SELECTED SERVICES */}
                        <div className="selected-services-column">
                            <div className="services-column-top">
                                <h2>Selected Services ({items.length})</h2>
                                <button className="clear-cart-btn" onClick={handleClearCart}>
                                    Clear All
                                </button>
                            </div>

                            {/* HOTELS */}
                            {hotelItems.length > 0 && (
                                <section className="service-category-group">
                                    <div className="category-section-title">
                                        <span className="cat-icon">🏨</span>
                                        <h3>Hotels & Accommodation</h3>
                                        <span className="cat-badge">{hotelItems.length} selected</span>
                                    </div>

                                    {hotelItems.map((item) => {
                                        const provider = item.provider;
                                        const hotel = provider.hotel;
                                        const rooms = hotel?.rooms || [];
                                        const details = itemDetails[item.cart_item_id] || {};
                                        const calc = calculateItemPrice(item);
                                        const hotelImg = hotel?.images?.[0]?.image || provider.hotel?.images?.[0]?.image;

                                        return (
                                            <div className="service-card-item" key={item.cart_item_id}>
                                                {/* 1. SERVICE DETAILS */}
                                                <div className="service-details-row">
                                                    {hotelImg && (
                                                        <img
                                                            src={getImageUrl(hotelImg)}
                                                            alt={hotel?.hotel_name}
                                                            className="service-thumb-photo"
                                                        />
                                                    )}
                                                    <div className="service-meta-content">
                                                        <div className="service-badge-name-row">
                                                            <span className="category-tag hotel">Hotel</span>
                                                            <h4>{hotel?.hotel_name || provider.business_name}</h4>
                                                        </div>
                                                        <p className="service-location-text">
                                                            📍 {hotel?.location || hotel?.address || provider.location || "Location not specified"}
                                                        </p>
                                                    </div>
                                                    <div className="service-action-buttons">
                                                        <button
                                                            className="btn-service-view"
                                                            onClick={() => navigate(`/service/${provider.provider_id}`)}
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            className="btn-service-remove"
                                                            onClick={() => handleRemoveItem(item.cart_item_id, provider.business_name)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* DIVIDER */}
                                                <div className="card-section-divider"></div>

                                                {/* 2. BOOKING DETAILS FORM */}
                                                <div className="booking-details-section">
                                                    <div className="booking-section-heading">
                                                        <span>Booking Details</span>
                                                    </div>

                                                    <div className="booking-fields-grid">
                                                        <div className="form-field full-width">
                                                            <label>Select Room</label>
                                                            <select
                                                                value={details.room_id || ""}
                                                                onChange={(e) => handleInputChange(item.cart_item_id, "room_id", e.target.value)}
                                                            >
                                                                <option value="">-- Choose a Room --</option>
                                                                {rooms.map((r) => (
                                                                    <option key={r.room_id} value={r.room_id}>
                                                                        {r.room_name} (₹{r.price_per_night}/night • Max {r.maximum_guests} guests)
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div className="form-field">
                                                            <label>Check-in Date</label>
                                                            <input
                                                                type="date"
                                                                value={details.check_in || ""}
                                                                onChange={(e) => handleInputChange(item.cart_item_id, "check_in", e.target.value)}
                                                            />
                                                        </div>

                                                        <div className="form-field">
                                                            <label>Check-out Date</label>
                                                            <input
                                                                type="date"
                                                                value={details.check_out || ""}
                                                                onChange={(e) => handleInputChange(item.cart_item_id, "check_out", e.target.value)}
                                                            />
                                                        </div>

                                                        <div className="form-field">
                                                            <label>Number of Rooms</label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="10"
                                                                placeholder="e.g. 1"
                                                                value={details.rooms_count || ""}
                                                                onChange={(e) => handleInputChange(item.cart_item_id, "rooms_count", e.target.value)}
                                                            />
                                                        </div>

                                                        <div className="form-field">
                                                            <label>Number of Guests</label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="20"
                                                                placeholder="e.g. 2"
                                                                value={details.guests_count || ""}
                                                                onChange={(e) => handleInputChange(item.cart_item_id, "guests_count", e.target.value)}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* CALCULATION FOOTER */}
                                                    <div className="card-calc-footer">
                                                        <div className="calc-breakdown">
                                                            {calc.isConfigured ? (
                                                                <span>
                                                                    ₹{calc.unitRate} / night × {calc.nights} night(s)
                                                                    {calc.multiplier > 1 ? ` × ${calc.multiplier} rooms` : ""}
                                                                </span>
                                                            ) : (
                                                                <span className="calc-hint">
                                                                    {calc.unitRate > 0
                                                                        ? `Rate: ₹${calc.unitRate}/night • Select dates to calculate total`
                                                                        : "Select a room and dates to calculate"}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="calc-total">
                                                            <span>Hotel Total:</span>
                                                            <strong>₹{calc.total.toLocaleString()}</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </section>
                            )}

                            {/* TRANSPORTATION */}
                            {transportItems.length > 0 && (
                                <section className="service-category-group">
                                    <div className="category-section-title">
                                        <span className="cat-icon">🚕</span>
                                        <h3>Transportation & Rental</h3>
                                        <span className="cat-badge">{transportItems.length} selected</span>
                                    </div>

                                    {transportItems.map((item) => {
                                        const provider = item.provider;
                                        const transportation = provider.transportation;
                                        const vehicles = transportation?.vehicles || [];
                                        const details = itemDetails[item.cart_item_id] || {};
                                        const calc = calculateItemPrice(item);
                                        const transImg = transportation?.images?.[0]?.image || provider.transportation?.images?.[0]?.image;

                                        return (
                                            <div className="service-card-item" key={item.cart_item_id}>
                                                {/* 1. SERVICE DETAILS */}
                                                <div className="service-details-row">
                                                    {transImg && (
                                                        <img
                                                            src={getImageUrl(transImg)}
                                                            alt={transportation?.service_name}
                                                            className="service-thumb-photo"
                                                        />
                                                    )}
                                                    <div className="service-meta-content">
                                                        <div className="service-badge-name-row">
                                                            <span className="category-tag transport">Transportation</span>
                                                            <h4>{transportation?.service_name || provider.business_name}</h4>
                                                        </div>
                                                        <p className="service-location-text">
                                                            📍 {transportation?.starting_location || provider.location || "Kerala"}
                                                        </p>
                                                    </div>
                                                    <div className="service-action-buttons">
                                                        <button
                                                            className="btn-service-view"
                                                            onClick={() => navigate(`/service/${provider.provider_id}`)}
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            className="btn-service-remove"
                                                            onClick={() => handleRemoveItem(item.cart_item_id, provider.business_name)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* DIVIDER */}
                                                <div className="card-section-divider"></div>

                                                {/* 2. BOOKING DETAILS FORM */}
                                                <div className="booking-details-section">
                                                    <div className="booking-section-heading">
                                                        <span>Booking Details</span>
                                                    </div>

                                                    <div className="booking-fields-grid">
                                                        <div className="form-field">
                                                            <label>Select Vehicle</label>
                                                            <select
                                                                value={details.vehicle_id || ""}
                                                                onChange={(e) => handleInputChange(item.cart_item_id, "vehicle_id", e.target.value)}
                                                            >
                                                                <option value="">-- Choose a Vehicle --</option>
                                                                {vehicles.map((v) => (
                                                                    <option key={v.vehicle_id} value={v.vehicle_id}>
                                                                        {v.vehicle_name} ({v.vehicle_type} • {v.seating_capacity} seats) - ₹{v.price_fare} {v.fare_unit}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div className="form-field">
                                                            <label>Passengers Count</label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="50"
                                                                placeholder="e.g. 2"
                                                                value={details.passengers_count || ""}
                                                                onChange={(e) => handleInputChange(item.cart_item_id, "passengers_count", e.target.value)}
                                                            />
                                                        </div>

                                                        <div className="form-field">
                                                            <label>Pickup / Journey Date</label>
                                                            <input
                                                                type="date"
                                                                value={details.journey_date || ""}
                                                                onChange={(e) => handleInputChange(item.cart_item_id, "journey_date", e.target.value)}
                                                            />
                                                        </div>

                                                        <div className="form-field">
                                                            <label>Return / End Date</label>
                                                            <input
                                                                type="date"
                                                                value={details.return_date || ""}
                                                                onChange={(e) => handleInputChange(item.cart_item_id, "return_date", e.target.value)}
                                                            />
                                                        </div>

                                                        <div className="form-field">
                                                            <label>Pickup Location</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Enter pickup address / station"
                                                                value={details.pickup_location || ""}
                                                                onChange={(e) => handleInputChange(item.cart_item_id, "pickup_location", e.target.value)}
                                                            />
                                                        </div>

                                                        <div className="form-field">
                                                            <label>Drop Location</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Enter drop location / resort"
                                                                value={details.drop_location || ""}
                                                                onChange={(e) => handleInputChange(item.cart_item_id, "drop_location", e.target.value)}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="card-calc-footer">
                                                        <div className="calc-breakdown">
                                                            {calc.isConfigured ? (
                                                                <span>Rate: ₹{calc.unitRate} {calc.fareUnit} × {calc.days} day(s)</span>
                                                            ) : (
                                                                <span className="calc-hint">
                                                                    {calc.unitRate > 0
                                                                        ? `Rate: ₹${calc.unitRate} ${calc.fareUnit} • Select journey date to calculate`
                                                                        : "Select vehicle and journey date"}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="calc-total">
                                                            <span>Transport Total:</span>
                                                            <strong>₹{calc.total.toLocaleString()}</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </section>
                            )}

                            {/* ACTIVITIES */}
                            {activityItems.length > 0 && (
                                <section className="service-category-group">
                                    <div className="category-section-title">
                                        <span className="cat-icon">🧗‍♂️</span>
                                        <h3>Activities & Experiences</h3>
                                        <span className="cat-badge">{activityItems.length} selected</span>
                                    </div>

                                    {activityItems.map((item) => {
                                        const provider = item.provider;
                                        const activity = provider.activity;
                                        const packages = activity?.items || [];
                                        const details = itemDetails[item.cart_item_id] || {};
                                        const calc = calculateItemPrice(item);
                                        const actImg = activity?.images?.[0]?.image || provider.activity?.images?.[0]?.image;

                                        return (
                                            <div className="service-card-item" key={item.cart_item_id}>
                                                {/* 1. SERVICE DETAILS */}
                                                <div className="service-details-row">
                                                    {actImg && (
                                                        <img
                                                            src={getImageUrl(actImg)}
                                                            alt={activity?.activity_name}
                                                            className="service-thumb-photo"
                                                        />
                                                    )}
                                                    <div className="service-meta-content">
                                                        <div className="service-badge-name-row">
                                                            <span className="category-tag activity">Activity</span>
                                                            <h4>{activity?.activity_name || provider.business_name}</h4>
                                                        </div>
                                                        <p className="service-location-text">
                                                            📍 {activity?.location || provider.location || "Location not specified"}
                                                        </p>
                                                    </div>
                                                    <div className="service-action-buttons">
                                                        <button
                                                            className="btn-service-view"
                                                            onClick={() => navigate(`/service/${provider.provider_id}`)}
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            className="btn-service-remove"
                                                            onClick={() => handleRemoveItem(item.cart_item_id, provider.business_name)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* DIVIDER */}
                                                <div className="card-section-divider"></div>

                                                {/* 2. BOOKING DETAILS FORM */}
                                                <div className="booking-details-section">
                                                    <div className="booking-section-heading">
                                                        <span>Booking Details</span>
                                                    </div>

                                                    <div className="booking-fields-grid">
                                                        <div className="form-field full-width">
                                                            <label>Select Experience Package</label>
                                                            <select
                                                                value={details.activity_item_id || ""}
                                                                onChange={(e) => handleInputChange(item.cart_item_id, "activity_item_id", e.target.value)}
                                                            >
                                                                <option value="">-- Choose Package --</option>
                                                                {packages.map((pkg) => (
                                                                    <option key={pkg.item_id} value={pkg.item_id}>
                                                                        {pkg.activity_title} ({pkg.duration}) - ₹{pkg.price}/person
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div className="form-field">
                                                            <label>Activity Date</label>
                                                            <input
                                                                type="date"
                                                                value={details.activity_date || ""}
                                                                onChange={(e) => handleInputChange(item.cart_item_id, "activity_date", e.target.value)}
                                                            />
                                                        </div>

                                                        <div className="form-field">
                                                            <label>Preferred Time Slot</label>
                                                            <input
                                                                type="text"
                                                                placeholder="e.g. Morning / 09:00 AM"
                                                                value={details.time_slot || ""}
                                                                onChange={(e) => handleInputChange(item.cart_item_id, "time_slot", e.target.value)}
                                                            />
                                                        </div>

                                                        <div className="form-field">
                                                            <label>Number of Participants</label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="30"
                                                                placeholder="e.g. 2"
                                                                value={details.participants_count || ""}
                                                                onChange={(e) => handleInputChange(item.cart_item_id, "participants_count", e.target.value)}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="card-calc-footer">
                                                        <div className="calc-breakdown">
                                                            {calc.isConfigured ? (
                                                                <span>₹{calc.unitRate} / person × {calc.participants} participant(s)</span>
                                                            ) : (
                                                                <span className="calc-hint">
                                                                    {calc.unitRate > 0
                                                                        ? `Rate: ₹${calc.unitRate}/person • Enter participants to calculate`
                                                                        : "Select package and participants"}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="calc-total">
                                                            <span>Activity Total:</span>
                                                            <strong>₹{calc.total.toLocaleString()}</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </section>
                            )}

                            {/* RESTAURANTS */}
                            {restaurantItems.length > 0 && (
                                <section className="service-category-group">
                                    <div className="category-section-title">
                                        <span className="cat-icon">🍽️</span>
                                        <h3>Dining & Restaurants</h3>
                                        <span className="cat-badge">{restaurantItems.length} selected</span>
                                    </div>

                                    {restaurantItems.map((item) => {
                                        const provider = item.provider;
                                        const restaurant = provider.restaurant;
                                        const details = itemDetails[item.cart_item_id] || {};
                                        const restImg = restaurant?.images?.[0]?.image || provider.restaurant?.images?.[0]?.image;

                                        return (
                                            <div className="service-card-item" key={item.cart_item_id}>
                                                {/* 1. SERVICE DETAILS */}
                                                <div className="service-details-row">
                                                    {restImg && (
                                                        <img
                                                            src={getImageUrl(restImg)}
                                                            alt={restaurant?.restaurant_name}
                                                            className="service-thumb-photo"
                                                        />
                                                    )}
                                                    <div className="service-meta-content">
                                                        <div className="service-badge-name-row">
                                                            <span className="category-tag restaurant">Restaurant</span>
                                                            <h4>{restaurant?.restaurant_name || provider.business_name}</h4>
                                                        </div>
                                                        <p className="service-location-text">
                                                            🍴 {restaurant?.cuisine_type || "Restaurant"} • 📍 {restaurant?.location || provider.location || "Location not specified"}
                                                        </p>
                                                    </div>
                                                    <div className="service-action-buttons">
                                                        <button
                                                            className="btn-service-view"
                                                            onClick={() => navigate(`/service/${provider.provider_id}`)}
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            className="btn-service-remove"
                                                            onClick={() => handleRemoveItem(item.cart_item_id, provider.business_name)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* DIVIDER */}
                                                <div className="card-section-divider"></div>

                                                {/* 2. BOOKING DETAILS FORM */}
                                                <div className="booking-details-section">
                                                    <div className="booking-section-heading">
                                                        <span>Reservation Details</span>
                                                    </div>

                                                    <div className="booking-fields-grid">
                                                        <div className="form-field">
                                                            <label>Reservation Date</label>
                                                            <input
                                                                type="date"
                                                                value={details.reservation_date || ""}
                                                                onChange={(e) => handleInputChange(item.cart_item_id, "reservation_date", e.target.value)}
                                                            />
                                                        </div>

                                                        <div className="form-field">
                                                            <label>Reservation Time</label>
                                                            <input
                                                                type="time"
                                                                value={details.reservation_time || ""}
                                                                onChange={(e) => handleInputChange(item.cart_item_id, "reservation_time", e.target.value)}
                                                            />
                                                        </div>

                                                        <div className="form-field">
                                                            <label>Number of Guests</label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="20"
                                                                placeholder="e.g. 2"
                                                                value={details.guests_count || ""}
                                                                onChange={(e) => handleInputChange(item.cart_item_id, "guests_count", e.target.value)}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="card-calc-footer">
                                                        <div className="calc-breakdown">
                                                            <span>Table Reservation</span>
                                                        </div>
                                                        <div className="calc-total">
                                                            <span>Reservation:</span>
                                                            <strong>Free / Included</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </section>
                            )}

                            {/* ADD MORE SERVICES BUTTON */}
                            <div className="add-more-services-row">
                                <button
                                    className="btn-add-more-services"
                                    onClick={() => {
                                        if (cart?.destination?.destination_id) {
                                            navigate(`/view/${cart.destination.destination_id}`);
                                        } else {
                                            navigate("/destinations");
                                        }
                                    }}
                                >
                                    + Add More Services to This Trip
                                </button>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: TRIP SUMMARY */}
                        <div className="trip-summary-column">
                            <div className="trip-summary-panel">
                                <div className="summary-panel-header">
                                    <h3>TRIP SUMMARY</h3>
                                </div>

                                <div className="summary-destination-box">
                                    <span className="dest-tag">Destination</span>
                                    <h4>{cart?.destination?.name || "Kerala Tour Itinerary"}</h4>
                                    <p>📍 {cart?.destination?.location || "Kerala, India"}</p>
                                </div>

                                {tripStartDate && (
                                    <div className="summary-dates-card">
                                        <div>
                                            <small>Start Date</small>
                                            <strong>{tripStartDate}</strong>
                                        </div>
                                        <span className="date-arrow">→</span>
                                        <div>
                                            <small>End Date</small>
                                            <strong>{tripEndDate || tripStartDate}</strong>
                                        </div>
                                    </div>
                                )}

                                <div className="summary-line-divider"></div>

                                {/* ITEMIZED PRICE LIST */}
                                <div className="summary-items-breakdown">
                                    {hotelItems.length > 0 && (
                                        <div className="summary-price-row">
                                            <span>Hotel Accommodation</span>
                                            <strong>
                                                ₹{hotelItems.reduce((acc, i) => acc + calculateItemPrice(i).total, 0).toLocaleString()}
                                            </strong>
                                        </div>
                                    )}

                                    {transportItems.length > 0 && (
                                        <div className="summary-price-row">
                                            <span>Transportation</span>
                                            <strong>
                                                ₹{transportItems.reduce((acc, i) => acc + calculateItemPrice(i).total, 0).toLocaleString()}
                                            </strong>
                                        </div>
                                    )}

                                    {activityItems.length > 0 && (
                                        <div className="summary-price-row">
                                            <span>Activities ({activityItems.length})</span>
                                            <strong>
                                                ₹{activityItems.reduce((acc, i) => acc + calculateItemPrice(i).total, 0).toLocaleString()}
                                            </strong>
                                        </div>
                                    )}

                                    {restaurantItems.length > 0 && (
                                        <div className="summary-price-row">
                                            <span>Dining Reservations</span>
                                            <strong className="text-free">Free</strong>
                                        </div>
                                    )}
                                </div>

                                <div className="summary-line-divider"></div>

                                {/* TOTAL */}
                                <div className="summary-grand-total-row">
                                    <span>TOTAL</span>
                                    <strong>₹{grandTotal.toLocaleString()}</strong>
                                </div>

                                <button
                                    className="btn-book-this-trip"
                                    onClick={handleBookThisTrip}
                                    disabled={bookingInProgress || items.length === 0}
                                >
                                    {bookingInProgress ? "Booking Trip..." : "BOOK THIS TRIP"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* BOOKING SUCCESS MODAL */}
                {successBooking && (
                    <div className="booking-modal-backdrop">
                        <div className="booking-success-modal">
                            <div className="modal-success-icon">✓</div>
                            <h2>Trip Booked Successfully</h2>
                            <p className="modal-lead">
                                Your complete trip has been confirmed under one booking reference.
                            </p>

                            <div className="booking-id-banner">
                                <span>Booking Reference</span>
                                <h3>Booking #{successBooking.booking_id}</h3>
                            </div>

                            <div className="modal-booking-summary">
                                <div className="modal-meta-row">
                                    <div>
                                        <small>Destination</small>
                                        <strong>{successBooking.destination?.name || "Kerala Trip"}</strong>
                                    </div>
                                    <div>
                                        <small>Total Amount</small>
                                        <strong>₹{parseFloat(successBooking.total_amount || 0).toLocaleString()}</strong>
                                    </div>
                                    <div>
                                        <small>Status</small>
                                        <span className="status-pill confirmed">{successBooking.booking_status}</span>
                                    </div>
                                </div>

                                <div className="modal-items-list">
                                    <h4>Included Services ({successBooking.items?.length || 0})</h4>
                                    {successBooking.items?.map((item) => (
                                        <div className="modal-service-item" key={item.booking_item_id}>
                                            <div>
                                                <span className="item-cat-badge">{item.service_type}</span>
                                                <strong>{item.item_name}</strong>
                                            </div>
                                            <span>₹{parseFloat(item.amount || 0).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button
                                    className="modal-profile-btn"
                                    onClick={() => navigate("/my-profile")}
                                >
                                    View in My Profile & Bookings →
                                </button>
                                <button
                                    className="modal-destinations-btn"
                                    onClick={() => navigate("/destinations")}
                                >
                                    Explore More Destinations
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
