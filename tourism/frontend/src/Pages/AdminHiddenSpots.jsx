import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import AdminNavbar from "../Components/AdminNavbar";
import api from "../services/api";
import "../styles/AdminHiddenSpots.css";
import "../styles/AdminHome.css";
import "../styles/AdminProviderRequest.css";

// Fix Leaflet icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

export default function AdminHiddenSpots() {
    const [pendingSpots, setPendingSpots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSpot, setSelectedSpot] = useState(null);
    const [actionMessage, setActionMessage] = useState("");

    useEffect(() => {
        loadPendingSpots();
    }, []);

    const loadPendingSpots = async () => {
        try {
            const res = await api.get("admin/hidden-spots/");
            setPendingSpots(res.data || []);
        } catch (error) {
            console.error("Error loading pending hidden spots:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (spotId) => {
        try {
            const res = await api.post(`admin/hidden-spot/${spotId}/accept/`);
            setActionMessage(res.data?.message || "Hidden spot approved successfully!");
            setSelectedSpot(null);
            loadPendingSpots();
            setTimeout(() => setActionMessage(""), 4000);
        } catch (error) {
            console.error("Error accepting hidden spot:", error);
            alert("Failed to accept hidden spot.");
        }
    };

    const handleReject = async (spotId) => {
        if (!window.confirm("Are you sure you want to reject this hidden spot submission?")) {
            return;
        }

        try {
            const res = await api.post(`admin/hidden-spot/${spotId}/reject/`);
            setActionMessage(res.data?.message || "Hidden spot rejected.");
            setSelectedSpot(null);
            loadPendingSpots();
            setTimeout(() => setActionMessage(""), 4000);
        } catch (error) {
            console.error("Error rejecting hidden spot:", error);
            alert("Failed to reject hidden spot.");
        }
    };

    return (
        <div className="admin-dashboard">
            <AdminNavbar />

            <main className="admin-main">
                <header className="admin-header">
                    <div>
                        <p className="welcome-small">PORTAL MANAGEMENT</p>
                        <h1>Hidden Spot Requests</h1>
                    </div>

                    <div className="admin-user">
                        <div className="user-avatar">AD</div>
                        <div className="user-info">
                            <strong>Admin</strong>
                        </div>
                    </div>
                </header>

                <section className="dashboard-content">
                    {/* FEEDBACK ALERT */}
                    {actionMessage && (
                        <div
                            style={{
                                background: "#ecfdf5",
                                border: "1px solid #10b981",
                                color: "#065f46",
                                padding: "10px 14px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                marginBottom: "14px",
                                fontWeight: "500",
                            }}
                        >
                            ✓ {actionMessage}
                        </div>
                    )}

                    {/* SUMMARY BANNER */}
                    <div className="request-summary-card" style={{ marginBottom: "16px" }}>
                        <div className="summary-left">
                            <span className="summary-label">COMMUNITY SUBMISSIONS</span>
                            <h2>Pending Hidden Spots Verification</h2>
                            <p>
                                Review newly discovered attractions submitted by tourists before publishing them to the public explorer.
                            </p>
                        </div>

                        <div className="summary-badge-pill">
                            <span>Pending Requests</span>
                            <strong>
                                {pendingSpots.length} Spot{pendingSpots.length !== 1 ? "s" : ""}
                            </strong>
                        </div>
                    </div>

                    {/* PENDING SPOTS TABLE */}
                    <div className="hidden-spots-admin-table-wrapper">
                        <table className="hidden-spots-admin-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "40px" }}>#</th>
                                    <th>Spot Name</th>
                                    <th>Type</th>
                                    <th>Location / Landmark</th>
                                    <th>Submitted By</th>
                                    <th>Photos</th>
                                    <th>Date</th>
                                    <th style={{ textAlign: "center", width: "160px" }}>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            style={{
                                                textAlign: "center",
                                                padding: "36px",
                                                color: "#64748b",
                                            }}
                                        >
                                            Loading pending hidden spot requests...
                                        </td>
                                    </tr>
                                ) : pendingSpots.length > 0 ? (
                                    pendingSpots.map((spot, idx) => {
                                        const photosCount = (spot.images?.length || 0) + (spot.image ? 1 : 0);

                                        return (
                                            <tr key={spot.spot_id}>
                                                <td style={{ color: "#64748b", fontWeight: "600" }}>{idx + 1}</td>
                                                <td>
                                                    <strong style={{ color: "#0f172a" }}>{spot.name}</strong>
                                                </td>
                                                <td>
                                                    <span
                                                        style={{
                                                            background: "#f1f5f9",
                                                            border: "1px solid #e2e8f0",
                                                            padding: "2px 7px",
                                                            borderRadius: "4px",
                                                            fontSize: "10.5px",
                                                            fontWeight: "600",
                                                            color: "#334155",
                                                        }}
                                                    >
                                                        {spot.spot_type}
                                                    </span>
                                                </td>
                                                <td>{spot.location}</td>
                                                <td>
                                                    <div style={{ fontWeight: "600", color: "#0f172a" }}>
                                                        {spot.tourist_name || "Tourist"}
                                                    </div>
                                                    <div style={{ fontSize: "10px", color: "#64748b" }}>
                                                        {spot.tourist_email}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{ fontSize: "11px", color: "#475569" }}>
                                                        📷 {photosCount} photo{photosCount !== 1 ? "s" : ""}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: "11px", whiteSpace: "nowrap" }}>
                                                    {spot.created_at ? spot.created_at.split("T")[0] : "—"}
                                                </td>
                                                <td>
                                                    <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                                                        <button
                                                            type="button"
                                                            className="btn-action-view"
                                                            onClick={() => setSelectedSpot(spot)}
                                                            title="View full details and location map"
                                                        >
                                                            👁️ View
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="btn-action-accept"
                                                            onClick={() => handleAccept(spot.spot_id)}
                                                            title="Approve hidden spot"
                                                        >
                                                            Accept
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="btn-action-reject"
                                                            onClick={() => handleReject(spot.spot_id)}
                                                            title="Reject hidden spot"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            style={{
                                                textAlign: "center",
                                                padding: "36px",
                                                color: "#64748b",
                                            }}
                                        >
                                            No pending hidden spot requests awaiting verification.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            {/* DETAILS & MAP VERIFICATION MODAL */}
            {selectedSpot && (
                <div className="admin-spot-modal-overlay" onClick={() => setSelectedSpot(null)}>
                    <div className="admin-spot-modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-spot-modal-header">
                            <div>
                                <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>
                                    {selectedSpot.name}
                                </h3>
                                <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#64748b" }}>
                                    Type: {selectedSpot.spot_type} | Submitted on {selectedSpot.created_at?.split("T")[0] || "—"}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedSpot(null)}
                                style={{
                                    background: "transparent",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "6px",
                                    width: "28px",
                                    height: "28px",
                                    cursor: "pointer",
                                    color: "#64748b",
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="admin-spot-modal-body">
                            {/* DETAILS GRID */}
                            <div className="spot-detail-grid">
                                <div className="spot-detail-item">
                                    <span className="item-label">Tourist Contributor</span>
                                    <span className="item-value">{selectedSpot.tourist_name}</span>
                                </div>

                                <div className="spot-detail-item">
                                    <span className="item-label">Email Address</span>
                                    <span className="item-value">{selectedSpot.tourist_email || "—"}</span>
                                </div>

                                <div className="spot-detail-item">
                                    <span className="item-label">Phone Number</span>
                                    <span className="item-value">{selectedSpot.tourist_phone || "—"}</span>
                                </div>

                                <div className="spot-detail-item">
                                    <span className="item-label">Location / Landmark</span>
                                    <span className="item-value">{selectedSpot.location}</span>
                                </div>

                                <div className="spot-detail-item">
                                    <span className="item-label">GPS Coordinates</span>
                                    <span className="item-value">
                                        {selectedSpot.latitude && selectedSpot.longitude
                                            ? `${Number(selectedSpot.latitude).toFixed(6)}, ${Number(selectedSpot.longitude).toFixed(6)}`
                                            : "Not pinned"}
                                    </span>
                                </div>

                                <div className="spot-detail-item">
                                    <span className="item-label">Current Status</span>
                                    <span className="item-value" style={{ color: "#d97706" }}>
                                        {selectedSpot.status}
                                    </span>
                                </div>
                            </div>

                            {/* DESCRIPTION */}
                            <div>
                                <strong style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                                    Description
                                </strong>
                                <p style={{ fontSize: "12px", color: "#334155", lineHeight: "1.5", margin: 0, background: "#f8fafc", padding: "10px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                                    {selectedSpot.description}
                                </p>
                            </div>

                            {/* EXACT MAP LOCATION */}
                            <div>
                                <strong style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                                    Exact Location on Map
                                </strong>

                                {selectedSpot.latitude && selectedSpot.longitude ? (
                                    <div style={{ height: "220px", width: "100%", borderRadius: "6px", overflow: "hidden", border: "1px solid #cbd5e1" }}>
                                        <MapContainer
                                            center={[parseFloat(selectedSpot.latitude), parseFloat(selectedSpot.longitude)]}
                                            zoom={14}
                                            scrollWheelZoom={false}
                                            style={{ height: "100%", width: "100%" }}
                                        >
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <Marker
                                                position={[parseFloat(selectedSpot.latitude), parseFloat(selectedSpot.longitude)]}
                                            >
                                                <Popup>
                                                    <strong style={{ fontSize: "12px" }}>{selectedSpot.name}</strong>
                                                    <br />
                                                    <span style={{ fontSize: "11px", color: "#475569" }}>{selectedSpot.location}</span>
                                                </Popup>
                                            </Marker>
                                        </MapContainer>
                                    </div>
                                ) : (
                                    <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>
                                        No exact GPS coordinates pinned for this submission.
                                    </p>
                                )}
                            </div>

                            {/* MULTIPLE PHOTOS GALLERY */}
                            <div>
                                <strong style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                                    Uploaded Photos ({(selectedSpot.images?.length || 0) + (selectedSpot.image ? 1 : 0)})
                                </strong>

                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                    {selectedSpot.image && (
                                        <img
                                            src={
                                                selectedSpot.image.startsWith("http")
                                                    ? selectedSpot.image
                                                    : `http://127.0.0.1:8000${selectedSpot.image}`
                                            }
                                            alt="Spot Primary"
                                            style={{ width: "90px", height: "90px", objectFit: "cover", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                                        />
                                    )}

                                    {selectedSpot.images &&
                                        selectedSpot.images.map((imgObj, i) => (
                                            <img
                                                key={imgObj.image_id || i}
                                                src={
                                                    imgObj.image.startsWith("http")
                                                        ? imgObj.image
                                                        : `http://127.0.0.1:8000${imgObj.image}`
                                                }
                                                alt={`Spot ${i}`}
                                                style={{ width: "90px", height: "90px", objectFit: "cover", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                                            />
                                        ))}

                                    {!selectedSpot.image && (!selectedSpot.images || selectedSpot.images.length === 0) && (
                                        <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>
                                            No photos uploaded with this submission.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* MODAL FOOTER WITH ACCEPT & REJECT */}
                        <div
                            style={{
                                padding: "12px 18px",
                                borderTop: "1px solid #e2e8f0",
                                display: "flex",
                                justifyContent: "space-between",
                                background: "#f8fafc",
                                borderRadius: "0 0 10px 10px",
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => setSelectedSpot(null)}
                                style={{
                                    background: "#ffffff",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "6px",
                                    padding: "6px 14px",
                                    fontSize: "11.5px",
                                    fontWeight: "600",
                                    color: "#475569",
                                    cursor: "pointer",
                                }}
                            >
                                Close
                            </button>

                            <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                    type="button"
                                    className="btn-action-reject"
                                    onClick={() => handleReject(selectedSpot.spot_id)}
                                    style={{ padding: "6px 14px" }}
                                >
                                    Reject Submission
                                </button>

                                <button
                                    type="button"
                                    className="btn-action-accept"
                                    onClick={() => handleAccept(selectedSpot.spot_id)}
                                    style={{ padding: "6px 14px" }}
                                >
                                    Accept & Publish
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
