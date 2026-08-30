import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet standard default icon issue in Vite/Webpack bundlers
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Custom styled pin icon
const customLocationIcon = new L.Icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to handle map clicks
function ClickHandler({ onLocationChange }) {
    useMapEvents({
        click(e) {
            const lat = parseFloat(e.latlng.lat.toFixed(7));
            const lng = parseFloat(e.latlng.lng.toFixed(7));
            onLocationChange(lat, lng);
        },
    });
    return null;
}

// Component to recenter map when coordinates change
function RecenterMap({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position && position[0] && position[1]) {
            map.setView(position, Math.max(map.getZoom(), 12), { animate: true });
        }
    }, [position, map]);
    return null;
}

/**
 * Reusable MapPicker Component
 *
 * Props:
 * - latitude: number | string (optional initial/current latitude)
 * - longitude: number | string (optional initial/current longitude)
 * - onLocationSelect: function({ latitude, longitude, lat, lng })
 * - height: string (CSS height, default "320px")
 * - readOnly: boolean (if true, disables clicking)
 */
export default function MapPicker({
    latitude,
    longitude,
    onLocationSelect,
    height = "320px",
    readOnly = false,
}) {
    // Default to Kerala geographic center if coordinates are not provided
    const DEFAULT_CENTER = [10.5276, 76.2144]; // Thrissur / Central Kerala
    const DEFAULT_ZOOM = 7;

    const initialLat = latitude !== undefined && latitude !== null && latitude !== ""
        ? parseFloat(latitude)
        : null;
    const initialLng = longitude !== undefined && longitude !== null && longitude !== ""
        ? parseFloat(longitude)
        : null;

    const hasValidCoords = initialLat !== null && initialLng !== null && !isNaN(initialLat) && !isNaN(initialLng);

    const [selectedCoords, setSelectedCoords] = useState(
        hasValidCoords ? { lat: initialLat, lng: initialLng } : null
    );

    useEffect(() => {
        if (hasValidCoords) {
            setSelectedCoords({ lat: initialLat, lng: initialLng });
        } else if (latitude === "" || latitude === null || latitude === undefined) {
            setSelectedCoords(null);
        }
    }, [latitude, longitude]);

    const handleLocationChange = (lat, lng) => {
        if (readOnly) return;
        setSelectedCoords({ lat, lng });

        if (onLocationSelect) {
            onLocationSelect({
                latitude: lat,
                longitude: lng,
                lat,
                lng,
            });
        }
    };

    const handleClear = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (readOnly) return;
        setSelectedCoords(null);
        if (onLocationSelect) {
            onLocationSelect({
                latitude: null,
                longitude: null,
                lat: null,
                lng: null,
            });
        }
    };

    const mapCenter = selectedCoords
        ? [selectedCoords.lat, selectedCoords.lng]
        : DEFAULT_CENTER;
    const mapZoom = selectedCoords ? 13 : DEFAULT_ZOOM;

    return (
        <div className="map-picker-container" style={{ width: "100%", margin: "8px 0" }}>
            {/* Map Canvas Header Info */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    background: "#0f172a",
                    color: "#f8fafc",
                    borderTopLeftRadius: "8px",
                    borderTopRightRadius: "8px",
                    fontSize: "13px",
                    borderBottom: "1px solid #334155",
                    flexWrap: "wrap",
                    gap: "8px",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>📍</span>
                    <span>
                        {selectedCoords
                            ? `Selected: ${selectedCoords.lat.toFixed(6)}, ${selectedCoords.lng.toFixed(6)}`
                            : readOnly
                            ? "No location pinned"
                            : "Click anywhere on the map to pin location"}
                    </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {!readOnly && selectedCoords && (
                        <button
                            type="button"
                            onClick={handleClear}
                            style={{
                                background: "transparent",
                                border: "1px solid #ef4444",
                                color: "#ef4444",
                                borderRadius: "4px",
                                padding: "3px 8px",
                                fontSize: "11px",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                            }}
                            title="Clear selected pin"
                        >
                            ✕ Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Leaflet Map */}
            <div
                style={{
                    height: height,
                    width: "100%",
                    borderBottomLeftRadius: "8px",
                    borderBottomRightRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid #334155",
                    borderTop: "none",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    scrollWheelZoom={true}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {!readOnly && <ClickHandler onLocationChange={handleLocationChange} />}
                    {selectedCoords && <RecenterMap position={[selectedCoords.lat, selectedCoords.lng]} />}

                    {selectedCoords && (
                        <Marker
                            position={[selectedCoords.lat, selectedCoords.lng]}
                            icon={customLocationIcon}
                        >
                            <Popup>
                                <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
                                    <strong style={{ color: "#0f766e" }}>📍 Pinned Coordinates</strong>
                                    <br />
                                    <span>Lat: {selectedCoords.lat.toFixed(6)}</span>
                                    <br />
                                    <span>Lng: {selectedCoords.lng.toFixed(6)}</span>
                                </div>
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>

            {/* Coordinate display readout */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    marginTop: "8px",
                    fontSize: "12px",
                }}
            >
                <div
                    style={{
                        padding: "6px 10px",
                        background: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        color: "#334155",
                    }}
                >
                    <strong style={{ color: "#64748b", display: "block", fontSize: "11px" }}>Selected Latitude:</strong>
                    <span style={{ fontWeight: 600, color: selectedCoords ? "#0f172a" : "#94a3b8" }}>
                        {selectedCoords ? selectedCoords.lat.toFixed(7) : "Not selected"}
                    </span>
                </div>

                <div
                    style={{
                        padding: "6px 10px",
                        background: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        color: "#334155",
                    }}
                >
                    <strong style={{ color: "#64748b", display: "block", fontSize: "11px" }}>Selected Longitude:</strong>
                    <span style={{ fontWeight: 600, color: selectedCoords ? "#0f172a" : "#94a3b8" }}>
                        {selectedCoords ? selectedCoords.lng.toFixed(7) : "Not selected"}
                    </span>
                </div>
            </div>
        </div>
    );
}
