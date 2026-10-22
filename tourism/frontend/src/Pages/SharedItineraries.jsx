import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import api from "../Services/Api";
import "../styles/Itineraries.css";

export default function SharedItineraries() {
    console.log("SharedItineraries component is rendering");
    const navigate = useNavigate();
    const [itineraries, setItineraries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleShareItineraryClick = () => {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
            navigate("/login", { state: { returnUrl: "/create-itinerary" } });
            return;
        }
        navigate("/create-itinerary");
    };

    const fetchItineraries = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get("itineraries/");
            setItineraries(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error loading itineraries:", err);
            setError("Unable to connect to the server. Please check your network or try again later.");
            setItineraries([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItineraries();
    }, []);

    const formatCurrency = (amount) => {
        const num = parseFloat(amount);
        if (isNaN(num)) return "₹0";
        return `₹${num.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="itineraries-page">
            <Navbar />

            <div className="itineraries-container">
                {/* HERO / HEADER SECTION */}
                <section className="itineraries-hero">
                    <div className="itineraries-hero-left">
                        <h1>Shared Itineraries</h1>
                        <p>
                            Explore authentic travel itineraries, day-by-day experiences, and real expense breakdowns
                            shared by fellow travelers across Kerala.
                        </p>
                    </div>

                    <div className="itineraries-hero-actions">
                        <button
                            type="button"
                            className="btn-recommend-itinerary-cta"
                            onClick={() => navigate("/recommend-itinerary")}
                        >
                            <span>✨</span>
                            <span>Recommend Itinerary</span>
                        </button>
                        <button
                            type="button"
                            className="btn-share-itinerary"
                            onClick={handleShareItineraryClick}
                        >
                            <span>+</span>
                            <span>Share Itinerary</span>
                        </button>
                    </div>
                </section>

                {/* CONTENT SECTION */}
                {loading ? (
                    <div className="itineraries-loading-state">
                        <div className="itineraries-loading-spinner"></div>
                        <p>Loading shared itineraries...</p>
                    </div>
                ) : error ? (
                    <div className="itineraries-empty-state">
                        <span className="itineraries-empty-icon">⚠️</span>
                        <h3>Connection Issue</h3>
                        <p>{error}</p>
                        <button
                            type="button"
                            className="btn-share-itinerary"
                            onClick={fetchItineraries}
                        >
                            🔄 Try Again
                        </button>
                    </div>
                ) : itineraries.length === 0 ? (
                    <div className="itineraries-empty-state">
                        <span className="itineraries-empty-icon">🗺️</span>
                        <h3>No itineraries shared yet.</h3>
                        <p>
                            Be the first traveler to share your completed journey, travel tips, and expense breakdown with the Wandera community!
                        </p>
                        <button
                            type="button"
                            className="btn-share-itinerary"
                            onClick={handleShareItineraryClick}
                        >
                            <span>+</span>
                            <span>Share Your Itinerary</span>
                        </button>
                    </div>
                ) : (
                    <div className="itineraries-grid">
                        {itineraries.map((item) => (
                            <div key={item.itinerary_id} className="itinerary-card">
                                <div>
                                    <div className="itinerary-badge-row">
                                        <span className="itinerary-badge itinerary-badge-dest">
                                            📍 {item.destination}
                                        </span>
                                        <span className="itinerary-badge itinerary-badge-days">
                                            ⏱️ {item.number_of_days} {item.number_of_days === 1 ? "Day" : "Days"}
                                        </span>
                                    </div>

                                    <h3 className="itinerary-card-title">{item.title}</h3>

                                    <div className="itinerary-card-author">
                                        <span>👤 Author:</span>
                                        <span className="author-name">{item.author_name || "Traveler"}</span>
                                    </div>

                                    <p className="itinerary-card-snippet">
                                        {item.description}
                                    </p>
                                </div>

                                <div>
                                    <div className="itinerary-card-cost-box">
                                        <span className="itinerary-card-cost-label">Total Trip Cost</span>
                                        <span className="itinerary-card-cost-value">
                                            {formatCurrency(item.total_cost)}
                                        </span>
                                    </div>

                                    <div className="itinerary-card-footer">
                                        <button
                                            type="button"
                                            className="btn-view-details"
                                            onClick={() => navigate(`/itinerary/${item.itinerary_id}`)}
                                        >
                                            View Details →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
