import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import api from "../Services/Api";
import "../styles/Itineraries.css";

export default function CreateItinerary() {
    const navigate = useNavigate();

    const [userId, setUserId] = useState(null);

    // Form fields
    const [title, setTitle] = useState("");
    const [destination, setDestination] = useState("");
    const [numberOfDays, setNumberOfDays] = useState("1");
    const [description, setDescription] = useState("");
    const [hotelName, setHotelName] = useState("");
    const [accommodationCost, setAccommodationCost] = useState("");
    const [transportationType, setTransportationType] = useState("");
    const [transportationCost, setTransportationCost] = useState("");
    const [activities, setActivities] = useState("");
    const [foodCost, setFoodCost] = useState("");
    const [otherCost, setOtherCost] = useState("");
    const [travelTips, setTravelTips] = useState("");

    // UI states
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Check login state
    useEffect(() => {
        const storedUserId = localStorage.getItem("user_id");
        if (!storedUserId) {
            navigate("/login", { state: { returnUrl: "/create-itinerary" } });
        } else {
            setUserId(storedUserId);
        }
    }, [navigate]);

    // Calculate total trip cost from entered expense categories (no double-counting, user-entered)
    const parsedAccom = parseFloat(accommodationCost) || 0;
    const parsedTrans = parseFloat(transportationCost) || 0;
    const parsedFood = parseFloat(foodCost) || 0;
    const parsedOther = parseFloat(otherCost) || 0;
    const totalCost = (parsedAccom + parsedTrans + parsedFood + parsedOther).toFixed(2);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!title.trim()) {
            setError("Please enter an itinerary title.");
            return;
        }
        if (!destination.trim()) {
            setError("Please specify the destination.");
            return;
        }
        const daysNum = parseInt(numberOfDays, 10);
        if (isNaN(daysNum) || daysNum < 1) {
            setError("Number of days must be at least 1.");
            return;
        }
        if (!description.trim()) {
            setError("Please provide a description of your travel experience.");
            return;
        }

        setSubmitting(true);

        try {
            const payload = {
                user_id: userId,
                title: title.trim(),
                destination: destination.trim(),
                number_of_days: daysNum,
                description: description.trim(),
                hotel_name: hotelName.trim(),
                accommodation_cost: parsedAccom,
                transportation_type: transportationType.trim(),
                transportation_cost: parsedTrans,
                activities: activities.trim(),
                food_cost: parsedFood,
                other_cost: parsedOther,
                total_cost: parseFloat(totalCost),
                travel_tips: travelTips.trim(),
                is_published: true
            };

            const response = await api.post("itineraries/create/", payload);

            if (response.status === 201 || response.status === 200) {
                alert("Itinerary published successfully! Your experience is now shared with travelers.");
                navigate("/itineraries");
            } else {
                setError(response.data?.error || "Failed to publish itinerary. Please try again.");
            }
        } catch (err) {
            console.error("Error publishing itinerary:", err);
            setError(err.response?.data?.error || "An error occurred while publishing. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate("/itineraries");
    };

    return (
        <div className="itineraries-page">
            <Navbar />

            <div className="create-itinerary-container">
                <div className="create-itinerary-header">
                    <button type="button" className="back-link" onClick={handleCancel}>
                        ← Back to Shared Itineraries
                    </button>
                    <h1>Share Your Travel Itinerary</h1>
                    <p>
                        Document your completed trip and authentic experience to inspire and guide future travelers.
                    </p>
                </div>

                <div className="create-itinerary-card">
                    {error && <div className="form-error-banner">⚠️ {error}</div>}

                    <form onSubmit={handleSubmit}>
                        {/* SECTION 1: TRIP BASICS */}
                        <div className="form-section-title">
                            <span>🗺️</span> 1. Trip Overview
                        </div>

                        <div className="form-group">
                            <label htmlFor="itinerary-title">
                                Itinerary Title <span className="required-star">*</span>
                            </label>
                            <input
                                id="itinerary-title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-grid-2">
                            <div className="form-group">
                                <label htmlFor="itinerary-destination">
                                    Destination <span className="required-star">*</span>
                                </label>
                                <input
                                    id="itinerary-destination"
                                    type="text"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="itinerary-days">
                                    Number of Days <span className="required-star">*</span>
                                </label>
                                <input
                                    id="itinerary-days"
                                    type="number"
                                    min="1"
                                    value={numberOfDays}
                                    onChange={(e) => setNumberOfDays(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* SECTION 2: TRAVEL EXPERIENCE / DAY-BY-DAY */}
                        <div className="form-section-title">
                            <span>📝</span> 2. Travel Experience (Day by Day)
                        </div>

                        <div className="form-group">
                            <label htmlFor="itinerary-description">
                                Travel Experience or Description <span className="required-star">*</span>
                            </label>
                            <textarea
                                id="itinerary-description"
                                rows="6"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>

                        {/* SECTION 3: ACCOMMODATION & TRANSPORTATION */}
                        <div className="form-section-title">
                            <span>🏨</span> 3. Accommodation & Transportation
                        </div>

                        <div className="form-grid-2">
                            <div className="form-group">
                                <label htmlFor="hotel-name">
                                    Hotel or Accommodation Name <span className="optional-tag">(Optional)</span>
                                </label>
                                <input
                                    id="hotel-name"
                                    type="text"
                                    value={hotelName}
                                    onChange={(e) => setHotelName(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="accommodation-cost">
                                    Accommodation Cost (₹) <span className="optional-tag">(Optional)</span>
                                </label>
                                <input
                                    id="accommodation-cost"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={accommodationCost}
                                    onChange={(e) => setAccommodationCost(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-grid-2">
                            <div className="form-group">
                                <label htmlFor="transportation-type">
                                    Transportation Type <span className="optional-tag">(Optional)</span>
                                </label>
                                <input
                                    id="transportation-type"
                                    type="text"
                                    value={transportationType}
                                    onChange={(e) => setTransportationType(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="transportation-cost">
                                    Transportation Cost (₹) <span className="optional-tag">(Optional)</span>
                                </label>
                                <input
                                    id="transportation-cost"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={transportationCost}
                                    onChange={(e) => setTransportationCost(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* SECTION 4: ACTIVITIES & OTHER EXPENSES */}
                        <div className="form-section-title">
                            <span>🎯</span> 4. Activities & Food Expenses
                        </div>

                        <div className="form-group">
                            <label htmlFor="activities-visited">
                                Activities & Places Visited <span className="optional-tag">(Optional)</span>
                            </label>
                            <textarea
                                id="activities-visited"
                                rows="3"
                                value={activities}
                                onChange={(e) => setActivities(e.target.value)}
                            />
                        </div>

                        <div className="form-grid-2">
                            <div className="form-group">
                                <label htmlFor="food-cost">
                                    Food Expenses (₹) <span className="optional-tag">(Optional)</span>
                                </label>
                                <input
                                    id="food-cost"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={foodCost}
                                    onChange={(e) => setFoodCost(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="other-cost">
                                    Other Expenses (₹) <span className="optional-tag">(Optional)</span>
                                </label>
                                <input
                                    id="other-cost"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={otherCost}
                                    onChange={(e) => setOtherCost(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* SECTION 5: LIVE TOTAL COST SUMMARY */}
                        <div className="form-cost-summary-box">
                            <div className="form-cost-summary-left">
                                <h4>Calculated Total Trip Cost</h4>
                                <p>
                                    Sum of Accommodation (₹{parsedAccom}) + Transportation (₹{parsedTrans}) + Food (₹{parsedFood}) + Other (₹{parsedOther})
                                </p>
                            </div>
                            <div className="form-cost-summary-total">
                                ₹{parseFloat(totalCost).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                            </div>
                        </div>

                        {/* SECTION 6: TRAVEL TIPS */}
                        <div className="form-section-title">
                            <span>💡</span> 5. Travel Tips
                        </div>

                        <div className="form-group">
                            <label htmlFor="travel-tips">
                                Travel Tips & Recommendations <span className="optional-tag">(Optional)</span>
                            </label>
                            <textarea
                                id="travel-tips"
                                rows="3"
                                value={travelTips}
                                onChange={(e) => setTravelTips(e.target.value)}
                            />
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="form-actions-row">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={handleCancel}
                                disabled={submitting}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="btn-publish"
                                disabled={submitting}
                            >
                                {submitting ? "Publishing..." : "Publish Itinerary"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
