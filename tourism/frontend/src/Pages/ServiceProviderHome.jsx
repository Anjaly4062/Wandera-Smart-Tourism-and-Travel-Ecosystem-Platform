import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ServiceProviderNavbar from "../Components/ServiceProviderNavbar";
import api from "../services/api";
import "../styles/ServiceProviderHome.css";

export default function ServiceProviderHome() {
    const navigate = useNavigate();
    const [providerInfo, setProviderInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    const providerName = localStorage.getItem("name") || "Service Provider";
    const providerId = localStorage.getItem("provider_id");

    useEffect(() => {
        if (!providerId) {
            setLoading(false);
            return;
        }

        api.get(`provider-info/${providerId}/`)
            .then((res) => {
                if (res.data?.provider) {
                    setProviderInfo(res.data.provider);
                    if (res.data.provider.service_type) {
                        localStorage.setItem("service_type", res.data.provider.service_type);
                    }
                }
            })
            .catch((err) => {
                console.error("Error loading dashboard provider info:", err);
            })
            .finally(() => setLoading(false));
    }, [providerId]);

    const serviceType = providerInfo?.service_type || localStorage.getItem("service_type") || "Hotel";

    const getBadgeLabel = (st) => {
        switch (st) {
            case "Hotel": return "🏨 Hotel Owner";
            case "Restaurant": return "🍽️ Restaurant Owner";
            case "Transportation": return "🚍 Transportation Owner";
            case "Activity": return "🧗 Activity Owner";
            default: return "💼 Service Provider";
        }
    };

    const getServiceCount = () => {
        if (!providerInfo) return 0;
        if (providerInfo.hotel) return 1;
        if (providerInfo.restaurant) return 1;
        if (providerInfo.transportation) return 1;
        if (providerInfo.activity) return 1;
        return 0;
    };

    return (
        <div className="provider-dashboard">
            {/* COMMON SIDEBAR */}
            <ServiceProviderNavbar />

            {/* MAIN DASHBOARD CONTENT */}
            <main className="provider-main">
                <header className="provider-header">
                    <div>
                        <h2>Dashboard</h2>
                    </div>

                    <div className="provider-user">
                        <div className="user-avatar">
                            {providerName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="user-info">
                            <strong>{providerName}</strong>
                            <span className="service-type-badge-pill">{getBadgeLabel(serviceType)}</span>
                        </div>
                    </div>
                </header>

                <section className="dashboard-content">
                    {/* DYNAMIC SERVICE SUMMARY */}
                    <div className="dashboard-columns">
                        <div className="dashboard-panel">
                            <div className="panel-header">
                                <div>
                                    <h3>My Services</h3>
                                    <p>Registered service for your account</p>
                                </div>
                                <button onClick={() => navigate("/provider/my-services")}>
                                    View Details
                                </button>
                            </div>

                            {loading ? (
                                <p style={{ fontSize: "12px", color: "#64748b" }}>Loading service information...</p>
                            ) : providerInfo?.hotel ? (
                                <div className="summary-card-box">
                                    <span className="summary-badge">🏨 Hotel</span>
                                    <h4>{providerInfo.hotel.hotel_name}</h4>
                                    <p>📍 {providerInfo.hotel.district} | {providerInfo.hotel.rooms ? providerInfo.hotel.rooms.length : 0} Room type(s)</p>
                                    <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                                        <button className="manage-btn" onClick={() => navigate("/provider/my-services")}>Manage Hotel & Rooms</button>
                                        <button 
                                            className="manage-btn" 
                                            style={{ background: "linear-gradient(90deg, #0789e8, #1b49c4)", color: "white" }} 
                                            onClick={() => navigate("/provider/add-room", { state: { hotel_id: providerInfo.hotel.hotel_id } })}
                                        >
                                            + Add Room
                                        </button>
                                    </div>
                                </div>
                            ) : providerInfo?.restaurant ? (
                                <div className="summary-card-box">
                                    <span className="summary-badge orange">🍽️ Restaurant</span>
                                    <h4>{providerInfo.restaurant.restaurant_name}</h4>
                                    <p>📍 {providerInfo.restaurant.district} | Cuisine: {providerInfo.restaurant.cuisine_type}</p>
                                    <button className="manage-btn" onClick={() => navigate("/provider/my-services")}>Manage Restaurant</button>
                                </div>
                            ) : providerInfo?.transportation ? (
                                <div className="summary-card-box">
                                    <span className="summary-badge blue">🚍 Transportation</span>
                                    <h4>{providerInfo.transportation.service_name}</h4>
                                    <p>🚗 Vehicle: {providerInfo.transportation.vehicle_type} | Fare: ₹{providerInfo.transportation.price_fare}</p>
                                    <button className="manage-btn" onClick={() => navigate("/provider/my-services")}>Manage Vehicle</button>
                                </div>
                            ) : providerInfo?.activity ? (
                                <div className="summary-card-box">
                                    <span className="summary-badge green">🧗 Activity</span>
                                    <h4>{providerInfo.activity.activity_name}</h4>
                                    <p>📍 {providerInfo.activity.location} | ₹{providerInfo.activity.price} per person</p>
                                    <button className="manage-btn" onClick={() => navigate("/provider/my-services")}>Manage Activity</button>
                                </div>
                            ) : (
                                <div className="empty-service">
                                    <div className="empty-icon">+</div>
                                    <h4>No service added yet</h4>
                                    <p>Add your {serviceType} service to start receiving tourists.</p>
                                    <button onClick={() => navigate("/provider/add-service")}>
                                        + Add {serviceType} Service
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* RECENT ACTIVITY / RECENT BOOKINGS */}
                        <div className="dashboard-panel">
                            <div className="panel-header">
                                <div>
                                    <h3>Recent Bookings</h3>
                                    <p>Latest booking requests</p>
                                </div>
                                <button onClick={() => navigate("/provider/bookings")}>
                                    View All
                                </button>
                            </div>

                            <div className="empty-bookings">
                                <div className="booking-empty-icon">◷</div>
                                <h4>No bookings yet</h4>
                                <p>Your tourist bookings will appear here once active.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}