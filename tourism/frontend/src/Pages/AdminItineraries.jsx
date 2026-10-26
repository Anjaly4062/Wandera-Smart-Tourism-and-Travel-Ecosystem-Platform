import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../Components/AdminNavbar";
import api from "../Services/Api";
import "../styles/AdminHome.css";
import "../styles/AdminProviderRequest.css";
import "../styles/AdminBookings.css";
import "../styles/AdminItineraries.css";

export default function AdminItineraries() {
    const navigate = useNavigate();
    const [itineraries, setItineraries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItinerary, setSelectedItinerary] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [downloading, setDownloading] = useState(false);

    // Strict Admin Access Control
    useEffect(() => {
        const role = localStorage.getItem("role");
        const userId = localStorage.getItem("user_id");

        if (!userId || role !== "admin") {
            alert("Access denied. Admin privileges required to view user itineraries.");
            navigate("/login");
            return;
        }

        fetchItineraries();
    }, [navigate]);

    const fetchItineraries = async () => {
        setLoading(true);
        setError(null);
        try {
            const currentUserId = localStorage.getItem("user_id");
            const res = await api.get("admin/itineraries/", {
                params: { user_id: currentUserId }
            });
            setItineraries(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error loading user itineraries for admin:", err);
            setError("Failed to fetch user itineraries from the server. Please try again.");
            setItineraries([]);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        const num = parseFloat(amount);
        if (isNaN(num)) return "₹0";
        return `₹${num.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric"
            });
        } catch {
            return dateStr;
        }
    };

    // Download PDF for the selected itinerary
    const handleDownloadPdf = async (itin) => {
        if (!itin) return;
        setDownloading(true);
        try {
            const currentUserId = localStorage.getItem("user_id") || "";
            const query = currentUserId ? `?user_id=${currentUserId}` : "";
            const response = await api.get(`itineraries/${itin.itinerary_id}/download-pdf/${query}`, {
                responseType: "blob"
            });

            let filename = `Wandera_Itinerary_${itin.itinerary_id}.pdf`;
            const disposition = response.headers?.["content-disposition"] || response.headers?.["Content-Disposition"];
            if (disposition && disposition.indexOf("filename=") !== -1) {
                const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, "");
                }
            } else if (itin.title) {
                const safe = itin.title.replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "_");
                if (safe) filename = `Wandera_Itinerary_${safe}.pdf`;
            }

            const blob = new Blob([response.data], { type: "application/pdf" });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (err) {
            console.error("Failed to download itinerary PDF:", err);
            alert("Unable to generate PDF at this moment. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    // Filter itineraries by status
    const filteredItineraries = itineraries.filter((item) => {
        if (statusFilter === "published") return item.is_published === true;
        if (statusFilter === "unpublished") return item.is_published === false;
        return true;
    });

    return (
        <div className="admin-dashboard">
            {/* SIDEBAR NAVBAR */}
            <AdminNavbar />

            {/* MAIN DASHBOARD CONTENT */}
            <main className="admin-main">
                {/* HEADER */}
                <header className="admin-header">
                    <div>
                        <p className="welcome-small">SYSTEM MANAGEMENT</p>
                        <h1>User Itineraries</h1>
                    </div>

                    <div className="admin-user">
                        <div className="user-avatar">AD</div>
                        <div className="user-info">
                            <strong>Admin</strong>
                        </div>
                    </div>
                </header>

                <section className="dashboard-content">
                    {/* SUMMARY BANNER */}
                    <div className="request-summary-card">
                        <div className="summary-left">
                            <span className="summary-label">ITINERARY DIRECTORY</span>
                            <h2>User-Created Travel Itineraries</h2>
                            <p>
                                View and inspect all itineraries designed by registered tourists across Kerala, including complete trip plans and costs.
                            </p>
                        </div>
                        <div className="summary-badge-pill">
                            <span>Total Itineraries</span>
                            <strong>
                                {itineraries.length} Itinerar{itineraries.length !== 1 ? "ies" : "y"}
                            </strong>
                        </div>
                    </div>

                    {/* FILTER CONTROLS */}
                    <div className="admin-itineraries-controls">
                        <div className="admin-filter-pills">
                            <button
                                type="button"
                                className={`filter-btn-neutral ${statusFilter === "all" ? "active" : ""}`}
                                onClick={() => setStatusFilter("all")}
                            >
                                All ({itineraries.length})
                            </button>
                            <button
                                type="button"
                                className={`filter-btn-neutral ${statusFilter === "published" ? "active" : ""}`}
                                onClick={() => setStatusFilter("published")}
                            >
                                Published ({itineraries.filter((i) => i.is_published).length})
                            </button>
                            <button
                                type="button"
                                className={`filter-btn-neutral ${statusFilter === "unpublished" ? "active" : ""}`}
                                onClick={() => setStatusFilter("unpublished")}
                            >
                                Private/Draft ({itineraries.filter((i) => !i.is_published).length})
                            </button>
                        </div>
                    </div>

                    {/* ERROR NOTICE */}
                    {error && (
                        <div className="admin-error-banner">
                            <span>⚠️ {error}</span>
                            <button type="button" onClick={fetchItineraries}>
                                Retry
                            </button>
                        </div>
                    )}

                    {/* ITINERARIES TABLE CONTAINER */}
                    <div className="table-wrapper-card itineraries-table-container">
                        <table className="provider-request-table itineraries-admin-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "50px" }}>#</th>
                                    <th>Itinerary Title</th>
                                    <th>Tourist / Username</th>
                                    <th>Destination</th>
                                    <th>Duration</th>
                                    <th>Travel Dates</th>
                                    <th>Accommodation</th>
                                    <th>Transportation</th>
                                    <th>Total Cost</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: "center", width: "120px" }}>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="11"
                                            style={{
                                                textAlign: "center",
                                                padding: "40px",
                                                color: "#64748b"
                                            }}
                                        >
                                            <div className="itineraries-loading-spinner" style={{ margin: "0 auto 12px" }}></div>
                                            Loading user itineraries...
                                        </td>
                                    </tr>
                                ) : filteredItineraries.length > 0 ? (
                                    filteredItineraries.map((itin, index) => (
                                        <tr key={itin.itinerary_id || index}>
                                            <td style={{ color: "#64748b", fontWeight: "600" }}>
                                                {index + 1}
                                            </td>
                                            <td>
                                                <div className="itin-table-title" title={itin.title}>
                                                    {itin.title}
                                                </div>
                                                <div className="itin-table-sub">
                                                    ID: #{itin.itinerary_id}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="fw-bold" style={{ color: "#0f172a" }}>
                                                    {itin.username || itin.author_name || "Tourist"}
                                                </div>
                                                <div style={{ fontSize: "11px", color: "#64748b" }}>
                                                    {itin.user_email || itin.author_email || "—"}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge-destination">
                                                    📍 {itin.destination}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="badge-days">
                                                    {itin.number_of_days} {itin.number_of_days === 1 ? "Day" : "Days"}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: "11.5px", whiteSpace: "nowrap" }}>
                                                {itin.travel_dates ? (
                                                    <span className="badge-travel-dates">
                                                        📅 {itin.travel_dates}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: "#64748b" }}>
                                                        {formatDate(itin.created_at)}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="itin-cell-text" title={itin.hotel_name || "None"}>
                                                    {itin.hotel_name || "—"}
                                                </div>
                                                {parseFloat(itin.accommodation_cost) > 0 && (
                                                    <small style={{ color: "#059669", fontWeight: "600" }}>
                                                        {formatCurrency(itin.accommodation_cost)}
                                                    </small>
                                                )}
                                            </td>
                                            <td>
                                                <div className="itin-cell-text" title={itin.transportation_type || "None"}>
                                                    {itin.transportation_type || "—"}
                                                </div>
                                                {parseFloat(itin.transportation_cost) > 0 && (
                                                    <small style={{ color: "#059669", fontWeight: "600" }}>
                                                        {formatCurrency(itin.transportation_cost)}
                                                    </small>
                                                )}
                                            </td>
                                            <td style={{ fontWeight: "700", color: "#0f172a", whiteSpace: "nowrap" }}>
                                                {formatCurrency(itin.total_cost)}
                                            </td>
                                            <td>
                                                {itin.is_published ? (
                                                    <span className="status-badge-published">
                                                        Published
                                                    </span>
                                                ) : (
                                                    <span className="status-badge-draft">
                                                        Private
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                <button
                                                    type="button"
                                                    className="btn-view-details-action"
                                                    onClick={() => setSelectedItinerary(itin)}
                                                    title="View Full Itinerary Details"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="11"
                                            style={{
                                                textAlign: "center",
                                                padding: "40px",
                                                color: "#64748b"
                                            }}
                                        >
                                            {statusFilter !== "all"
                                                ? "No itineraries found matching the selected filter."
                                                : "No user itineraries created yet."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            {/* VIEW DETAILS MODAL */}
            {selectedItinerary && (
                <div
                    className="booking-modal-overlay"
                    onClick={() => setSelectedItinerary(null)}
                >
                    <div
                        className="booking-modal-box admin-itinerary-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* MODAL HEADER */}
                        <div className="booking-modal-header">
                            <div>
                                <h3>{selectedItinerary.title}</h3>
                                <p>
                                    Created by{" "}
                                    <strong>{selectedItinerary.username || selectedItinerary.author_name}</strong>
                                    {" ("}{selectedItinerary.user_email || selectedItinerary.author_email}{")"} on{" "}
                                    {formatDate(selectedItinerary.created_at)}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="btn-close-modal"
                                onClick={() => setSelectedItinerary(null)}
                                title="Close"
                            >
                                ✕
                            </button>
                        </div>

                        {/* MODAL BODY */}
                        <div className="booking-modal-body">
                            {/* OVERVIEW GRID */}
                            <div className="modal-details-grid">
                                <div>
                                    <span className="modal-label">Itinerary ID</span>
                                    <strong>#{selectedItinerary.itinerary_id}</strong>
                                </div>
                                <div>
                                    <span className="modal-label">Destination</span>
                                    <strong>📍 {selectedItinerary.destination}</strong>
                                </div>
                                <div>
                                    <span className="modal-label">Duration</span>
                                    <strong>
                                        ⏱️ {selectedItinerary.number_of_days}{" "}
                                        {selectedItinerary.number_of_days === 1 ? "Day" : "Days"}
                                    </strong>
                                </div>
                                <div>
                                    <span className="modal-label">Travel Dates</span>
                                    <strong>
                                        📅 {selectedItinerary.travel_dates || formatDate(selectedItinerary.created_at)}
                                    </strong>
                                </div>
                                <div>
                                    <span className="modal-label">Total Cost</span>
                                    <strong style={{ color: "#059669", fontSize: "14px" }}>
                                        {formatCurrency(selectedItinerary.total_cost)}
                                    </strong>
                                </div>
                                <div>
                                    <span className="modal-label">Sharing Status</span>
                                    <span
                                        className={
                                            selectedItinerary.is_published
                                                ? "status-badge-published"
                                                : "status-badge-draft"
                                        }
                                    >
                                        {selectedItinerary.is_published ? "Published" : "Private / Draft"}
                                    </span>
                                </div>
                            </div>

                            {/* DESCRIPTION SECTION */}
                            <div className="modal-detail-card">
                                <h4>Travel Experience Description</h4>
                                <p className="modal-paragraph">
                                    {selectedItinerary.description || "No description provided."}
                                </p>
                            </div>

                            {/* SERVICES DETAILS (ACCOMMODATION & TRANSPORTATION) */}
                            <div className="modal-two-columns">
                                <div className="modal-detail-card">
                                    <h4>🏨 Accommodation Details</h4>
                                    <div className="modal-field-row">
                                        <span>Hotel / Stay Name:</span>
                                        <strong>{selectedItinerary.hotel_name || "Not specified"}</strong>
                                    </div>
                                    <div className="modal-field-row">
                                        <span>Accommodation Cost:</span>
                                        <strong style={{ color: "#059669" }}>
                                            {formatCurrency(selectedItinerary.accommodation_cost)}
                                        </strong>
                                    </div>
                                </div>

                                <div className="modal-detail-card">
                                    <h4>🚗 Transportation Details</h4>
                                    <div className="modal-field-row">
                                        <span>Transit Mode / Vehicle:</span>
                                        <strong>{selectedItinerary.transportation_type || "Not specified"}</strong>
                                    </div>
                                    <div className="modal-field-row">
                                        <span>Transportation Cost:</span>
                                        <strong style={{ color: "#059669" }}>
                                            {formatCurrency(selectedItinerary.transportation_cost)}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            {/* ACTIVITIES SECTION */}
                            <div className="modal-detail-card">
                                <h4>🚣 Activities & Experiences</h4>
                                <p className="modal-paragraph">
                                    {selectedItinerary.activities || "No activities specified for this itinerary."}
                                </p>
                            </div>

                            {/* EXPENSE BREAKDOWN */}
                            <div className="modal-detail-card">
                                <h4>💰 Complete Cost Breakdown</h4>
                                <div className="modal-expenses-grid">
                                    <div className="expense-item">
                                        <span>Accommodation</span>
                                        <strong>{formatCurrency(selectedItinerary.accommodation_cost)}</strong>
                                    </div>
                                    <div className="expense-item">
                                        <span>Transportation</span>
                                        <strong>{formatCurrency(selectedItinerary.transportation_cost)}</strong>
                                    </div>
                                    <div className="expense-item">
                                        <span>Food & Dining</span>
                                        <strong>{formatCurrency(selectedItinerary.food_cost)}</strong>
                                    </div>
                                    <div className="expense-item">
                                        <span>Other Expenses</span>
                                        <strong>{formatCurrency(selectedItinerary.other_cost)}</strong>
                                    </div>
                                    <div className="expense-item expense-total-item">
                                        <span>Total Estimated Cost</span>
                                        <strong>{formatCurrency(selectedItinerary.total_cost)}</strong>
                                    </div>
                                </div>
                            </div>

                            {/* TRAVEL TIPS */}
                            {selectedItinerary.travel_tips && (
                                <div className="modal-detail-card">
                                    <h4>💡 Travel Tips & Recommendations</h4>
                                    <p className="modal-paragraph">
                                        {selectedItinerary.travel_tips}
                                    </p>
                                </div>
                            )}

                            {/* MODAL ACTIONS */}
                            <div className="modal-actions-footer">
                                <button
                                    type="button"
                                    className="btn-download-pdf-modal"
                                    onClick={() => handleDownloadPdf(selectedItinerary)}
                                    disabled={downloading}
                                >
                                    {downloading ? "Generating PDF..." : "📥 Download Itinerary PDF"}
                                </button>
                                <button
                                    type="button"
                                    className="btn-close-modal-footer"
                                    onClick={() => setSelectedItinerary(null)}
                                >
                                    Close Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
