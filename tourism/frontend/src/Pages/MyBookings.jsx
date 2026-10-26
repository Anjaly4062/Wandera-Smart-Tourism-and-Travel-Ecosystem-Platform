import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Services/Api";
import "../styles/MyBookings.css";

export default function MyBookings() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [downloadingId, setDownloadingId] = useState(null);

    // Filter tab: 'all' | 'active' | 'completed' | 'cancelled'
    const [filterTab, setFilterTab] = useState("all");

    // Modal state for View Details
    const [selectedBooking, setSelectedBooking] = useState(null);

    // Cancellation confirmation state
    const [cancellingBooking, setCancellingBooking] = useState(null);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [cancelError, setCancelError] = useState("");

    const userId = localStorage.getItem("user_id");

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            setError("User session not found. Please login to view your bookings.");
            return;
        }
        fetchBookings();
    }, [userId]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError("");
            const currentUserId = userId || localStorage.getItem("user_id");
            const response = await api.get(`user-bookings/${currentUserId}/`);
            setBookings(response.data?.bookings || []);
        } catch (err) {
            console.error("Error fetching bookings:", err);
            setError(err.response?.data?.error || "Failed to load bookings. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    // Download PDF voucher
    const handleDownloadPdf = async (bookingId) => {
        if (!bookingId) return;
        try {
            setDownloadingId(bookingId);
            const currentUserId = userId || localStorage.getItem("user_id");
            const response = await api.get(`booking/${bookingId}/download-pdf/?user_id=${currentUserId}`, {
                responseType: "blob"
            });

            const blob = new Blob([response.data], { type: "application/pdf" });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `Wandera_Booking_${bookingId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (err) {
            console.error("PDF download error:", err);
            alert("Failed to download booking PDF voucher. Please try again.");
        } finally {
            setDownloadingId(null);
        }
    };

    // Check if a booking is eligible for cancellation
    const isBookingEligibleForCancellation = (booking) => {
        if (!booking) return false;
        if (booking.booking_status === "Cancelled" || booking.booking_status === "Completed") {
            return false;
        }
        if (booking.items && booking.items.length > 0) {
            const hasCheckedIn = booking.items.some(
                (item) => item.checkin_verified || item.status === "Completed"
            );
            if (hasCheckedIn) return false;
        }
        return true;
    };

    // Open cancellation confirmation dialog
    const handleOpenCancelModal = (booking) => {
        setCancelError("");
        setCancellingBooking(booking);
    };

    // Close cancellation dialog
    const handleCloseCancelModal = () => {
        if (cancelLoading) return;
        setCancellingBooking(null);
        setCancelError("");
    };

    // Execute cancellation
    const handleConfirmCancel = async () => {
        if (!cancellingBooking) return;
        try {
            setCancelLoading(true);
            setCancelError("");
            const currentUserId = userId || localStorage.getItem("user_id");

            const response = await api.post(`booking/${cancellingBooking.booking_id}/cancel/`, {
                user_id: currentUserId
            });

            const updatedBooking = response.data?.booking;
            const updatedBookingData = updatedBooking || {
                ...cancellingBooking,
                booking_status: "Cancelled",
                items: cancellingBooking.items?.map((it) => ({ ...it, status: "Cancelled" }))
            };

            // Update main list
            setBookings((prev) =>
                prev.map((b) =>
                    b.booking_id === cancellingBooking.booking_id ? updatedBookingData : b
                )
            );

            // Update selected details view if open
            if (selectedBooking && selectedBooking.booking_id === cancellingBooking.booking_id) {
                setSelectedBooking(updatedBookingData);
            }

            setSuccessMessage(
                response.data?.message || `Booking #${cancellingBooking.booking_id} has been cancelled successfully.`
            );
            setCancellingBooking(null);

            setTimeout(() => {
                setSuccessMessage("");
            }, 5000);
        } catch (err) {
            console.error("Error cancelling booking:", err);
            setCancelError(
                err.response?.data?.error ||
                "Failed to cancel booking. Please verify eligibility and try again."
            );
        } finally {
            setCancelLoading(false);
        }
    };

    // Filter bookings based on active tab
    const filteredBookings = bookings.filter((b) => {
        if (filterTab === "active") {
            return b.booking_status !== "Completed" && b.booking_status !== "Cancelled";
        }
        if (filterTab === "completed") {
            return b.booking_status === "Completed";
        }
        if (filterTab === "cancelled") {
            return b.booking_status === "Cancelled";
        }
        return true;
    });

    const counts = {
        all: bookings.length,
        active: bookings.filter((b) => b.booking_status !== "Completed" && b.booking_status !== "Cancelled").length,
        completed: bookings.filter((b) => b.booking_status === "Completed").length,
        cancelled: bookings.filter((b) => b.booking_status === "Cancelled").length,
    };

    // Extract guests/rooms summary
    const getBookingCapacityInfo = (booking) => {
        if (!booking?.items || booking.items.length === 0) return null;
        for (const item of booking.items) {
            const details = item.details || {};
            const guests = details.guests || details.number_of_guests || details.total_guests || details.people;
            const rooms = details.rooms || details.total_rooms || details.room_count;
            if (guests || rooms) {
                return {
                    guests: guests || null,
                    rooms: rooms || null,
                    roomType: details.room_type || null,
                    vehicleName: details.vehicle_name || null,
                    nights: details.nights || null,
                    days: details.days || null,
                    timeSlot: details.time_slot || null
                };
            }
        }
        return null;
    };

    return (
        <div className="my-bookings-page-wrapper">
            <div className="my-bookings-container">
                {/* Top Navigation: Back to Profile */}
                <div className="bookings-top-nav">
                    <button
                        type="button"
                        className="btn-back-to-profile"
                        onClick={() => navigate("/my-profile")}
                    >
                        ← Back to Profile
                    </button>
                </div>

                {/* Header */}
                <header className="my-bookings-header">
                    <div>
                        <h1>My Bookings</h1>
                        <p>View your travel reservations, download receipts, and manage bookings</p>
                    </div>
                    <div className="bookings-total-counter">
                        <span className="counter-number">{bookings.length}</span>
                        <span className="counter-label">{bookings.length === 1 ? "Trip" : "Trips"}</span>
                    </div>
                </header>

                {/* Feedback Alerts */}
                {successMessage && (
                    <div className="booking-alert booking-alert-success">
                        <span className="alert-icon">✓</span>
                        <span>{successMessage}</span>
                        <button
                            type="button"
                            className="alert-close-btn"
                            onClick={() => setSuccessMessage("")}
                        >
                            ×
                        </button>
                    </div>
                )}

                {error && (
                    <div className="booking-alert booking-alert-error">
                        <span className="alert-icon">⚠️</span>
                        <span>{error}</span>
                        <button
                            type="button"
                            className="alert-close-btn"
                            onClick={() => setError("")}
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Filter Tabs */}
                <div className="bookings-filter-tabs">
                    <button
                        type="button"
                        className={`filter-tab-btn ${filterTab === "all" ? "active" : ""}`}
                        onClick={() => setFilterTab("all")}
                    >
                        All ({counts.all})
                    </button>
                    <button
                        type="button"
                        className={`filter-tab-btn ${filterTab === "active" ? "active" : ""}`}
                        onClick={() => setFilterTab("active")}
                    >
                        Active ({counts.active})
                    </button>
                    <button
                        type="button"
                        className={`filter-tab-btn ${filterTab === "completed" ? "active" : ""}`}
                        onClick={() => setFilterTab("completed")}
                    >
                        Completed ({counts.completed})
                    </button>
                    <button
                        type="button"
                        className={`filter-tab-btn ${filterTab === "cancelled" ? "active" : ""}`}
                        onClick={() => setFilterTab("cancelled")}
                    >
                        Cancelled ({counts.cancelled})
                    </button>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="bookings-loading-state">
                        <div className="spinner">⏳</div>
                        <p>Loading your bookings...</p>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    /* Empty State */
                    <div className="bookings-empty-state">
                        <div className="empty-icon">🏖️</div>
                        <h3>No Bookings Found</h3>
                        <p>
                            {filterTab === "all"
                                ? "You haven't made any trip bookings yet."
                                : `You don't have any bookings in the "${filterTab}" category.`}
                        </p>
                        <button
                            type="button"
                            className="btn-explore-now"
                            onClick={() => navigate("/destinations")}
                        >
                            Explore Destinations →
                        </button>
                    </div>
                ) : (
                    /* 3 Cards Per Row Grid */
                    <div className="bookings-cards-grid">
                        {filteredBookings.map((b) => {
                            const isCancelled = b.booking_status === "Cancelled";
                            const isCompleted = b.booking_status === "Completed";
                            const travelDateText = b.start_date
                                ? (b.end_date && b.end_date !== b.start_date
                                    ? `${b.start_date} to ${b.end_date}`
                                    : b.start_date)
                                : "Date not specified";

                            return (
                                <article
                                    key={b.booking_id}
                                    className={`compact-booking-card ${isCancelled ? "card-cancelled" : isCompleted ? "card-completed" : ""}`}
                                >
                                    {/* Card Top Row: ID Badge & Status */}
                                    <div className="card-top-row">
                                        <span className="card-id-badge">
                                            Booking #{b.booking_id}
                                        </span>
                                        <span className={`status-pill ${(b.booking_status || "confirmed").toLowerCase()}`}>
                                            {isCancelled ? "Cancelled" : isCompleted ? "Completed" : b.booking_status || "Confirmed"}
                                        </span>
                                    </div>

                                    {/* Destination / Service Name */}
                                    <h3 className="card-destination-title" title={b.destination?.name || "Kerala Trip Itinerary"}>
                                        📍 {b.destination?.name || "Kerala Trip"}
                                    </h3>

                                    {/* Travel / Check-in Date */}
                                    <div className="card-date-row">
                                        <span className="card-date-icon">📅</span>
                                        <span className="card-date-text">{travelDateText}</span>
                                    </div>

                                    {/* Card Bottom Row: Total Price & View Details Button */}
                                    <div className="card-bottom-row">
                                        <div className="card-price-value">
                                            ₹{parseFloat(b.total_amount || 0).toLocaleString()}
                                        </div>
                                        <button
                                            type="button"
                                            className="btn-view-details"
                                            onClick={() => setSelectedBooking(b)}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* DEDICATED VIEW DETAILS MODAL */}
            {selectedBooking && (
                <div className="booking-modal-backdrop" onClick={() => setSelectedBooking(null)}>
                    <div className="details-modal-box" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="details-modal-header">
                            <div>
                                <span className="details-modal-ref">Booking Ref #{selectedBooking.booking_id}</span>
                                <h2>📍 {selectedBooking.destination?.name || "Kerala Trip"}</h2>
                            </div>
                            <button
                                type="button"
                                className="modal-close-icon-btn"
                                onClick={() => setSelectedBooking(null)}
                                title="Close details"
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="details-modal-body">
                            {/* Summary Grid */}
                            <div className="details-summary-grid">
                                <div className="details-summary-cell">
                                    <small>Booking Status</small>
                                    <span className={`status-pill ${(selectedBooking.booking_status || "confirmed").toLowerCase()}`}>
                                        {selectedBooking.booking_status || "Confirmed"}
                                    </span>
                                </div>
                                <div className="details-summary-cell">
                                    <small>Payment Status</small>
                                    <strong>{selectedBooking.payment_status || "Pending"}</strong>
                                    <span style={{ fontSize: "11px", color: "#64748b" }}>
                                        ({selectedBooking.payment_method === "Online" ? "💳 Online" : "💵 Offline"})
                                    </span>
                                </div>
                                <div className="details-summary-cell">
                                    <small>Travel Dates</small>
                                    <strong>
                                        {selectedBooking.start_date || "N/A"}
                                        {selectedBooking.end_date && selectedBooking.end_date !== selectedBooking.start_date ? ` to ${selectedBooking.end_date}` : ""}
                                    </strong>
                                </div>
                                <div className="details-summary-cell">
                                    <small>Total Price</small>
                                    <strong className="details-total-price">
                                        ₹{parseFloat(selectedBooking.total_amount || 0).toLocaleString()}
                                    </strong>
                                </div>
                            </div>

                            {/* Booking Date & Capacity Details */}
                            <div className="details-meta-row">
                                {selectedBooking.created_at && (
                                    <span>
                                        🗓️ Booked on: {new Date(selectedBooking.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                                    </span>
                                )}
                                {(() => {
                                    const cap = getBookingCapacityInfo(selectedBooking);
                                    if (!cap) return null;
                                    return (
                                        <>
                                            {cap.guests && <span>👥 {cap.guests} Guest(s)</span>}
                                            {cap.rooms && <span>🚪 {cap.rooms} Room(s)</span>}
                                            {cap.roomType && <span>🛏️ {cap.roomType}</span>}
                                            {cap.vehicleName && <span>🚗 {cap.vehicleName}</span>}
                                            {cap.nights && <span>🌙 {cap.nights} Night(s)</span>}
                                        </>
                                    );
                                })()}
                            </div>

                            {/* Included Services List */}
                            <div className="details-services-section">
                                <h4>Included Services ({selectedBooking.items?.length || 0})</h4>
                                <div className="details-services-list">
                                    {selectedBooking.items?.map((item) => (
                                        <div key={item.booking_item_id} className="details-service-item">
                                            <div className="service-item-main">
                                                <span className="service-type-badge">{item.service_type}</span>
                                                <span className="service-title-text">{item.item_name || "Booked Service"}</span>
                                                {item.details && Object.keys(item.details).length > 0 && (
                                                    <div className="service-sub-details">
                                                        {item.details.room_type && <span>Room: {item.details.room_type} • </span>}
                                                        {item.details.vehicle_name && <span>Vehicle: {item.details.vehicle_name} • </span>}
                                                        {item.details.nights && <span>{item.details.nights} Night(s) • </span>}
                                                        {item.details.time_slot && <span>Slot: {item.details.time_slot}</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="service-item-right">
                                                {selectedBooking.booking_status === "Cancelled" ? (
                                                    <span className="verify-pill cancelled">Cancelled</span>
                                                ) : item.checkout_verified ? (
                                                    <span className="verify-pill completed">✓ Completed</span>
                                                ) : item.checkin_verified ? (
                                                    <span className="verify-pill in-progress">⚡ In Progress</span>
                                                ) : (
                                                    <span className="verify-pill pending" title="Check confirmation email for OTP">
                                                        🔑 OTP in Email
                                                    </span>
                                                )}
                                                <strong className="service-amount-text">
                                                    ₹{parseFloat(item.amount || 0).toLocaleString()}
                                                </strong>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer Actions */}
                        <div className="details-modal-footer">
                            <div className="details-footer-left">
                                <button
                                    type="button"
                                    className="btn-download-voucher"
                                    disabled={downloadingId === selectedBooking.booking_id}
                                    onClick={() => handleDownloadPdf(selectedBooking.booking_id)}
                                >
                                    {downloadingId === selectedBooking.booking_id ? "⏳ Generating..." : "📥 Download Voucher (PDF)"}
                                </button>

                                {isBookingEligibleForCancellation(selectedBooking) && (
                                    <button
                                        type="button"
                                        className="btn-modal-cancel"
                                        onClick={() => handleOpenCancelModal(selectedBooking)}
                                    >
                                        🚫 Cancel Booking
                                    </button>
                                )}
                            </div>

                            <button
                                type="button"
                                className="btn-modal-close"
                                onClick={() => setSelectedBooking(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CANCELLATION CONFIRMATION MODAL */}
            {cancellingBooking && (
                <div className="booking-modal-backdrop" onClick={handleCloseCancelModal} style={{ zIndex: 100001 }}>
                    <div className="cancel-confirm-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-warning-icon">⚠️</div>
                            <div>
                                <h3>Confirm Cancellation</h3>
                                <p>Booking #{cancellingBooking.booking_id}</p>
                            </div>
                            <button
                                type="button"
                                className="modal-close-icon-btn"
                                onClick={handleCloseCancelModal}
                                disabled={cancelLoading}
                            >
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            {cancelError && (
                                <div className="modal-error-box">
                                    ⚠️ {cancelError}
                                </div>
                            )}

                            <p className="modal-main-prompt">
                                Are you sure you want to cancel your booking for <strong>{cancellingBooking.destination?.name || "Kerala Trip"}</strong>?
                            </p>

                            <div className="modal-booking-summary">
                                <div className="summary-row">
                                    <span>Booking ID:</span>
                                    <strong>#{cancellingBooking.booking_id}</strong>
                                </div>
                                <div className="summary-row">
                                    <span>Total Price:</span>
                                    <strong>₹{parseFloat(cancellingBooking.total_amount || 0).toLocaleString()}</strong>
                                </div>
                                <div className="summary-row">
                                    <span>Payment Method:</span>
                                    <strong>{cancellingBooking.payment_method} ({cancellingBooking.payment_status})</strong>
                                </div>
                            </div>

                            <div className="modal-terms-notice">
                                <p>
                                    Cancelling this booking will instantly revoke all included services and verification OTPs.
                                    {cancellingBooking.payment_method === "Online" && cancellingBooking.payment_status === "Completed" && (
                                        <span> Online payment cancellations are logged and handled per Wandera policy.</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn-keep-booking"
                                onClick={handleCloseCancelModal}
                                disabled={cancelLoading}
                            >
                                Keep Booking
                            </button>
                            <button
                                type="button"
                                className="btn-confirm-cancel"
                                onClick={handleConfirmCancel}
                                disabled={cancelLoading}
                            >
                                {cancelLoading ? "Cancelling..." : "Yes, Cancel Booking"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
