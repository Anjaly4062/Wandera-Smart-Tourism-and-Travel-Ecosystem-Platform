import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import api from "../Services/Api";
import "../styles/Itineraries.css";

export default function ItineraryDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [itinerary, setItinerary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await api.get(`itineraries/${id}/`);
                setItinerary(res.data);
            } catch (err) {
                console.error("Error fetching itinerary details:", err);
                setError("Unable to load itinerary details. It may not exist or has been removed.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchDetails();
        }
    }, [id]);

    const handleDownloadPdf = async () => {
        if (!itinerary) return;
        setDownloading(true);
        setDownloadError(null);

        try {
            const currentUserId = localStorage.getItem("user_id") || "";
            const query = currentUserId ? `?user_id=${currentUserId}` : "";
            const response = await api.get(`itineraries/${itinerary.itinerary_id}/download-pdf/${query}`, {
                responseType: "blob"
            });

            // Extract filename from Content-Disposition header if available
            let filename = `Wandera_Itinerary_${itinerary.itinerary_id}.pdf`;
            const disposition = response.headers?.["content-disposition"] || response.headers?.["Content-Disposition"];
            if (disposition && disposition.indexOf("filename=") !== -1) {
                const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, "");
                }
            } else if (itinerary.title) {
                const safe = itinerary.title.replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "_");
                if (safe) {
                    filename = `Wandera_Itinerary_${safe}.pdf`;
                }
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
            console.error("Itinerary PDF download error:", err);
            setDownloadError("Failed to download itinerary PDF. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    const formatCurrency = (amount) => {
        const num = parseFloat(amount);
        if (isNaN(num)) return "₹0";
        return `₹${num.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
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

    return (
        <div className="itineraries-page">
            <Navbar />

            <div className="details-itinerary-container">
                <div className="details-top-action-bar">
                    <button
                        type="button"
                        className="back-link"
                        onClick={() => navigate("/itineraries")}
                    >
                        ← Back to Shared Itineraries
                    </button>

                    {itinerary && (
                        <button
                            type="button"
                            id="btn-download-itinerary-pdf-top"
                            className="btn-download-itinerary-pdf"
                            onClick={handleDownloadPdf}
                            disabled={downloading}
                        >
                            {downloading ? (
                                <>
                                    <span className="btn-spinner"></span>
                                    Generating PDF...
                                </>
                            ) : (
                                <>
                                    <span className="btn-icon">📄</span> Download Itinerary as PDF
                                </>
                            )}
                        </button>
                    )}
                </div>

                {downloadError && (
                    <div className="itinerary-download-error-toast">
                        <span>⚠️</span> {downloadError}
                    </div>
                )}

                {loading ? (
                    <div className="itineraries-loading-state">
                        <div className="itineraries-loading-spinner"></div>
                        <p>Loading itinerary details...</p>
                    </div>
                ) : error || !itinerary ? (
                    <div className="itineraries-empty-state">
                        <span className="itineraries-empty-icon">⚠️</span>
                        <h3>Itinerary Not Found</h3>
                        <p>{error || "We could not find the requested itinerary."}</p>
                        <button
                            type="button"
                            className="btn-share-itinerary"
                            onClick={() => navigate("/itineraries")}
                        >
                            Back to Itineraries
                        </button>
                    </div>
                ) : (
                    <div>
                        {/* HERO HEADER CARD */}
                        <div className="details-hero-card">
                            <div className="itinerary-badge-row">
                                <span className="itinerary-badge itinerary-badge-dest">
                                    📍 {itinerary.destination}
                                </span>
                                <span className="itinerary-badge itinerary-badge-days">
                                    ⏱️ {itinerary.number_of_days} {itinerary.number_of_days === 1 ? "Day" : "Days"} Trip
                                </span>
                            </div>

                            <h1 className="details-title">{itinerary.title}</h1>

                            <div className="details-meta-bar">
                                <div className="details-meta-item">
                                    <span>👤 Shared by:</span>
                                    <strong>{itinerary.author_name || "Traveler"}</strong>
                                </div>
                                {itinerary.created_at && (
                                    <div className="details-meta-item">
                                        <span>📅 Published on:</span>
                                        <strong>{formatDate(itinerary.created_at)}</strong>
                                    </div>
                                )}
                            </div>

                            {/* COST HIGHLIGHT BANNER */}
                            <div className="details-cost-highlight-box">
                                <div>
                                    <div className="cost-highlight-label">Total Trip Cost</div>
                                    <div className="cost-highlight-amount">
                                        {formatCurrency(itinerary.total_cost)}
                                    </div>
                                </div>
                                <div style={{ fontSize: "13px", color: "#94a3b8" }}>
                                    Comprehensive expenses for {itinerary.number_of_days} {itinerary.number_of_days === 1 ? "day" : "days"}
                                </div>
                            </div>
                        </div>

                        {/* CONTENT SECTIONS */}
                        <div className="details-content-grid">
                            {/* 1. TRAVEL EXPERIENCE */}
                            <div className="details-section-card">
                                <h3 className="details-section-heading">
                                    <span>📖</span> Travel Experience (Day by Day)
                                </h3>
                                <p className="details-experience-text">
                                    {itinerary.description}
                                </p>
                            </div>

                            {/* 2. PLACES & ACTIVITIES VISITED */}
                            {itinerary.activities && (
                                <div className="details-section-card">
                                    <h3 className="details-section-heading">
                                        <span>🎯</span> Activities & Places Visited
                                    </h3>
                                    <p className="details-experience-text">
                                        {itinerary.activities}
                                    </p>
                                </div>
                            )}

                            {/* 3. EXPENSES BREAKDOWN */}
                            <div className="details-section-card">
                                <h3 className="details-section-heading">
                                    <span>💰</span> Expense Breakdown
                                </h3>

                                <table className="expense-breakdown-table">
                                    <tbody>
                                        <tr>
                                            <td>
                                                <strong>Accommodation:</strong>{" "}
                                                {itinerary.hotel_name ? (
                                                    <span>{itinerary.hotel_name}</span>
                                                ) : (
                                                    <span style={{ color: "#64748b" }}>Not specified</span>
                                                )}
                                            </td>
                                            <td className="cost-value">
                                                {formatCurrency(itinerary.accommodation_cost)}
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>
                                                <strong>Transportation:</strong>{" "}
                                                {itinerary.transportation_type ? (
                                                    <span>{itinerary.transportation_type}</span>
                                                ) : (
                                                    <span style={{ color: "#64748b" }}>Not specified</span>
                                                )}
                                            </td>
                                            <td className="cost-value">
                                                {formatCurrency(itinerary.transportation_cost)}
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>
                                                <strong>Food & Dining Expenses:</strong>
                                            </td>
                                            <td className="cost-value">
                                                {formatCurrency(itinerary.food_cost)}
                                            </td>
                                        </tr>

                                        <tr>
                                            <td>
                                                <strong>Other Expenses & Entry Fees:</strong>
                                            </td>
                                            <td className="cost-value">
                                                {formatCurrency(itinerary.other_cost)}
                                            </td>
                                        </tr>

                                        <tr className="total-row">
                                            <td>
                                                <strong>Total Calculated Cost:</strong>
                                            </td>
                                            <td className="cost-value" style={{ color: "#10b981", fontSize: "16px" }}>
                                                {formatCurrency(itinerary.total_cost)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* 4. TRAVEL TIPS */}
                            {itinerary.travel_tips && (
                                <div className="details-section-card">
                                    <h3 className="details-section-heading">
                                        <span>💡</span> Helpful Travel Tips
                                    </h3>
                                    <div className="details-tips-box">
                                        {itinerary.travel_tips}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* BOTTOM ACTIONS */}
                        <div className="details-bottom-actions">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={() => navigate("/itineraries")}
                            >
                                ← Back to All Itineraries
                            </button>
                            <button
                                type="button"
                                id="btn-download-itinerary-pdf-bottom"
                                className="btn-download-itinerary-pdf"
                                onClick={handleDownloadPdf}
                                disabled={downloading}
                            >
                                {downloading ? (
                                    <>
                                        <span className="btn-spinner"></span>
                                        Generating PDF...
                                    </>
                                ) : (
                                    <>
                                        <span className="btn-icon">📄</span> Download Itinerary as PDF
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
