import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../Components/Navbar";
import api from "../Services/Api";
import "../styles/RecommendItinerary.css";

export default function RecommendItinerary() {
    const navigate = useNavigate();
    const location = useLocation();

    // The 4 form fields
    const [destination, setDestination] = useState("");
    const [budget, setBudget] = useState("");
    const [days, setDays] = useState("");
    const [travellers, setTravellers] = useState("");

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [recommendation, setRecommendation] = useState(null);
    const [cartAdding, setCartAdding] = useState(false);

    // Prepopulate destination if passed from DestinationDetails page
    useEffect(() => {
        if (location.state?.destination_name) {
            setDestination(location.state.destination_name);
        }
    }, [location.state]);

    // Format currency helper
    const formatCurrency = (val) => {
        const num = parseFloat(val);
        if (isNaN(num)) return "₹0";
        return `₹${Math.round(num).toLocaleString("en-IN")}`;
    };

    // Media URL helper for small service thumbnails
    const getMediaUrl = (imgPath) => {
        if (!imgPath) return null;
        if (imgPath.startsWith("http://") || imgPath.startsWith("https://")) return imgPath;
        return `http://127.0.0.1:8000${imgPath.startsWith("/") ? "" : "/"}${imgPath}`;
    };

    // Back button navigation with history fallback
    const handleBack = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate("/itineraries");
        }
    };

    // Form submit with input validation
    const handleRecommendSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const cleanDest = destination.trim();
        if (!cleanDest) {
            setError("Please enter your preferred destination.");
            return;
        }

        const budgetNum = parseFloat(budget);
        if (isNaN(budgetNum) || budgetNum <= 0) {
            setError("Please enter a valid total budget greater than ₹0.");
            return;
        }

        const daysNum = parseInt(days, 10);
        if (isNaN(daysNum) || daysNum < 1 || daysNum > 14) {
            setError("Please enter a valid number of days between 1 and 14.");
            return;
        }

        const travellersNum = parseInt(travellers, 10);
        if (isNaN(travellersNum) || travellersNum < 1) {
            setError("Please enter a valid number of travellers (at least 1).");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                destination: cleanDest,
                budget: budgetNum,
                days: daysNum,
                travellers: travellersNum
            };

            const response = await api.post("itinerary/recommend/", payload);

            if (response.data && (response.data.success || response.data.status === "success")) {
                setRecommendation(response.data);
                // Scroll smoothly down to the results section
                setTimeout(() => {
                    const resultsEl = document.getElementById("itinerary-results-section");
                    if (resultsEl) {
                        resultsEl.scrollIntoView({ behavior: "smooth" });
                    }
                }, 100);
            } else {
                setError(response.data?.error || response.data?.message || "Could not generate recommendation. Please check your inputs.");
            }
        } catch (err) {
            console.error("Recommendation error:", err);
            const msg = err.response?.data?.error || err.response?.data?.message || "Unable to retrieve recommendation. Please check your connection or destination name.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // Proceed to existing booking flow for eligible services
    const handleProceedToBooking = async () => {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
            navigate("/login", {
                state: { returnUrl: "/recommend-itinerary" }
            });
            return;
        }

        if (!recommendation) return;

        setCartAdding(true);
        try {
            const summary = recommendation.trip_summary || {};
            const finance = recommendation.financial_breakdown || recommendation.cost_breakdown || {};
            const services = recommendation.selected_services || recommendation.recommended_services || {};
            const destData = recommendation.destination || {};

            const hotelObj = services.hotel;
            const transportObj = services.transportation;
            const activitiesList = services.activities || [];

            const roomId = hotelObj?.room_id || null;
            const vehicleId = transportObj?.vehicle_id || null;
            const activityItemIds = activitiesList.map(a => a.item_id).filter(Boolean);

            if (!roomId && !vehicleId && activityItemIds.length === 0) {
                alert("No bookable services found in this recommendation.");
                setCartAdding(false);
                return;
            }

            const travellersCount = summary.travellers_count || parseInt(travellers, 10) || 2;

            const payload = {
                user_id: userId,
                destination_id: destData.destination_id || summary.destination_id,
                start_date: summary.start_date || null,
                end_date: summary.end_date || null,
                days: summary.duration_days || parseInt(days, 10),
                travellers: travellersCount,
                rooms_count: hotelObj?.rooms_required || 1,
                hotel: hotelObj || null,
                transportation: transportObj || null,
                activities: activitiesList,
                hotel_room_id: roomId,
                transport_vehicle_id: vehicleId,
                activity_item_ids: activityItemIds
            };

            const res = await api.post("itinerary/batch-add-cart/", payload);
            if (res.data?.success) {
                navigate("/plan-your-trip");
            } else {
                alert(res.data?.error || res.data?.message || "Failed to add services to cart.");
            }
        } catch (err) {
            console.error("Cart error:", err);
            alert(err.response?.data?.error || "Failed to proceed to booking.");
        } finally {
            setCartAdding(false);
        }
    };

    // Reset / Regenerate handler
    const handleRegenerate = () => {
        setRecommendation(null);
        setError(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Normalized data pointers
    const summary = recommendation?.trip_summary || {};
    const finance = recommendation?.financial_breakdown || recommendation?.cost_breakdown || {};
    const services = recommendation?.selected_services || recommendation?.recommended_services || {};
    const daysList = recommendation?.daily_itinerary || recommendation?.days || [];
    const dest = recommendation?.destination || {};

    const daysCount = summary.duration_days || parseInt(days, 10) || 1;
    const nightsCount = summary.duration_nights !== undefined ? summary.duration_nights : Math.max(1, daysCount - 1);
    const travellersCount = summary.travellers_count || parseInt(travellers, 10) || 1;

    const totalCost = finance.total_trip_cost ?? finance.total_cost ?? 0;
    const perPersonCost = finance.per_person_cost ?? (travellersCount > 0 ? totalCost / travellersCount : totalCost);
    const budgetVal = finance.user_budget ?? (parseFloat(budget) || 0);

    const isWithinBudget = finance.is_within_budget !== undefined
        ? finance.is_within_budget
        : totalCost <= budgetVal;

    const remainingBudget = finance.remaining_budget !== undefined
        ? finance.remaining_budget
        : Math.max(0, budgetVal - totalCost);

    const budgetExcess = finance.budget_excess !== undefined
        ? finance.budget_excess
        : Math.max(0, totalCost - budgetVal);

    const hotelCost = finance.categories?.accommodation?.total ?? finance.hotel_cost ?? 0;
    const transportCost = finance.categories?.transportation?.total ?? finance.transportation_cost ?? 0;
    const activityCost = finance.categories?.activities?.total ?? finance.activity_cost ?? 0;
    const mealsCost = finance.categories?.meals_and_incidentals?.total ?? finance.other_expenses ?? 0;

    return (
        <div className="simple-itinerary-page">
            <Navbar />

            <main className="simple-itinerary-container">
                {/* 1. TOP-LEFT BACK BUTTON */}
                <div className="simple-top-bar">
                    <button
                        type="button"
                        className="simple-back-btn"
                        onClick={handleBack}
                    >
                        Back
                    </button>
                </div>

                {/* 2. COMPACT CENTERED FORM CARD */}
                <div className="simple-form-wrapper">
                    <div className="simple-form-card">
                        <div className="simple-form-header">
                            <h1>Plan Your Trip</h1>
                            <p>Generate a day-by-day itinerary with real Wandera services and live prices.</p>
                        </div>

                        <form onSubmit={handleRecommendSubmit} noValidate>
                            {/* TWO-COLUMN INPUT GRID */}
                            <div className="simple-form-grid">
                                {/* ROW 1, COL 1: DESTINATION */}
                                <div className="simple-form-group">
                                    <label htmlFor="destination-input">Destination</label>
                                    <input
                                        id="destination-input"
                                        type="text"
                                        className="simple-input"
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        placeholder="Enter destination (e.g. Munnar)"
                                        disabled={loading}
                                        required
                                    />
                                </div>

                                {/* ROW 1, COL 2: TOTAL BUDGET */}
                                <div className="simple-form-group">
                                    <label htmlFor="budget-input">Total Budget (₹)</label>
                                    <input
                                        id="budget-input"
                                        type="number"
                                        min="1000"
                                        step="500"
                                        className="simple-input"
                                        value={budget}
                                        onChange={(e) => setBudget(e.target.value)}
                                        placeholder="Enter budget (e.g. 25000)"
                                        disabled={loading}
                                        required
                                    />
                                </div>

                                {/* ROW 2, COL 1: NUMBER OF DAYS */}
                                <div className="simple-form-group">
                                    <label htmlFor="days-input">Number of Days</label>
                                    <input
                                        id="days-input"
                                        type="number"
                                        min="1"
                                        max="14"
                                        className="simple-input"
                                        value={days}
                                        onChange={(e) => setDays(e.target.value)}
                                        placeholder="Enter days (e.g. 3)"
                                        disabled={loading}
                                        required
                                    />
                                </div>

                                {/* ROW 2, COL 2: NUMBER OF TRAVELLERS */}
                                <div className="simple-form-group">
                                    <label htmlFor="travellers-input">Number of Travellers</label>
                                    <input
                                        id="travellers-input"
                                        type="number"
                                        min="1"
                                        max="50"
                                        className="simple-input"
                                        value={travellers}
                                        onChange={(e) => setTravellers(e.target.value)}
                                        placeholder="Enter travellers (e.g. 2)"
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            {/* CENTERED RECOMMEND ITINERARY BUTTON */}
                            <div className="simple-form-actions">
                                <button
                                    type="submit"
                                    className="btn-simple-submit"
                                    disabled={loading}
                                >
                                    {loading ? "Generating Itinerary..." : "Recommend Itinerary"}
                                </button>
                            </div>
                        </form>

                        {/* LOADING STATE */}
                        {loading && (
                            <div className="simple-loading-box">
                                <div className="simple-spinner"></div>
                                <p>Checking available hotels, vehicles, and activities in {destination.trim() || "destination"}...</p>
                            </div>
                        )}

                        {/* ERROR NOTICE */}
                        {error && !loading && (
                            <div className="simple-error-box">
                                <span className="simple-error-text">{error}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. ITINERARY RESULTS SECTION */}
                {recommendation && !loading && (
                    <div id="itinerary-results-section" className="simple-results-wrapper">
                        {/* A. COMPACT TRIP SUMMARY */}
                        <div className="simple-card trip-summary-card">
                            <div className="trip-summary-header">
                                <h2>Trip Summary</h2>
                                <div className="trip-summary-actions">
                                    <button
                                        type="button"
                                        className="btn-simple-outline"
                                        onClick={handleRegenerate}
                                    >
                                        Regenerate Itinerary
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-simple-primary"
                                        onClick={handleProceedToBooking}
                                        disabled={cartAdding}
                                    >
                                        {cartAdding ? "Adding to Cart..." : "Proceed to Booking"}
                                    </button>
                                </div>
                            </div>

                            <div className="summary-details-list">
                                <div className="summary-item">
                                    <span className="summary-label">Destination:</span>
                                    <span className="summary-value">{summary.destination_name || dest.name || destination}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Duration:</span>
                                    <span className="summary-value">
                                        {daysCount} {daysCount === 1 ? "day" : "days"} ({nightsCount} {nightsCount === 1 ? "night" : "nights"})
                                    </span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Number of Travellers:</span>
                                    <span className="summary-value">
                                        {travellersCount} {travellersCount === 1 ? "traveller" : "travellers"}
                                    </span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Total Budget:</span>
                                    <span className="summary-value">{formatCurrency(budgetVal)}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Total Estimated Trip Cost:</span>
                                    <span className="summary-value summary-total-value">
                                        {formatCurrency(totalCost)}
                                    </span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Estimated Cost Per Person:</span>
                                    <span className="summary-value">{formatCurrency(perPersonCost)}</span>
                                </div>
                                <div className="summary-item full-width-summary">
                                    <span className="summary-label">
                                        {isWithinBudget ? "Remaining Budget:" : "Budget Excess:"}
                                    </span>
                                    <span className={`summary-value budget-variance-badge ${isWithinBudget ? "budget-within" : "budget-excess"}`}>
                                        {isWithinBudget ? (
                                            <>₹{Math.round(remainingBudget).toLocaleString("en-IN")} (Within Budget)</>
                                        ) : (
                                            <>Exceeded by ₹{Math.round(budgetExcess).toLocaleString("en-IN")}</>
                                        )}
                                    </span>
                                    {!isWithinBudget && (
                                        <small className="budget-limitation-note">
                                            Notice: The verified minimum accommodation, transport, and activity rates in {summary.destination_name || destination} require {formatCurrency(totalCost)}. Consider adjusting your budget or duration.
                                        </small>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* B. DAY-BY-DAY SECTIONS */}
                        <div className="days-list-wrapper">
                            {daysList.map((day) => {
                                const schedule = day.schedule || day.slots || {};
                                const expenses = day.expenses || day.day_expenses || {};

                                const morningImg = schedule.morning?.images?.[0] || schedule.morning?.image;
                                const afternoonImg = schedule.afternoon?.images?.[0] || schedule.afternoon?.image;
                                const eveningImg = schedule.evening?.images?.[0] || schedule.evening?.image;

                                return (
                                    <div key={day.day_number} className="simple-card day-section-card">
                                        <div className="day-card-header">
                                            <h3>
                                                Day {day.day_number} – {day.day_title || day.theme || `Explore ${summary.destination_name || destination}`}
                                            </h3>
                                            {(day.display_date || day.date) && (
                                                <span className="day-card-date">{day.display_date || day.date}</span>
                                            )}
                                        </div>

                                        <div className="day-schedule-body">
                                            {/* MORNING */}
                                            {schedule.morning && (
                                                <div className="schedule-slot">
                                                    <span className="slot-title">Morning:</span>
                                                    <div className="slot-content">
                                                        <p className="slot-description">
                                                            {schedule.morning.time_slot ? `${schedule.morning.time_slot}: ` : ""}
                                                            {schedule.morning.title}. {schedule.morning.description}
                                                        </p>
                                                        {schedule.morning.service_name && (
                                                            <div className="slot-service-line">
                                                                Service: <strong>{schedule.morning.service_name}</strong>
                                                                {schedule.morning.price ? ` (${formatCurrency(schedule.morning.price)})` : ""}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {morningImg && (
                                                        <img
                                                            src={getMediaUrl(morningImg)}
                                                            alt={schedule.morning.title}
                                                            className="slot-thumbnail"
                                                            onError={(e) => { e.target.style.display = "none"; }}
                                                        />
                                                    )}
                                                </div>
                                            )}

                                            {/* AFTERNOON */}
                                            {schedule.afternoon && (
                                                <div className="schedule-slot">
                                                    <span className="slot-title">Afternoon:</span>
                                                    <div className="slot-content">
                                                        <p className="slot-description">
                                                            {schedule.afternoon.time_slot ? `${schedule.afternoon.time_slot}: ` : ""}
                                                            {schedule.afternoon.title}. {schedule.afternoon.description}
                                                        </p>
                                                        {schedule.afternoon.service_name && (
                                                            <div className="slot-service-line">
                                                                Activity: <strong>{schedule.afternoon.service_name}</strong>
                                                                {schedule.afternoon.price ? ` (${formatCurrency(schedule.afternoon.price)}/person)` : ""}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {afternoonImg && (
                                                        <img
                                                            src={getMediaUrl(afternoonImg)}
                                                            alt={schedule.afternoon.title}
                                                            className="slot-thumbnail"
                                                            onError={(e) => { e.target.style.display = "none"; }}
                                                        />
                                                    )}
                                                </div>
                                            )}

                                            {/* EVENING */}
                                            {schedule.evening && (
                                                <div className="schedule-slot">
                                                    <span className="slot-title">Evening:</span>
                                                    <div className="slot-content">
                                                        <p className="slot-description">
                                                            {schedule.evening.time_slot ? `${schedule.evening.time_slot}: ` : ""}
                                                            {schedule.evening.title}. {schedule.evening.description}
                                                        </p>
                                                        {schedule.evening.service_name && (
                                                            <div className="slot-service-line">
                                                                Location: <strong>{schedule.evening.service_name}</strong>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {eveningImg && (
                                                        <img
                                                            src={getMediaUrl(eveningImg)}
                                                            alt={schedule.evening.title}
                                                            className="slot-thumbnail"
                                                            onError={(e) => { e.target.style.display = "none"; }}
                                                        />
                                                    )}
                                                </div>
                                            )}

                                            {/* ACCOMMODATION */}
                                            <div className="schedule-service-box">
                                                <div className="service-row">
                                                    <span className="service-label">Accommodation:</span>
                                                    <span className="service-value">
                                                        {services.hotel?.hotel_name ? (
                                                            <>
                                                                <strong>{services.hotel.hotel_name}</strong> – {services.hotel.room_name || "Standard Room"} ({formatCurrency(services.hotel.price_per_night)}/night
                                                                {services.hotel.rooms_required > 1 ? ` • ${services.hotel.rooms_required} rooms for ${travellersCount} travellers` : ""})
                                                            </>
                                                        ) : (
                                                            "Actual available accommodation from Wandera."
                                                        )}
                                                    </span>
                                                </div>

                                                {/* TRANSPORTATION */}
                                                <div className="service-row">
                                                    <span className="service-label">Transportation:</span>
                                                    <span className="service-value">
                                                        {services.transportation?.vehicle_name ? (
                                                            <>
                                                                <strong>{services.transportation.vehicle_name}</strong>
                                                                {services.transportation.service_name ? ` by ${services.transportation.service_name}` : ""}
                                                                {` (${formatCurrency(services.transportation.price_fare)}/day, shared group transport)`}
                                                            </>
                                                        ) : (
                                                            "Actual suitable transportation service."
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* ESTIMATED DAILY COST */}
                                            <div className="day-cost-row">
                                                <span>Estimated daily cost:</span>
                                                <strong>{formatCurrency(expenses.day_total || expenses.total || 0)}</strong>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* C. ESTIMATED TRIP COST SUMMARY */}
                        <div className="simple-card cost-summary-card">
                            <h2>Estimated Trip Cost</h2>

                            <ul className="cost-breakdown-list">
                                <li>
                                    <span>Accommodation Cost:</span>
                                    <strong>{formatCurrency(hotelCost)}</strong>
                                    {finance.categories?.accommodation?.label && (
                                        <small className="cost-item-meta">({finance.categories.accommodation.label})</small>
                                    )}
                                </li>
                                <li>
                                    <span>Transportation Cost:</span>
                                    <strong>{formatCurrency(transportCost)}</strong>
                                    {finance.categories?.transportation?.label && (
                                        <small className="cost-item-meta">({finance.categories.transportation.label})</small>
                                    )}
                                </li>
                                <li>
                                    <span>Activity Cost:</span>
                                    <strong>{formatCurrency(activityCost)}</strong>
                                    {finance.categories?.activities?.label && (
                                        <small className="cost-item-meta">({finance.categories.activities.label})</small>
                                    )}
                                </li>
                                {mealsCost > 0 && (
                                    <li>
                                        <span>Meals & Local Expenses (Estimate):</span>
                                        <strong>{formatCurrency(mealsCost)}</strong>
                                        <small className="cost-item-meta">(Daily meal allowance)</small>
                                    </li>
                                )}
                                <li className="cost-total-row">
                                    <span>Total Estimated Trip Cost:</span>
                                    <strong className="grand-total">{formatCurrency(totalCost)}</strong>
                                </li>
                                <li className="cost-per-person-row">
                                    <span>Estimated Cost Per Person:</span>
                                    <strong>{formatCurrency(perPersonCost)}</strong>
                                    <small className="cost-item-meta">({formatCurrency(totalCost)} ÷ {travellersCount} {travellersCount === 1 ? "traveller" : "travellers"})</small>
                                </li>
                                <li className="cost-budget-row">
                                    <span>Total Budget:</span>
                                    <strong>{formatCurrency(budgetVal)}</strong>
                                </li>
                                <li className={`cost-variance-row ${isWithinBudget ? "variance-within" : "variance-excess"}`}>
                                    <span>{isWithinBudget ? "Remaining Budget:" : "Budget Excess:"}</span>
                                    <strong>
                                        {isWithinBudget ? `+${formatCurrency(remainingBudget)}` : `-${formatCurrency(budgetExcess)}`}
                                    </strong>
                                </li>
                            </ul>

                            <p className="cost-footnote">
                                Prices are calculated using actual available services from the Wandera database.
                            </p>

                            <div className="cost-card-actions">
                                <button
                                    type="button"
                                    className="btn-simple-outline"
                                    onClick={handleRegenerate}
                                >
                                    Regenerate Itinerary
                                </button>
                                <button
                                    type="button"
                                    className="btn-simple-primary"
                                    onClick={handleProceedToBooking}
                                    disabled={cartAdding}
                                >
                                    {cartAdding ? "Adding to Cart..." : "Proceed to Booking"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
