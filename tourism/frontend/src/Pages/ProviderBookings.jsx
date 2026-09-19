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

    // OTP Modal states
    const [otpModalOpen, setOtpModalOpen] = useState(false);
    const [otpModalType, setOtpModalType] = useState("checkin"); // 'checkin' | 'checkout'
    const [activeItem, setActiveItem] = useState(null);
    const [otpInput, setOtpInput] = useState("");
    const [otpSubmitting, setOtpSubmitting] = useState(false);
    const [otpError, setOtpError] = useState("");
    const [otpSuccess, setOtpSuccess] = useState("");
    const [requestingOtpId, setRequestingOtpId] = useState(null);
    const [feedbackMessage, setFeedbackMessage] = useState(null);

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

    const showFeedback = (msg, type = "success") => {
        setFeedbackMessage({ text: msg, type });
        setTimeout(() => setFeedbackMessage(null), 5000);
    };

    const openOtpModal = (item, type) => {
        setActiveItem(item);
        setOtpModalType(type);
        setOtpInput("");
        setOtpError("");
        setOtpSuccess("");
        setOtpModalOpen(true);
    };

    const closeOtpModal = () => {
        setOtpModalOpen(false);
        setActiveItem(null);
        setOtpInput("");
        setOtpError("");
        setOtpSuccess("");
    };

    const handleRequestCheckoutOtp = async (bookingItemId) => {
        try {
            setRequestingOtpId(bookingItemId);
            const res = await api.post(`provider-booking-item/${bookingItemId}/request-checkout/`);
            showFeedback(res.data?.message || "Checkout OTP generated and sent to tourist email!", "success");
            // Automatically open checkout OTP modal for convenience
            const item = bookings.find((b) => b.booking_item_id === bookingItemId);
            if (item) {
                openOtpModal(item, "checkout");
            }
        } catch (err) {
            const errDetail = err.response?.data?.error || "Failed to request checkout OTP.";
            showFeedback(errDetail, "error");
        } finally {
            setRequestingOtpId(null);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otpInput || otpInput.trim().length !== 6) {
            setOtpError("Please enter the complete 6-digit OTP code.");
            return;
        }

        try {
            setOtpSubmitting(true);
            setOtpError("");
            const endpoint =
                otpModalType === "checkin"
                    ? `provider-booking-item/${activeItem.booking_item_id}/verify-checkin/`
                    : `provider-booking-item/${activeItem.booking_item_id}/verify-checkout/`;

            const res = await api.post(endpoint, { otp: otpInput.trim() });
            setOtpSuccess(res.data?.message || "OTP verified successfully!");

            setTimeout(() => {
                closeOtpModal();
                if (providerId) {
                    fetchBookings(providerId);
                }
            }, 1200);
        } catch (err) {
            const errDetail = err.response?.data?.error || "Invalid OTP code. Please try again.";
            setOtpError(errDetail);
        } finally {
            setOtpSubmitting(false);
        }
    };

    const serviceType = providerInfo.service_type || localStorage.getItem("service_type") || "Hotel";

    const getPageTitle = (st) => {
        switch (st) {
            case "Hotel":
                return "🏨 Hotel Room Bookings & Check-ins";
            case "Transportation":
                return "🚍 Transportation & Vehicle Pickups";
            case "Activity":
                return "🧗 Activity & Experience Check-ins";
            case "Restaurant":
                return "🍽️ Table Reservations & Dining";
            default:
                return "💼 Service Bookings & Verifications";
        }
    };

    return (
        <div className="provider-bookings-layout">
            {/* COMPACT SIDEBAR */}
            <ServiceProviderNavbar />

            {/* MAIN CONTENT */}
            <main className="provider-bookings-main">
                {/* GLOBAL FEEDBACK TOAST */}
                {feedbackMessage && (
                    <div className={`provider-toast-alert ${feedbackMessage.type}`}>
                        {feedbackMessage.type === "success" ? "✓ " : "⚠️ "}
                        {feedbackMessage.text}
                    </div>
                )}

                {/* HEADER */}
                <header className="provider-bookings-header">
                    <div>
                        <span className="header-type-badge">{serviceType} Service</span>
                        <h1>{getPageTitle(serviceType)}</h1>
                        <p>Verify tourist check-ins, manage in-progress services, and complete checkouts using secure OTPs.</p>
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
                                <div className={`provider-booking-card ${b.checkout_verified ? "card-completed" : (b.checkin_verified ? "card-in-progress" : "")}`} key={b.booking_item_id}>
                                    {/* TOP BAR */}
                                    <div className="card-header-bar">
                                        <div className="header-meta-left">
                                            <span className="booking-ref-tag">
                                                Booking #{b.booking_id || b.booking_item_id}
                                            </span>
                                            <span className="service-sub-tag">{b.service_type}</span>
                                            <span className="destination-tag">
                                                📍 {b.destination?.name || "Kerala"}
                                            </span>
                                        </div>

                                        <div className="header-meta-right">
                                            <div className="price-tag">
                                                ₹{parseFloat(b.amount || 0).toLocaleString()}
                                            </div>
                                            <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                                                <span
                                                    style={{
                                                        fontSize: "11px",
                                                        padding: "2px 8px",
                                                        borderRadius: "12px",
                                                        fontWeight: "600",
                                                        background: b.payment_method === "Online" ? "#e0f2fe" : "#f1f5f9",
                                                        color: b.payment_method === "Online" ? "#0369a1" : "#475569",
                                                        border: "1px solid",
                                                        borderColor: b.payment_method === "Online" ? "#bae6fd" : "#cbd5e1"
                                                    }}
                                                >
                                                    {b.payment_method === "Online" ? "💳 Online" : "💵 Offline"}
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: "11px",
                                                        padding: "2px 8px",
                                                        borderRadius: "12px",
                                                        fontWeight: "600",
                                                        background: b.payment_status === "Completed" ? "#ecfdf5" : (b.payment_status === "Failed" ? "#fef2f2" : "#fffbeb"),
                                                        color: b.payment_status === "Completed" ? "#047857" : (b.payment_status === "Failed" ? "#b91c1c" : "#b45309"),
                                                        border: "1px solid",
                                                        borderColor: b.payment_status === "Completed" ? "#a7f3d0" : (b.payment_status === "Failed" ? "#fecaca" : "#fde68a")
                                                    }}
                                                >
                                                    Payment: {b.payment_status || "Pending"}
                                                </span>

                                                {/* SERVICE STATUS PILL */}
                                                {b.checkout_verified ? (
                                                    <div className="status-pill-badge completed">
                                                        ✓ Completed
                                                    </div>
                                                ) : b.checkin_verified ? (
                                                    <div className="status-pill-badge in-progress">
                                                        ⚡ In Progress
                                                    </div>
                                                ) : (
                                                    <div className="status-pill-badge confirmed">
                                                        ✓ Confirmed
                                                    </div>
                                                )}
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

                                            {/* VERIFICATION & OTP ACTION BAR */}
                                            <div className="verification-action-container">
                                                {!b.checkin_verified ? (
                                                    <div className="verification-step-box step-checkin-pending">
                                                        <div className="verification-status-text">
                                                            <span className="dot-indicator pending"></span>
                                                            <span><strong>Awaiting Check-in:</strong> Tourist must provide their 6-digit Check-in OTP upon arrival.</span>
                                                        </div>
                                                        <button
                                                            className="btn-verify-otp btn-checkin"
                                                            onClick={() => openOtpModal(b, "checkin")}
                                                        >
                                                            🔑 Verify Check-in OTP
                                                        </button>
                                                    </div>
                                                ) : !b.checkout_verified ? (
                                                    <div className="verification-step-box step-in-progress">
                                                        <div className="verification-status-text">
                                                            <span className="dot-indicator in-progress"></span>
                                                            <div>
                                                                <strong>Check-in Verified:</strong> {new Date(b.checkin_verified_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(b.checkin_verified_at).toLocaleDateString()}
                                                                <div style={{ fontSize: '11px', color: '#0369a1', marginTop: '2px' }}>
                                                                    Service is active. When service ends, request checkout OTP and verify.
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="checkout-btn-group">
                                                            <button
                                                                className="btn-verify-otp btn-request-otp"
                                                                onClick={() => handleRequestCheckoutOtp(b.booking_item_id)}
                                                                disabled={requestingOtpId === b.booking_item_id}
                                                            >
                                                                {requestingOtpId === b.booking_item_id ? "Sending OTP..." : "📧 Request Checkout OTP"}
                                                            </button>
                                                            <button
                                                                className="btn-verify-otp btn-checkout"
                                                                onClick={() => openOtpModal(b, "checkout")}
                                                            >
                                                                🏁 Verify Checkout OTP
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="verification-step-box step-completed">
                                                        <div className="verification-status-text">
                                                            <span className="dot-indicator completed"></span>
                                                            <div>
                                                                <strong style={{ color: "#047857" }}>Service Completed & Verified:</strong> Checked in {new Date(b.checkin_verified_at).toLocaleDateString()} • Completed {new Date(b.checkout_verified_at).toLocaleDateString()} {new Date(b.checkout_verified_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                        <span className="badge-fully-completed">✓ Finished</span>
                                                    </div>
                                                )}
                                            </div>
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

                {/* OTP VERIFICATION MODAL */}
                {otpModalOpen && activeItem && (
                    <div className="otp-modal-backdrop" onClick={closeOtpModal}>
                        <div className="otp-modal-box" onClick={(e) => e.stopPropagation()}>
                            <button className="otp-modal-close" onClick={closeOtpModal}>×</button>

                            <div className="otp-modal-icon">
                                {otpModalType === "checkin" ? "🔑" : "🏁"}
                            </div>

                            <h3>
                                {otpModalType === "checkin"
                                    ? "Verify Tourist Check-in OTP"
                                    : "Verify Service Checkout OTP"}
                            </h3>

                            <p className="otp-modal-subtitle">
                                {otpModalType === "checkin"
                                    ? `Enter the 6-digit Check-in OTP provided by the tourist for ${activeItem.item_name || activeItem.service_type}.`
                                    : `Enter the 6-digit Checkout OTP sent to ${activeItem.tourist?.email || "the tourist"} to complete this service.`}
                            </p>

                            {otpError && (
                                <div className="otp-modal-alert error">
                                    ⚠️ {otpError}
                                </div>
                            )}

                            {otpSuccess && (
                                <div className="otp-modal-alert success">
                                    ✓ {otpSuccess}
                                </div>
                            )}

                            <form onSubmit={handleVerifyOtp} className="otp-modal-form">
                                <div className="compact-otp-container">
                                    <label className="compact-otp-label">Enter 6-Digit Code</label>
                                    <div className="otp-digit-boxes">
                                        {[0, 1, 2, 3, 4, 5].map((index) => (
                                            <input
                                                key={index}
                                                id={`otp-digit-${index}`}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength="1"
                                                className="otp-digit-box"
                                                value={otpInput[index] || ""}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, "");
                                                    const currentArr = otpInput.split("");
                                                    currentArr[index] = val ? val[val.length - 1] : "";
                                                    const newOtp = currentArr.join("").slice(0, 6);
                                                    setOtpInput(newOtp);
                                                    if (val && index < 5) {
                                                        const nextEl = document.getElementById(`otp-digit-${index + 1}`);
                                                        if (nextEl) nextEl.focus();
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Backspace" && !otpInput[index] && index > 0) {
                                                        const prevEl = document.getElementById(`otp-digit-${index - 1}`);
                                                        if (prevEl) {
                                                            prevEl.focus();
                                                        }
                                                    }
                                                }}
                                                onPaste={(e) => {
                                                    e.preventDefault();
                                                    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                                                    setOtpInput(pasted);
                                                    const targetIdx = Math.min(pasted.length, 5);
                                                    const el = document.getElementById(`otp-digit-${targetIdx}`);
                                                    if (el) el.focus();
                                                }}
                                                autoFocus={index === 0}
                                                disabled={otpSubmitting || !!otpSuccess}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="otp-modal-actions">
                                    <button
                                        type="button"
                                        className="btn-modal-cancel"
                                        onClick={closeOtpModal}
                                        disabled={otpSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className={`btn-modal-confirm ${otpModalType === "checkout" ? "btn-confirm-checkout" : ""}`}
                                        disabled={otpSubmitting || otpInput.trim().length !== 6 || !!otpSuccess}
                                    >
                                        {otpSubmitting
                                            ? "Verifying..."
                                            : (otpModalType === "checkin" ? "Verify & Check In" : "Verify & Complete Service")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
