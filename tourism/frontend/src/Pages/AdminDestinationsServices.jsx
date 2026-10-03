import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../Components/AdminNavbar";
import api from "../services/api";
import "../styles/AdminProviderRequest.css";
import "../styles/AdminDestinationsServices.css";

// Haversine formula to compute great-circle distance between destination and service coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
    const nLat1 = parseFloat(lat1);
    const nLon1 = parseFloat(lon1);
    const nLat2 = parseFloat(lat2);
    const nLon2 = parseFloat(lon2);

    if (isNaN(nLat1) || isNaN(nLon1) || isNaN(nLat2) || isNaN(nLon2)) {
        return null;
    }

    const toRad = (val) => (val * Math.PI) / 180;
    const R = 6371; // Earth radius in kilometers

    const dLat = toRad(nLat2 - nLat1);
    const dLon = toRad(nLon2 - nLon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(nLat1)) *
            Math.cos(toRad(nLat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;

    if (d < 0.05) {
        return "Within Destination Area";
    }
    if (d < 1) {
        return `${Math.round(d * 1000)} m away`;
    }
    return `${d.toFixed(1)} km away`;
}

export default function AdminDestinationsServices() {
    const navigate = useNavigate();
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [availabilityFilter, setAvailabilityFilter] = useState("all");
    const [selectedDestination, setSelectedDestination] = useState(null);

    useEffect(() => {
        loadDestinationsWithServices();
    }, []);

    const loadDestinationsWithServices = async () => {
        try {
            setLoading(true);
            const res = await api.get("admin/destinations-services/");
            setDestinations(res.data || []);
        } catch (error) {
            console.error("Error loading destinations and services:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter destinations based on search query, category, and availability
    const filteredDestinations = destinations.filter((dest) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
            !query ||
            (dest.name && dest.name.toLowerCase().includes(query)) ||
            (dest.district && dest.district.toLowerCase().includes(query)) ||
            (dest.location && dest.location.toLowerCase().includes(query)) ||
            (dest.category && dest.category.toLowerCase().includes(query));

        const matchesCategory =
            categoryFilter === "all" ||
            (dest.category && dest.category.toLowerCase() === categoryFilter.toLowerCase());

        const totalServices = dest.service_counts?.total || 0;
        const matchesAvailability =
            availabilityFilter === "all" ||
            (availabilityFilter === "with_services" && totalServices > 0) ||
            (availabilityFilter === "no_services" && totalServices === 0);

        return matchesSearch && matchesCategory && matchesAvailability;
    });

    const totalDestinationsCount = destinations.length;
    const destinationsWithServicesCount = destinations.filter(
        (d) => (d.service_counts?.total || 0) > 0
    ).length;
    const destinationsNoServicesCount = destinations.filter(
        (d) => (d.service_counts?.total || 0) === 0
    ).length;
    const totalServicesCount = destinations.reduce(
        (acc, d) => acc + (d.service_counts?.total || 0),
        0
    );

    return (
        <div className="admin-dashboard">
            {/* SIDEBAR NAVBAR */}
            <AdminNavbar />

            {/* MAIN CONTENT AREA */}
            <main className="admin-main">
                {/* STICKY HEADER */}
                <header className="admin-header">
                    <div>
                        <p className="welcome-small">SYSTEM MANAGEMENT</p>
                        <h1>Destinations & Nearby Services</h1>
                    </div>

                    <div className="admin-user">
                        <div className="user-avatar">AD</div>
                        <div className="user-info">
                            <strong>Admin</strong>
                        </div>
                    </div>
                </header>

                <section className="dashboard-content">
                    {/* SUMMARY STATS GRID */}
                    <div className="dest-stats-grid">
                        <div className="dest-stat-card">
                            <div className="dest-stat-icon dest-icon">📍</div>
                            <div className="dest-stat-info">
                                <span>Total Destinations</span>
                                <h3>{loading ? "..." : totalDestinationsCount}</h3>
                            </div>
                        </div>

                        <div className="dest-stat-card">
                            <div className="dest-stat-icon active-icon">✅</div>
                            <div className="dest-stat-info">
                                <span>With Services</span>
                                <h3>{loading ? "..." : destinationsWithServicesCount}</h3>
                            </div>
                        </div>

                        <div className="dest-stat-card">
                            <div className="dest-stat-icon empty-icon">⭕</div>
                            <div className="dest-stat-info">
                                <span>No Services Yet</span>
                                <h3>{loading ? "..." : destinationsNoServicesCount}</h3>
                            </div>
                        </div>

                        <div className="dest-stat-card">
                            <div className="dest-stat-icon service-icon">🛎️</div>
                            <div className="dest-stat-info">
                                <span>Total Active Services</span>
                                <h3>{loading ? "..." : totalServicesCount}</h3>
                            </div>
                        </div>
                    </div>

                    {/* SEARCH & FILTER CONTROLS */}
                    <div className="dest-controls-card">
                        <div className="dest-search-box">
                            <input
                                type="text"
                                placeholder="Search by destination name, district, location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="dest-search-input"
                            />
                            {searchQuery && (
                                <button
                                    className="dest-search-clear"
                                    onClick={() => setSearchQuery("")}
                                    title="Clear search"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        <div className="dest-filter-group">
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="dest-select"
                            >
                                <option value="all">All Categories</option>
                                <option value="Beach">Beach</option>
                                <option value="Hill Station">Hill Station</option>
                                <option value="Waterfall">Waterfall</option>
                                <option value="Wildlife">Wildlife</option>
                                <option value="Temple">Temple</option>
                                <option value="Museum">Museum</option>
                                <option value="Other">Other</option>
                            </select>

                            <select
                                value={availabilityFilter}
                                onChange={(e) => setAvailabilityFilter(e.target.value)}
                                className="dest-select"
                            >
                                <option value="all">All Availability</option>
                                <option value="with_services">With Nearby Services</option>
                                <option value="no_services">No Services Available</option>
                            </select>
                        </div>
                    </div>

                    {/* DESTINATIONS TABLE CONTAINER */}
                    <div className="table-wrapper-card">
                        <table className="provider-request-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "40px" }}>#</th>
                                    <th>Destination</th>
                                    <th>District & Location</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: "center" }}>🏨 Hotels</th>
                                    <th style={{ textAlign: "center" }}>🍴 Restaurants</th>
                                    <th style={{ textAlign: "center" }}>🎯 Activities</th>
                                    <th style={{ textAlign: "center" }}>🚗 Transport</th>
                                    <th style={{ textAlign: "center" }}>Total</th>
                                    <th style={{ textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="10"
                                            style={{
                                                textAlign: "center",
                                                padding: "36px",
                                                color: "#64748b",
                                            }}
                                        >
                                            Loading destinations and nearby services...
                                        </td>
                                    </tr>
                                ) : filteredDestinations.length > 0 ? (
                                    filteredDestinations.map((dest, index) => {
                                        const counts = dest.service_counts || {
                                            hotels: 0,
                                            restaurants: 0,
                                            activities: 0,
                                            transportation: 0,
                                            total: 0,
                                        };

                                        return (
                                            <tr key={dest.destination_id || index}>
                                                <td style={{ color: "#64748b" }}>{index + 1}</td>
                                                <td>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                        <strong style={{ color: "#0f172a", fontSize: "12.5px" }}>
                                                            {dest.name}
                                                        </strong>
                                                        <span className="category-pill">{dest.category}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ fontSize: "11.5px" }}>
                                                        <span style={{ fontWeight: "600", color: "#334155" }}>
                                                            {dest.district}
                                                        </span>
                                                        <div style={{ color: "#64748b", fontSize: "11px" }}>
                                                            {dest.location || "-"}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`status-badge ${
                                                            dest.status === "Active" ? "approved" : "rejected"
                                                        }`}
                                                    >
                                                        {dest.status ? dest.status.toUpperCase() : "ACTIVE"}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    <span className={`count-pill ${counts.hotels > 0 ? "hotel" : "empty"}`}>
                                                        {counts.hotels}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    <span className={`count-pill ${counts.restaurants > 0 ? "restaurant" : "empty"}`}>
                                                        {counts.restaurants}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    <span className={`count-pill ${counts.activities > 0 ? "activity" : "empty"}`}>
                                                        {counts.activities}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    <span className={`count-pill ${counts.transportation > 0 ? "transportation" : "empty"}`}>
                                                        {counts.transportation}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    <span className="count-pill total">
                                                        {counts.total}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: "right" }}>
                                                    <button
                                                        className="btn-view-services"
                                                        onClick={() => setSelectedDestination(dest)}
                                                        title="View destination details and nearby services"
                                                    >
                                                        Inspect Services →
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="10"
                                            style={{
                                                textAlign: "center",
                                                padding: "40px 20px",
                                                color: "#64748b",
                                            }}
                                        >
                                            No destinations found matching your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            {/* ================= COMPACT DETAIL MODAL ================= */}
            {selectedDestination && (
                <div
                    className="dest-modal-overlay"
                    onClick={() => setSelectedDestination(null)}
                >
                    <div
                        className="dest-modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* MODAL HEADER */}
                        <div className="dest-modal-header">
                            <div className="dest-modal-title">
                                <h2>{selectedDestination.name}</h2>
                                <span className="category-pill" style={{ background: "rgba(255,255,255,0.15)", color: "#ffffff" }}>
                                    {selectedDestination.category}
                                </span>
                            </div>
                            <button
                                className="dest-modal-close"
                                onClick={() => setSelectedDestination(null)}
                                title="Close dialog"
                            >
                                ✕
                            </button>
                        </div>

                        {/* MODAL BODY */}
                        <div className="dest-modal-body">
                            {/* DESTINATION INFO BANNER */}
                            <div className="dest-info-banner">
                                {selectedDestination.image ? (
                                    <img
                                        src={
                                            selectedDestination.image.startsWith("http")
                                                ? selectedDestination.image
                                                : `http://127.0.0.1:8000${selectedDestination.image}`
                                        }
                                        alt={selectedDestination.name}
                                        className="dest-banner-img"
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                        }}
                                    />
                                ) : (
                                    <div className="dest-banner-img placeholder">📍</div>
                                )}

                                <div className="dest-banner-details">
                                    <h3>
                                        {selectedDestination.name}
                                        <span
                                            className={`status-badge ${
                                                selectedDestination.status === "Active" ? "approved" : "rejected"
                                            }`}
                                            style={{ fontSize: "10px", padding: "2px 8px" }}
                                        >
                                            {selectedDestination.status || "ACTIVE"}
                                        </span>
                                    </h3>
                                    <p>{selectedDestination.description}</p>

                                    <div className="dest-meta-row">
                                        <div className="dest-meta-item">
                                            <span>District:</span>
                                            <strong>{selectedDestination.district}</strong>
                                        </div>
                                        <div className="dest-meta-item">
                                            <span>Location:</span>
                                            <strong>{selectedDestination.location}</strong>
                                        </div>
                                        {selectedDestination.latitude && selectedDestination.longitude && (
                                            <div className="dest-meta-item">
                                                <span>Coordinates:</span>
                                                <strong>
                                                    {parseFloat(selectedDestination.latitude).toFixed(4)}° N,{" "}
                                                    {parseFloat(selectedDestination.longitude).toFixed(4)}° E
                                                </strong>
                                            </div>
                                        )}
                                        <div className="dest-meta-item">
                                            <span>Nearby Services:</span>
                                            <strong>{selectedDestination.service_counts?.total || 0} Total</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 1. HOTELS SECTION */}
                            <div className="service-category-block">
                                <div className="category-block-header">
                                    <h4>🏨 Hotels & Accommodations</h4>
                                    <span
                                        className={`category-count-badge ${
                                            (selectedDestination.services?.hotels?.length || 0) === 0 ? "zero" : ""
                                        }`}
                                    >
                                        {selectedDestination.services?.hotels?.length || 0} Available
                                    </span>
                                </div>

                                {selectedDestination.services?.hotels?.length > 0 ? (
                                    <div className="service-cards-list">
                                        {selectedDestination.services.hotels.map((item) => {
                                            const hotel = item.hotel || {};
                                            const distanceStr = calculateDistance(
                                                selectedDestination.latitude,
                                                selectedDestination.longitude,
                                                item.latitude,
                                                item.longitude
                                            );

                                            return (
                                                <div className="service-card-item" key={item.provider_id}>
                                                    <div className="service-card-top">
                                                        <div>
                                                            <div className="service-card-title">{hotel.hotel_name || item.business_name}</div>
                                                            <div className="service-card-business">By {item.business_name}</div>
                                                        </div>
                                                        <span className="status-badge approved">HOTEL</span>
                                                    </div>

                                                    <div className="service-card-info-row">
                                                        📍 <span>{hotel.location || hotel.address || item.location || item.district || "Location N/A"}</span>
                                                    </div>

                                                    <div className="service-card-info-row">
                                                        👤 <span>Contact: {item.email || hotel.email || "N/A"} {item.phone ? `| 📞 ${item.phone}` : ""}</span>
                                                    </div>

                                                    {hotel.check_in_time && hotel.check_out_time && (
                                                        <div className="service-card-info-row">
                                                            ⏰ <span>Check-in: {hotel.check_in_time} | Check-out: {hotel.check_out_time}</span>
                                                        </div>
                                                    )}

                                                    {distanceStr && (
                                                        <div className="service-distance-badge">
                                                            🧭 {distanceStr}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="empty-category-notice">
                                        ℹ️ No nearby hotels available for this destination.
                                    </div>
                                )}
                            </div>

                            {/* 2. RESTAURANTS SECTION */}
                            <div className="service-category-block">
                                <div className="category-block-header">
                                    <h4>🍴 Restaurants & Dining</h4>
                                    <span
                                        className={`category-count-badge ${
                                            (selectedDestination.services?.restaurants?.length || 0) === 0 ? "zero" : ""
                                        }`}
                                    >
                                        {selectedDestination.services?.restaurants?.length || 0} Available
                                    </span>
                                </div>

                                {selectedDestination.services?.restaurants?.length > 0 ? (
                                    <div className="service-cards-list">
                                        {selectedDestination.services.restaurants.map((item) => {
                                            const rest = item.restaurant || {};
                                            const distanceStr = calculateDistance(
                                                selectedDestination.latitude,
                                                selectedDestination.longitude,
                                                item.latitude,
                                                item.longitude
                                            );

                                            return (
                                                <div className="service-card-item" key={item.provider_id}>
                                                    <div className="service-card-top">
                                                        <div>
                                                            <div className="service-card-title">{rest.restaurant_name || item.business_name}</div>
                                                            <div className="service-card-business">By {item.business_name}</div>
                                                        </div>
                                                        <span className="status-badge approved">DINING</span>
                                                    </div>

                                                    <div className="service-card-info-row">
                                                        📍 <span>{rest.location || rest.address || item.location || item.district || "Location N/A"}</span>
                                                    </div>

                                                    {rest.cuisine_type && (
                                                        <div className="service-card-info-row">
                                                            🍲 <span>Cuisine: {rest.cuisine_type}</span>
                                                        </div>
                                                    )}

                                                    <div className="service-card-info-row">
                                                        👤 <span>Contact: {item.email || rest.email || "N/A"} {item.phone ? `| 📞 ${item.phone}` : ""}</span>
                                                    </div>

                                                    {rest.opening_time && rest.closing_time && (
                                                        <div className="service-card-info-row">
                                                            ⏰ <span>Hours: {rest.opening_time} - {rest.closing_time}</span>
                                                        </div>
                                                    )}

                                                    {distanceStr && (
                                                        <div className="service-distance-badge">
                                                            🧭 {distanceStr}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="empty-category-notice">
                                        ℹ️ No nearby restaurants available for this destination.
                                    </div>
                                )}
                            </div>

                            {/* 3. ACTIVITIES SECTION */}
                            <div className="service-category-block">
                                <div className="category-block-header">
                                    <h4>🎯 Activities & Experiences</h4>
                                    <span
                                        className={`category-count-badge ${
                                            (selectedDestination.services?.activities?.length || 0) === 0 ? "zero" : ""
                                        }`}
                                    >
                                        {selectedDestination.services?.activities?.length || 0} Available
                                    </span>
                                </div>

                                {selectedDestination.services?.activities?.length > 0 ? (
                                    <div className="service-cards-list">
                                        {selectedDestination.services.activities.map((item) => {
                                            const act = item.activity || {};
                                            const distanceStr = calculateDistance(
                                                selectedDestination.latitude,
                                                selectedDestination.longitude,
                                                item.latitude,
                                                item.longitude
                                            );

                                            return (
                                                <div className="service-card-item" key={item.provider_id}>
                                                    <div className="service-card-top">
                                                        <div>
                                                            <div className="service-card-title">{act.activity_name || item.business_name}</div>
                                                            <div className="service-card-business">By {item.business_name}</div>
                                                        </div>
                                                        <span className="status-badge approved">ACTIVITY</span>
                                                    </div>

                                                    <div className="service-card-info-row">
                                                        📍 <span>{act.location || item.location || item.district || "Location N/A"}</span>
                                                    </div>

                                                    <div className="service-card-info-row">
                                                        👤 <span>Contact: {item.email || act.email || "N/A"} {item.phone ? `| 📞 ${item.phone}` : ""}</span>
                                                    </div>

                                                    {act.duration && (
                                                        <div className="service-card-info-row">
                                                            ⏱️ <span>Duration: {act.duration}</span>
                                                        </div>
                                                    )}

                                                    {distanceStr && (
                                                        <div className="service-distance-badge">
                                                            🧭 {distanceStr}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="empty-category-notice">
                                        ℹ️ No nearby activities available for this destination.
                                    </div>
                                )}
                            </div>

                            {/* 4. TRANSPORTATION SECTION */}
                            <div className="service-category-block">
                                <div className="category-block-header">
                                    <h4>🚗 Transportation & Cabs</h4>
                                    <span
                                        className={`category-count-badge ${
                                            (selectedDestination.services?.transportation?.length || 0) === 0 ? "zero" : ""
                                        }`}
                                    >
                                        {selectedDestination.services?.transportation?.length || 0} Available
                                    </span>
                                </div>

                                {selectedDestination.services?.transportation?.length > 0 ? (
                                    <div className="service-cards-list">
                                        {selectedDestination.services.transportation.map((item) => {
                                            const trans = item.transportation || {};
                                            const distanceStr = calculateDistance(
                                                selectedDestination.latitude,
                                                selectedDestination.longitude,
                                                item.latitude,
                                                item.longitude
                                            );

                                            return (
                                                <div className="service-card-item" key={item.provider_id}>
                                                    <div className="service-card-top">
                                                        <div>
                                                            <div className="service-card-title">{trans.service_name || item.business_name}</div>
                                                            <div className="service-card-business">By {item.business_name}</div>
                                                        </div>
                                                        <span className="status-badge approved">TRANSPORT</span>
                                                    </div>

                                                    <div className="service-card-info-row">
                                                        📍 <span>Hub: {trans.starting_location || item.location || "Kerala"}</span>
                                                    </div>

                                                    {trans.service_area && (
                                                        <div className="service-card-info-row">
                                                            🗺️ <span>Coverage: {trans.service_area}</span>
                                                        </div>
                                                    )}

                                                    <div className="service-card-info-row">
                                                        👤 <span>Contact: {item.email || trans.email || "N/A"} {item.phone ? `| 📞 ${item.phone}` : ""}</span>
                                                    </div>

                                                    {distanceStr && (
                                                        <div className="service-distance-badge">
                                                            🧭 {distanceStr}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="empty-category-notice">
                                        ℹ️ No nearby transportation services available for this destination.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* MODAL FOOTER */}
                        <div className="dest-modal-footer">
                            <button
                                className="btn-close-modal"
                                onClick={() => setSelectedDestination(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
