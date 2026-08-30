import { useEffect, useState } from "react";
import AdminNavbar from "../Components/AdminNavbar";
import api from "../services/api";
import "../styles/AdminBookings.css";
import "../styles/AdminHome.css";
import "../styles/AdminProviderRequest.css";

export default function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const res = await api.get("bookings/");
            setBookings(res.data || []);
        } catch (error) {
            console.error("Error loading admin bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-dashboard">
            {/* LEFT SIDEBAR NAVIGATION */}
            <AdminNavbar />

            {/* MAIN CONTENT AREA */}
            <main className="admin-main">
                {/* STICKY HEADER WITH BOOKINGS TITLE AND LOGGED ADMIN */}
                <header className="admin-header">
                    <div>
                        <p className="welcome-small">PORTAL MANAGEMENT</p>
                        <h1>Bookings</h1>
                    </div>

                    <div className="admin-user">
                        <div className="user-avatar">AD</div>
                        <div className="user-info">
                            <strong>Admin</strong>
                        </div>
                    </div>
                </header>

                <section className="dashboard-content">
                    {/* ALL BOOKINGS TABLE */}
                    <div className="bookings-table-wrapper">
                        <table className="bookings-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "80px" }}>Booking ID</th>
                                    <th>Tourist</th>
                                    <th>Service</th>
                                    <th>Provider</th>
                                    <th>Destination</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th style={{ textAlign: "center", width: "60px" }}>Action</th>
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
                                            Loading booking records...
                                        </td>
                                    </tr>
                                ) : bookings.length > 0 ? (
                                    bookings.map((b) => (
                                        <tr key={b.booking_id}>
                                            <td style={{ color: "#64748b", fontWeight: "600" }}>
                                                #{b.booking_id}
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: "600", color: "#0f172a" }}>
                                                    {b.tourist_name}
                                                </div>
                                                <div style={{ fontSize: "10.5px", color: "#64748b" }}>
                                                    {b.tourist_email}
                                                </div>
                                            </td>
                                            <td>
                                                {b.services && b.services.length > 0 ? (
                                                    b.services.map((svc, i) => (
                                                        <span key={i} className="service-pill-neutral">
                                                            {svc}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span style={{ color: "#64748b" }}>—</span>
                                                )}
                                            </td>
                                            <td style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {b.provider_summary || "—"}
                                            </td>
                                            <td>{b.destination_name || "Kerala"}</td>
                                            <td style={{ fontSize: "11px", whiteSpace: "nowrap" }}>
                                                {b.start_date ? (
                                                    <>
                                                        {b.start_date}
                                                        {b.end_date && b.end_date !== b.start_date && (
                                                            <span> → {b.end_date}</span>
                                                        )}
                                                    </>
                                                ) : (
                                                    b.created_at ? b.created_at.split(" ")[0] : "—"
                                                )}
                                            </td>
                                            <td style={{ fontWeight: "700", color: "#0f172a", whiteSpace: "nowrap" }}>
                                                ₹{Number(b.total_amount).toLocaleString()}
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedBooking(b)}
                                                    title="View Booking Details"
                                                    style={{
                                                        background: "transparent",
                                                        border: "1px solid #cbd5e1",
                                                        borderRadius: "6px",
                                                        width: "28px",
                                                        height: "28px",
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        cursor: "pointer",
                                                        fontSize: "12px",
                                                        color: "#334155",
                                                    }}
                                                >
                                                    👁️
                                                </button>
                                            </td>
                                        </tr>
                                    ))
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
                                            No bookings available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            {/* COMPACT BOOKING DETAILS MODAL */}
            {selectedBooking && (
                <div
                    className="booking-modal-overlay"
                    onClick={() => setSelectedBooking(null)}
                >
                    <div
                        className="booking-modal-box"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* MODAL HEADER */}
                        <div className="booking-modal-header">
                            <div>
                                <h3>Booking #{selectedBooking.booking_id}</h3>
                                <p>
                                    Booked on {selectedBooking.created_at || "—"}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="btn-close-modal"
                                onClick={() => setSelectedBooking(null)}
                                title="Close"
                            >
                                ✕
                            </button>
                        </div>

                        {/* MODAL BODY */}
                        <div className="booking-modal-body">
                            {/* OVERVIEW GRID */}
                            <div className="modal-details-grid">
                                <div className="modal-detail-item">
                                    <span className="item-label">Tourist Name</span>
                                    <span className="item-value">{selectedBooking.tourist_name}</span>
                                </div>

                                <div className="modal-detail-item">
                                    <span className="item-label">Tourist Email</span>
                                    <span className="item-value">{selectedBooking.tourist_email || "—"}</span>
                                </div>

                                <div className="modal-detail-item">
                                    <span className="item-label">Tourist Phone</span>
                                    <span className="item-value">{selectedBooking.tourist_phone || "—"}</span>
                                </div>

                                <div className="modal-detail-item">
                                    <span className="item-label">Destination</span>
                                    <span className="item-value">{selectedBooking.destination_name}</span>
                                </div>

                                <div className="modal-detail-item">
                                    <span className="item-label">Travel Dates</span>
                                    <span className="item-value">
                                        {selectedBooking.start_date || "—"}
                                        {selectedBooking.end_date ? ` to ${selectedBooking.end_date}` : ""}
                                    </span>
                                </div>

                                <div className="modal-detail-item">
                                    <span className="item-label">Payment Method</span>
                                    <span className="item-value">{selectedBooking.payment_method || "Offline"}</span>
                                </div>

                                <div className="modal-detail-item">
                                    <span className="item-label">Total Amount</span>
                                    <span className="item-value" style={{ fontSize: "13px", fontWeight: "700" }}>
                                        ₹{Number(selectedBooking.total_amount).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* BOOKED ITEMS BREAKDOWN */}
                            <div>
                                <h4 style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px 0" }}>
                                    Booked Services Breakdown ({selectedBooking.items?.length || 0})
                                </h4>

                                {selectedBooking.items && selectedBooking.items.length > 0 ? (
                                    <table className="modal-items-table">
                                        <thead>
                                            <tr>
                                                <th>Service</th>
                                                <th>Item / Package</th>
                                                <th>Provider</th>
                                                <th style={{ textAlign: "right" }}>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedBooking.items.map((item, idx) => (
                                                <tr key={item.booking_item_id || idx}>
                                                    <td>
                                                        <span className="service-pill-neutral">
                                                            {item.service_type}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontWeight: "600" }}>
                                                        {item.item_name || "—"}
                                                    </td>
                                                    <td>{item.provider_name || "—"}</td>
                                                    <td style={{ textAlign: "right", fontWeight: "600" }}>
                                                        ₹{Number(item.amount).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>
                                        No itemized service records attached.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* MODAL FOOTER */}
                        <div className="booking-modal-footer">
                            <button
                                type="button"
                                onClick={() => setSelectedBooking(null)}
                                style={{
                                    background: "#ffffff",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "6px",
                                    padding: "6px 16px",
                                    fontSize: "11.5px",
                                    fontWeight: "600",
                                    color: "#475569",
                                    cursor: "pointer",
                                }}
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
