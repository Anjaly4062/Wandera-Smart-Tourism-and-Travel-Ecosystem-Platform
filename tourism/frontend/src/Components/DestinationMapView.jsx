import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Haversine formula to compute great-circle distance between two points in km
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
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

    if (d < 1) {
        return `${Math.round(d * 1000)} m`;
    }
    return `${d.toFixed(1)} km`;
}

// Function to generate custom HTML DivIcons for destination and different service types
function createServiceIcon(emoji, bgGradient, borderColor) {
    return L.divIcon({
        className: "custom-map-marker-pin",
        html: `
            <div style="
                background: ${bgGradient};
                color: #ffffff;
                width: 30px;
                height: 30px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 6px rgba(0,0,0,0.25);
                border: 2px solid ${borderColor};
            ">
                <span style="transform: rotate(45deg); font-size: 14px; line-height: 1;">${emoji}</span>
            </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -28],
    });
}

const destinationIcon = createServiceIcon("📍", "linear-gradient(135deg, #059669, #047857)", "#ffffff");
const hotelIcon = createServiceIcon("🏨", "linear-gradient(135deg, #2563eb, #1d4ed8)", "#ffffff");
const restaurantIcon = createServiceIcon("🍴", "linear-gradient(135deg, #d97706, #b45309)", "#ffffff");
const activityIcon = createServiceIcon("🎯", "linear-gradient(135deg, #9333ea, #7e22ce)", "#ffffff");
const transportationIcon = createServiceIcon("🚕", "linear-gradient(135deg, #0891b2, #0e7490)", "#ffffff");

export default function DestinationMapView({
    destination,
    services = { hotels: [], restaurants: [], transportation: [], activities: [] },
}) {
    const destLat = destination?.latitude ? parseFloat(destination.latitude) : null;
    const destLng = destination?.longitude ? parseFloat(destination.longitude) : null;

    const hasDestinationCoords =
        destLat !== null && destLng !== null && !isNaN(destLat) && !isNaN(destLng);

    if (!hasDestinationCoords) {
        return (
            <div
                style={{
                    maxWidth: "520px",
                    padding: "16px 20px",
                    background: "#f8fafc",
                    border: "1px dashed #cbd5e1",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    color: "#64748b",
                    margin: "16px 0",
                }}
            >
                <span style={{ fontSize: "22px" }}>🗺️</span>
                <div>
                    <strong style={{ fontSize: "14px", color: "#334155", display: "block" }}>
                        Location map not available
                    </strong>
                    <span style={{ fontSize: "12px" }}>
                        Coordinates have not been set for {destination?.name || "this destination"}.
                    </span>
                </div>
            </div>
        );
    }

    // Collect all services that have coordinates
    const allServices = [
        ...(services.hotels || []).map((s) => ({ ...s, type: "Hotel", icon: hotelIcon })),
        ...(services.restaurants || []).map((s) => ({ ...s, type: "Restaurant", icon: restaurantIcon })),
        ...(services.transportation || []).map((s) => ({ ...s, type: "Transportation", icon: transportationIcon })),
        ...(services.activities || []).map((s) => ({ ...s, type: "Activity", icon: activityIcon })),
    ].filter((s) => {
        const lat = parseFloat(s.latitude);
        const lng = parseFloat(s.longitude);
        return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    });

    return (
        <div style={{ margin: "20px 0" }}>
            {/* Small Box Container */}
            <div
                style={{
                    maxWidth: "520px",
                    background: "#ffffff",
                    borderRadius: "14px",
                    padding: "16px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "12px",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "16px" }}>📍</span>
                        <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#173527" }}>
                            Location Map
                        </h4>
                    </div>
                    <span
                        style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            color: "#059669",
                            background: "#ecfdf5",
                            padding: "2px 8px",
                            borderRadius: "12px",
                        }}
                    >
                        {destination.name}
                    </span>
                </div>

                {/* Map Box */}
                <div
                    style={{
                        height: "220px",
                        width: "100%",
                        borderRadius: "10px",
                        overflow: "hidden",
                        border: "1px solid #cbd5e1",
                        position: "relative",
                        zIndex: 1,
                    }}
                >
                    <MapContainer
                        center={[destLat, destLng]}
                        zoom={13}
                        scrollWheelZoom={false}
                        style={{ height: "100%", width: "100%" }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Destination Marker */}
                        <Marker position={[destLat, destLng]} icon={destinationIcon}>
                            <Popup>
                                <div style={{ minWidth: "170px", padding: "2px" }}>
                                    <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "#059669" }}>
                                        Destination
                                    </span>
                                    <h4 style={{ margin: "2px 0 4px 0", fontSize: "14px", color: "#0f172a" }}>
                                        📍 {destination.name}
                                    </h4>
                                    <p style={{ margin: 0, fontSize: "12px", color: "#475569" }}>
                                        {destination.district ? `${destination.district}, Kerala` : destination.location}
                                    </p>
                                </div>
                            </Popup>
                        </Marker>

                        {/* Service Providers Markers */}
                        {allServices.map((service) => {
                            const sLat = parseFloat(service.latitude);
                            const sLng = parseFloat(service.longitude);
                            const distance = calculateHaversineDistance(destLat, destLng, sLat, sLng);

                            return (
                                <Marker
                                    key={`${service.type}-${service.provider_id}`}
                                    position={[sLat, sLng]}
                                    icon={service.icon}
                                >
                                    <Popup>
                                        <div style={{ minWidth: "180px", padding: "2px" }}>
                                            <span
                                                style={{
                                                    fontSize: "10px",
                                                    fontWeight: "700",
                                                    textTransform: "uppercase",
                                                    color: "#2563eb",
                                                }}
                                            >
                                                {service.type}
                                            </span>
                                            <h4 style={{ margin: "2px 0 4px 0", fontSize: "14px", color: "#0f172a" }}>
                                                {service.business_name}
                                            </h4>
                                            <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#475569" }}>
                                                📍 {service.location || service.address || "Location on map"}
                                            </p>
                                            {distance && (
                                                <div
                                                    style={{
                                                        fontSize: "11px",
                                                        fontWeight: "600",
                                                        color: "#059669",
                                                        background: "#ecfdf5",
                                                        padding: "2px 6px",
                                                        borderRadius: "4px",
                                                        display: "inline-block",
                                                    }}
                                                >
                                                    📏 {distance} away
                                                </div>
                                            )}
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MapContainer>
                </div>

                {/* Compact Legend / Footer inside small box */}
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "6px",
                        marginTop: "10px",
                        fontSize: "11px",
                    }}
                >
                    <span style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", padding: "2px 6px", borderRadius: "10px", fontWeight: "500" }}>
                        📍 {destination.name}
                    </span>
                    {services.hotels?.some((s) => s.latitude) && (
                        <span style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e40af", padding: "2px 6px", borderRadius: "10px", fontWeight: "500" }}>
                            🏨 {services.hotels.filter((s) => s.latitude).length} Hotels
                        </span>
                    )}
                    {services.restaurants?.some((s) => s.latitude) && (
                        <span style={{ background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e", padding: "2px 6px", borderRadius: "10px", fontWeight: "500" }}>
                            🍴 {services.restaurants.filter((s) => s.latitude).length} Restaurants
                        </span>
                    )}
                    {services.activities?.some((s) => s.latitude) && (
                        <span style={{ background: "#faf5ff", border: "1px solid #e9d5ff", color: "#6b21a8", padding: "2px 6px", borderRadius: "10px", fontWeight: "500" }}>
                            🎯 {services.activities.filter((s) => s.latitude).length} Activities
                        </span>
                    )}
                    {services.transportation?.some((s) => s.latitude) && (
                        <span style={{ background: "#ecfeff", border: "1px solid #a5f3fc", color: "#155e75", padding: "2px 6px", borderRadius: "10px", fontWeight: "500" }}>
                            🚕 {services.transportation.filter((s) => s.latitude).length} Transport
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
