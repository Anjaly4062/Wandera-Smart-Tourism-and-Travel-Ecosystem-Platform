import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../Services/Api";
import "../styles/WanderaAIAssistant.css";

const BUDGET_MAPPING = {
  "Below ₹5,000": "Low",
  "₹5,000 – ₹10,000": "Moderate",
  "₹10,000 – ₹15,000": "High",
  "Above ₹15,000": "High",
};

const mapBudgetToBackend = (uiValue) => {
  if (!uiValue) return "";
  if (BUDGET_MAPPING[uiValue]) return BUDGET_MAPPING[uiValue];
  const normalized = uiValue.replace(/–/g, "-").trim();
  if (
    normalized === "Below ₹5,000" ||
    normalized === "Below Rs 5,000" ||
    normalized === "Below 5000"
  )
    return "Low";
  if (
    normalized === "₹5,000 - ₹10,000" ||
    normalized === "5,000 - 10,000"
  )
    return "Moderate";
  if (
    normalized === "₹10,000 - ₹15,000" ||
    normalized === "10,000 - 15,000"
  )
    return "High";
  if (normalized === "Above ₹15,000" || normalized === "Above 15000")
    return "High";
  return uiValue;
};

const QUESTIONS = [
  {
    id: "travel_preferences",
    question: "What type of destination do you prefer?",
    options: ["Beach", "Hill Station", "Wildlife", "Waterfall", "Other"],
  },
  {
    id: "travel_style",
    question: "Who are you travelling with?",
    options: ["Family", "Solo", "Couple", "Friends"],
  },
  {
    id: "budget_range",
    question: "What is your budget range?",
    options: [
      "Below ₹5,000",
      "₹5,000 – ₹10,000",
      "₹10,000 – ₹15,000",
      "Above ₹15,000",
    ],
  },
  {
    id: "trip_days",
    question: "How many days do you plan to travel?",
    options: ["1–2 days", "3–4 days", "5–7 days", "More than 7 days"],
  },
];

export default function WanderaAIAssistant() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({
    travel_preferences: "",
    travel_style: "",
    budget_range: "",
    trip_days: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [serverMessage, setServerMessage] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [matchingRecommendations, setMatchingRecommendations] = useState([]);
  const [otherRecommendations, setOtherRecommendations] = useState([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Hide AI Assistant on Admin and Provider dashboards
  const role = localStorage.getItem("role");
  const isAdmin = location.pathname.startsWith("/admin") || role === "admin";
  const isProvider =
    location.pathname.startsWith("/provider") || role === "service_provider";

  if (isAdmin || isProvider) {
    return null;
  }

  const currentQ = QUESTIONS[currentStep - 1];
  const currentAnswer = answers[currentQ?.id] || "";

  const handleSelectOption = (option) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: option,
    }));
  };

  const handleNext = () => {
    if (!currentAnswer) return;
    if (currentStep < QUESTIONS.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!currentAnswer) return;

    setLoading(true);
    setError("");
    setServerMessage("");
    setHasSubmitted(true);

    try {
      const backendBudget = mapBudgetToBackend(answers.budget_range);
      const response = await api.post("ai-recommendations/", {
        travel_preferences: answers.travel_preferences,
        travel_style: answers.travel_style,
        budget_range: backendBudget,
        trip_days: answers.trip_days,
      });

      if (response.data && response.data.success) {
        const allRecs = response.data.recommendations || [];
        const matching = response.data.matching_recommendations || [];
        const other = response.data.other_recommendations || [];

        setRecommendations(allRecs);
        setMatchingRecommendations(matching);
        setOtherRecommendations(other);
        if (response.data.message) {
          setServerMessage(response.data.message);
        }
      } else {
        setError(response.data?.message || "Could not fetch recommendations.");
      }
    } catch (err) {
      console.error("AI Recommendation Error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to generate recommendations. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setAnswers({
      travel_preferences: "",
      travel_style: "",
      budget_range: "",
      trip_days: "",
    });
    setHasSubmitted(false);
    setRecommendations([]);
    setMatchingRecommendations([]);
    setOtherRecommendations([]);
    setServerMessage("");
    setError("");
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleViewDestination = (destinationId) => {
    setIsOpen(false);
    navigate(`/view/${destinationId}`);
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return "₹0";
    return `₹${Math.round(Number(val)).toLocaleString("en-IN")}`;
  };

  const getHotelInfo = (hotels) => {
    if (!hotels || hotels.length === 0) return null;
    const h = hotels[0];
    const name = h.hotel?.hotel_name || h.business_name || "Hotel";
    let priceStr = "";
    if (h.hotel?.rooms && h.hotel.rooms.length > 0) {
      const validPrices = h.hotel.rooms
        .map((r) => Number(r.price_per_night) || 0)
        .filter((p) => p > 0);
      if (validPrices.length > 0) {
        const minP = Math.min(...validPrices);
        priceStr = `${formatCurrency(minP)}/night`;
      }
    }
    return { name, price: priceStr };
  };

  const getTransportInfo = (transports) => {
    if (!transports || transports.length === 0) return null;
    const t = transports[0];
    const name =
      t.transportation?.service_name || t.business_name || "Transportation";
    let priceStr = "";
    if (t.transportation?.price_fare) {
      priceStr = formatCurrency(t.transportation.price_fare);
    } else if (
      t.transportation?.vehicles &&
      t.transportation.vehicles.length > 0
    ) {
      const validPrices = t.transportation.vehicles
        .map((v) => Number(v.price_fare) || 0)
        .filter((p) => p > 0);
      if (validPrices.length > 0) {
        const minP = Math.min(...validPrices);
        priceStr = formatCurrency(minP);
      }
    }
    return { name, price: priceStr };
  };

  const getActivityInfo = (activities) => {
    if (!activities || activities.length === 0) return null;
    const a = activities[0];
    const name = a.activity?.activity_name || a.business_name || "Activity";
    let priceStr = "";
    if (a.activity?.price) {
      priceStr = formatCurrency(a.activity.price);
    } else if (a.activity?.items && a.activity.items.length > 0) {
      const validPrices = a.activity.items
        .map((i) => Number(i.price) || 0)
        .filter((p) => p > 0);
      if (validPrices.length > 0) {
        const minP = Math.min(...validPrices);
        priceStr = formatCurrency(minP);
      }
    }
    return { name, price: priceStr };
  };

  const renderRecommendationCard = (rec) => {
    const hotelInfo = getHotelInfo(rec.hotels);
    const transportInfo = getTransportInfo(rec.transportation);
    const activityInfo = getActivityInfo(rec.activities);

    return (
      <div
        key={rec.destination_id}
        className={`wandera-rec-card ${
          rec.preference_match ? "wandera-rec-card-matching" : ""
        }`}
      >
        {/* Destination Heading Row: Name on Left, View Button on Right */}
        <div className="wandera-rec-heading-row">
          <div className="wandera-rec-title-wrap">
            <h4 className="wandera-rec-dest-name">
              {rec.destination_name || rec.name}
            </h4>
            <p className="wandera-rec-category">
              {rec.category} {rec.district ? `• ${rec.district}` : ""}
            </p>
          </div>

          <button
            className="wandera-rec-view-btn"
            onClick={() => handleViewDestination(rec.destination_id)}
          >
            View Destination
          </button>
        </div>

        {/* Budget & Score Stats Grid */}
        <div className="wandera-rec-stats-grid">
          <div className="wandera-stat-item">
            <span className="wandera-stat-label">Estimated</span>
            <span className="wandera-stat-value">
              {formatCurrency(rec.estimated_total_cost)}
            </span>
          </div>
          <div className="wandera-stat-item">
            <span className="wandera-stat-label">Budget</span>
            <span className="wandera-stat-value">
              {formatCurrency(rec.budget_limit)}
            </span>
          </div>
          <div className="wandera-stat-item">
            <span className="wandera-stat-label">Remaining</span>
            <span className="wandera-stat-value">
              {formatCurrency(rec.budget_remaining)}
            </span>
          </div>
          <div className="wandera-stat-item">
            <span className="wandera-stat-label">AI Score</span>
            <span className="wandera-score-badge">
              {Math.round(rec.suitability_score || 0)}%
            </span>
          </div>
        </div>

        {/* Attached Services Breakdown */}
        {(hotelInfo || transportInfo || activityInfo) && (
          <div className="wandera-rec-services">
            {hotelInfo && (
              <div className="wandera-service-section">
                <span className="wandera-service-type-title">Hotels</span>
                <div className="wandera-service-row">
                  <span className="wandera-service-name">{hotelInfo.name}</span>
                  {hotelInfo.price && (
                    <span className="wandera-service-price">
                      {hotelInfo.price}
                    </span>
                  )}
                </div>
              </div>
            )}

            {transportInfo && (
              <div className="wandera-service-section">
                <span className="wandera-service-type-title">Transportation</span>
                <div className="wandera-service-row">
                  <span className="wandera-service-name">
                    {transportInfo.name}
                  </span>
                  {transportInfo.price && (
                    <span className="wandera-service-price">
                      {transportInfo.price}
                    </span>
                  )}
                </div>
              </div>
            )}

            {activityInfo && (
              <div className="wandera-service-section">
                <span className="wandera-service-type-title">Activities</span>
                <div className="wandera-service-row">
                  <span className="wandera-service-name">
                    {activityInfo.name}
                  </span>
                  {activityInfo.price && (
                    <span className="wandera-service-price">
                      {activityInfo.price}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Floating Action Button for Tourists */}
      {!isOpen && (
        <button
          className="wandera-ai-fab"
          onClick={() => setIsOpen(true)}
          title="Ask Wandera AI for destination recommendations"
        >
          <span className="wandera-ai-fab-icon">✨</span>
          <span>Ask Wandera AI</span>
        </button>
      )}

      {/* Right-Side Drawer */}
      {isOpen && (
        <div
          className="wandera-ai-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="wandera-ai-drawer">
            {/* Header */}
            <div className="wandera-ai-header">
              <div className="wandera-ai-title-wrap">
                <h3 className="wandera-ai-title">
                  {hasSubmitted ? "✨ Recommendations" : "✨ Wandera AI"}
                </h3>
              </div>
              <button
                className="wandera-ai-close-btn"
                onClick={handleClose}
                aria-label="Close Wandera AI"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="wandera-ai-body">
              {!hasSubmitted ? (
                /* Questionnaire Mode */
                <>
                  <div className="wandera-ai-step-indicator">
                    <span className="wandera-ai-step-label">
                      Question {currentStep} of {QUESTIONS.length}
                    </span>
                  </div>

                  <div className="wandera-ai-progress-bar">
                    <div
                      className="wandera-ai-progress-fill"
                      style={{
                        width: `${(currentStep / QUESTIONS.length) * 100}%`,
                      }}
                    />
                  </div>

                  <h4 className="wandera-ai-question-title">
                    {currentQ.question}
                  </h4>

                  {/* 3-Column Text-Only Options Grid */}
                  <div className="option-grid">
                    {currentQ.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`option-button ${
                          currentAnswer === opt ? "selected" : ""
                        }`}
                        onClick={() => handleSelectOption(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                /* Recommendations Result Mode */
                <>
                  <div className="wandera-ai-results-header">
                    <span
                      className="wandera-ai-results-count"
                      title={`${answers.travel_preferences} • ${answers.travel_style} • ${answers.budget_range}`}
                    >
                      {answers.travel_preferences} • {answers.travel_style} •{" "}
                      {answers.budget_range}
                    </span>
                    <button
                      className="wandera-ai-retake-btn"
                      onClick={handleReset}
                    >
                      ↺ Change
                    </button>
                  </div>

                  {loading && (
                    <div className="wandera-ai-loading">
                      <div className="wandera-spinner" />
                      <p>Analyzing destinations with Wandera AI...</p>
                    </div>
                  )}

                  {error && (
                    <div className="wandera-ai-error">
                      <p>{error}</p>
                      <button
                        className="wandera-btn wandera-btn-secondary"
                        style={{ marginTop: "8px", width: "100%" }}
                        onClick={handleSubmit}
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {!loading && !error && recommendations.length === 0 && (
                    <div className="wandera-ai-empty">
                      <p>
                        {serverMessage ||
                          `No ${answers.travel_preferences || ""} destinations are available within your selected budget.`}
                      </p>
                      <button
                        className="wandera-btn wandera-btn-secondary"
                        style={{ marginTop: "12px" }}
                        onClick={handleReset}
                      >
                        Reset Questionnaire
                      </button>
                    </div>
                  )}

                  {!loading && !error && recommendations.length > 0 && (
                    <div className="wandera-ai-card-list">
                      {recommendations.map((rec) =>
                        renderRecommendationCard(rec)
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer Navigation (only for Questionnaire mode) */}
            {!hasSubmitted && (
              <div className="wandera-ai-footer">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    className="wandera-btn wandera-btn-secondary"
                    onClick={handleBack}
                  >
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < QUESTIONS.length ? (
                  <button
                    type="button"
                    className="wandera-btn wandera-btn-primary"
                    disabled={!currentAnswer}
                    onClick={handleNext}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    className="wandera-btn wandera-btn-primary"
                    disabled={!currentAnswer || loading}
                    onClick={handleSubmit}
                  >
                    {loading ? "Finding Recommendations..." : "Get Recommendations"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
