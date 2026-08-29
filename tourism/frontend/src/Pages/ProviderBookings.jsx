import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ServiceProviderNavbar from "../Components/ServiceProviderNavbar";
import api from "../services/api";
import "../styles/ProviderBookings.css";

export default function ProviderBookings() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [providerInfo, setProviderInfo] = useState({
        provider_id: localStorage.getItem("provider_id"),
        business_name: localStorage.getItem("name") || "Service Provider",
        service_type: localStorage.getItem("service_type") || "Hotel"
    });

    const providerId = localStorage.getItem("provider_id");
    const userId = localStorage.getItem("user_id");

    useEffect(() => {
        if (!userId) {
            navigate("/login");
            return;
        }

        if (providerId) {
            fetchBookings(providerId);
        } else {
            // Fetch provider_id using user_id if missing
            api.get(`provider-profile/${userId}/`)
                .then((res) => {
                    const pId = res.data?.provider?.provider_id;
                    if (pId) {
                        localStorage.setItem("provider_id", pId);
                        if (res.data.provider.service_type) {
                            localStorage.setItem("service_type", res.data.provider.service_type);
                        }
                        setProviderInfo({
                            provider_id: pId,
                            business_name: res.data.provider.business_name || localStorage.getItem("name"),
                            service_type: res.data.provider.service_type || "Hotel"
                        });
                        fetchBookings(pId);
                    } else {
                        setLoading(false);
                    }
                })
                .catch((err) => {
                    console.error("Error resolving provider:", err);
                    setLoading(false);
                });
        }
    }, [providerId, userId]);

    const fetchBookings = async (pId) => {
        try {
            setLoading(true);
            const response = await api.get(`provider-bookings/${pId}/`);
            const bookingList = response.data?.bookings || [];
            setBookings(bookingList);

            if (response.data?.service_type) {
                setProviderInfo((prev) => ({
                    ...prev,
                    service_type: response.data.service_type,
                    business_name: response.data.business_name || prev.business_name
                }));
            }
        } catch (err) {
            console.error("Error loading provider bookings:", err);
        } finally {
            setLoading(false);
        }
    };

    const serviceType = providerInfo.service_type || localStorage.getItem("service_type") || "Hotel";

    const getPageTitle = (st) => {
        switch (st) {
            case "Hotel":
                return "🏨 Hotel Room Bookings";
            case "Transportation":
                return "🚍 Transportation & Vehicle Bookings";
            case "Activity":
                return "🧗 Activity & Experience Bookings";
            case "Restaurant":
                return "🍽️ Table Reservations & Dining";
            default:
                return "💼 Service Bookings";
        }
    };

    return (
        <div className="provider-bookings-layout">
            {/* COMPACT SIDEBAR */}
            <ServiceProviderNavbar />

            {/* MAIN CONTENT */}
            <main className="provider-bookings-main">
                {/* HEADER */}
                <header className="provider-bookings-header">
                    <div>
                        <span className="header-type-badge">{serviceType} Service</span>
                        <h1>{getPageTitle(serviceType)}</h1>
                        <p>View confirmed bookings placed for your {serviceType.toLowerCase()} service.</p>
                    </div>
                </header>

                {/* BOOKINGS LIST */}
                {loading ? (
                    <div className="provider-bookings-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading your bookings...</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="empty-bookings-card">
                        <div className="empty-icon">📋</div>
                        <h3>No Bookings Found</h3>
                        <p>
                            You haven't received any bookings for your {serviceType.toLowerCase()} yet. When tourists plan and book trips, their reservations will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="bookings-cards-list">
                        {bookings.map((b) => {
                            const details = b.details || {};
                            const tourist = b.tourist || {};

                            return (
                                <div className="provider-booking-card" key={b.booking_item_id}>
                                    {/* TOP BAR */}
                                    <div className="card-header-bar">
                                        <div className="header-meta-left">
                                            <span className="booking-ref-tag">
                                                Booking 
                                            </span>
                                            <span className="service-sub-tag">{b.service_type}</span>
                                            <span className="destination-tag">
                                                 {b.destination?.name || "Kerala"}
                                            </span>
                                        </div>

                                        <div className="header-meta-right">
                                            <div className="price-tag">
                                                ₹{parseFloat(b.amount || 0).toLocaleString()}
                                            </div>
                                            <div className="status-pill-badge confirmed">
                                                ✓ Booking Confirmed
                                            </div>
                                        </div>
                                    </div>

                                    {/* MIDDLE: SERVICE SPECIFIC BOOKING DETAILS */}
                                    <div className="card-body-grid">
                                        {/* SERVICE SPECIFIC BLOCK */}
                                        <div className="service-specific-details">
                                            <h4>{b.item_name}</h4>

                                            {/* HOTEL DETAILS */}
                                            {b.service_type === "Hotel" && (
                                                <div className="specific-data-grid">
                                                    <div>
                                                        <small>Check-in Date</small>
                                                        <strong>{details.check_in || "N/A"}</strong>
                                                    </div>
                                                    <div>
                                                        <small>Check-out Date</small>
                                                        <strong>{details.check_out || "N/A"}</strong>
                                                    </div>
                                                    <div>
                                                        <small>Rooms Booked</small>
                                                        <strong>{details.rooms_count || 1} Room(s)</strong>
                                                    </div>
                                                    <div>
                                                        <small>Number of Guests</small>
                                                        <strong>{details.guests_count || 1} Guest(s)</strong>
                                                    </div>
                                                </div>
                                            )}

                                            {/* TRANSPORTATION DETAILS */}
                                            {b.service_type === "Transportation" && (
                                                <div className="specific-data-grid">
                                                    <div>
                                                        <small>Journey Date</small>
                                                        <strong>{details.journey_date || "N/A"}</strong>
                                                    </div>
                                                    <div>
                                                        <small>Return Date</small>
                                                        <strong>{details.return_date || "Same Day"}</strong>
                                                    </div>
                                                    <div>
                                                        <small>Pickup Location</small>
                                                        <strong>{details.pickup_location || "Not specified"}</strong>
                                                    </div>
                                                    <div>
                                                        <small>Drop Location</small>
                                                        <strong>{details.drop_location || "Not specified"}</strong>
                                                    </div>
                                                    <div>
                                                        <small>Passengers</small>
                                                        <strong>{details.passengers_count || 1} Passenger(s)</strong>
                                                    </div>
                                                </div>
                                            )}

                                            {/* ACTIVITY DETAILS */}
                                            {b.service_type === "Activity" && (
                                                <div className="specific-data-grid">
                                                    <div>
                                                        <small>Activity Date</small>
                                                        <strong>{details.activity_date || "N/A"}</strong>
                                                    </div>
                                                    <div>
                                                        <small>Time Slot</small>
                                                        <strong>{details.time_slot || "Standard Time"}</strong>
                                                    </div>
                                                    <div>
                                                        <small>Participants</small>
                                                        <strong>{details.participants_count || 1} Person(s)</strong>
                                                    </div>
                                                </div>
                                            )}

                                            {/* RESTAURANT DETAILS */}
                                            {b.service_type === "Restaurant" && (
                                                <div className="specific-data-grid">
                                                    <div>
                                                        <small>Reservation Date</small>
                                                        <strong>{details.reservation_date || "N/A"}</strong>
                                                    </div>
                                                    <div>
                                                        <small>Reservation Time</small>
                                                        <strong>{details.reservation_time || "N/A"}</strong>
                                                    </div>
                                                    <div>
                                                        <small>Party Size</small>
                                                        <strong>{details.guests_count || 1} Guest(s)</strong>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* TOURIST CONTACT BLOCK */}
                                        <div className="tourist-contact-card">
                                            <h5>👤 Tourist Customer Details</h5>
                                            <div className="tourist-info-row">
                                                <span>Name:</span>
                                                <strong>{tourist.name}</strong>
                                            </div>
                                            <div className="tourist-info-row">
                                                <span>Email:</span>
                                                <a href={`mailto:${tourist.email}`}>{tourist.email}</a>
                                            </div>
                                            {tourist.phone && (
                                                <div className="tourist-info-row">
                                                    <span>Phone:</span>
                                                    <a href={`tel:${tourist.phone}`}>{tourist.phone}</a>
                                                </div>
                                            )}
                                            <div className="tourist-info-row">
                                                <span>Booked On:</span>
                                                <small>
                                                    {b.created_at
                                                        ? new Date(b.created_at).toLocaleDateString("en-US", {
                                                              year: "numeric",
                                                              month: "short",
                                                              day: "numeric",
                                                              hour: "2-digit",
                                                              minute: "2-digit"
                                                          })
                                                        : "N/A"}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
