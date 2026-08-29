import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/MyProfile.css";

export default function MyProfile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const getInitialProfileData = () => {
        const cached = localStorage.getItem("tourist_profile_cached");
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                return {
                    full_name: parsed.full_name || localStorage.getItem("name") || "",
                    email: parsed.email || localStorage.getItem("email") || "",
                    phone: parsed.phone || "",
                    date_of_birth: parsed.date_of_birth || "",
                    travel_preferences: parsed.travel_preferences || [],
                    travel_style: parsed.travel_style || "",
                    budget_range: parsed.budget_range || "",
                    previous_trips: parsed.previous_trips || []
                };
            } catch (e) {
                console.error("Error reading cached profile", e);
            }
        }
        return {
            full_name: localStorage.getItem("name") || "",
            email: localStorage.getItem("email") || "",
            phone: "",
            date_of_birth: "",
            travel_preferences: [],
            travel_style: "",
            budget_range: "",
            previous_trips: []
        };
    };

    // Form data state
    const [formData, setFormData] = useState(getInitialProfileData);

    // New Trip Input state
    const [newTrip, setNewTrip] = useState({
        destination: "",
        year: "",
        category: "",
        notes: ""
    });

    // Password Change state
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: ""
    });
    const [updatingPassword, setUpdatingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState("");

    const [userBookings, setUserBookings] = useState([]);

    const userId = localStorage.getItem("user_id");

    const preferenceOptions = [
        "Beach",
        "Hill Station",
        "Waterfall",
        "Wildlife",
        "Heritage",
        "Adventure",
        "Temple",
        "Museum",
        "Backwaters",
        "Culinary / Food"
    ];

    useEffect(() => {
        if (userId) {
            getProfile();
        } else {
            setLoading(false);
            setMessage("User session not found. Please login again.");
        }
    }, [userId]);

    const getProfile = async () => {
        const currentUserId = localStorage.getItem("user_id");
        if (!currentUserId) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get(`tourist-profile/${currentUserId}/`);
            setProfile(response.data);

            const updatedData = {
                full_name: response.data.full_name || localStorage.getItem("name") || "",
                email: response.data.email || localStorage.getItem("email") || "",
                phone: response.data.phone || "",
                date_of_birth: response.data.date_of_birth || "",
                travel_preferences: response.data.travel_preferences || [],
                travel_style: response.data.travel_style || "",
                budget_range: response.data.budget_range || "",
                previous_trips: response.data.previous_trips || []
            };

            setFormData(updatedData);
            localStorage.setItem("tourist_profile_cached", JSON.stringify(updatedData));
            if (updatedData.full_name) {
                localStorage.setItem("name", updatedData.full_name);
            }

            // Fetch unified bookings
            try {
                const bookingsRes = await api.get(`user-bookings/${currentUserId}/`);
                setUserBookings(bookingsRes.data?.bookings || []);
            } catch (bErr) {
                console.error("Error fetching bookings:", bErr);
            }
        } catch (error) {
            console.error("Error loading profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handlePreferenceChange = (preference) => {
        setFormData((previous) => {
            const currentPreferences = previous.travel_preferences || [];

            if (currentPreferences.includes(preference)) {
                return {
                    ...previous,
                    travel_preferences: currentPreferences.filter((item) => item !== preference)
                };
            }

            return {
                ...previous,
                travel_preferences: [...currentPreferences, preference]
            };
        });
    };

    // Handle adding a new previous trip
    const handleAddTrip = () => {
        if (!newTrip.destination.trim()) {
            alert("Please enter a destination name for the trip.");
            return;
        }

        const tripToAdd = {
            id: Date.now(),
            destination: newTrip.destination.trim(),
            year: newTrip.year.trim() || new Date().getFullYear().toString(),
            category: newTrip.category.trim() || "Sightseeing",
            notes: newTrip.notes.trim()
        };

        setFormData((prev) => ({
            ...prev,
            previous_trips: [...prev.previous_trips, tripToAdd]
        }));

        setNewTrip({
            destination: "",
            year: "",
            category: "",
            notes: ""
        });
    };

    // Handle removing a previous trip
    const handleRemoveTrip = (tripId) => {
        setFormData((prev) => ({
            ...prev,
            previous_trips: prev.previous_trips.filter((t, idx) => (t.id || idx) !== tripId && idx !== tripId)
        }));
    };

    // Handle Password Change
    const handlePasswordChangeInput = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordMessage("");

        if (passwordData.new_password !== passwordData.confirm_password) {
            setPasswordMessage("New passwords do not match!");
            return;
        }

        if (passwordData.new_password.length < 4) {
            setPasswordMessage("New password must be at least 4 characters long.");
            return;
        }

        setUpdatingPassword(true);
        try {
            const response = await api.post(`change-password/${userId}/`, {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            });

            if (response.status === 200) {
                setPasswordMessage("Password updated successfully!");
                setPasswordData({
                    current_password: "",
                    new_password: "",
                    confirm_password: ""
                });
            }
        } catch (error) {
            console.error("Error changing password:", error);
            setPasswordMessage(error.response?.data?.error || "Failed to change password.");
        } finally {
            setUpdatingPassword(false);
        }
    };

    // Handle Profile Form Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        try {
            const response = await api.put(`tourist-profile/${userId}/`, formData);
            if (response.data) {
                setProfile(response.data);
                const updatedData = {
                    full_name: response.data.full_name || localStorage.getItem("name") || "",
                    email: response.data.email || localStorage.getItem("email") || "",
                    phone: response.data.phone || "",
                    date_of_birth: response.data.date_of_birth || "",
                    travel_preferences: response.data.travel_preferences || [],
                    travel_style: response.data.travel_style || "",
                    budget_range: response.data.budget_range || "",
                    previous_trips: response.data.previous_trips || []
                };
                setFormData(updatedData);
                localStorage.setItem("tourist_profile_cached", JSON.stringify(updatedData));
                if (updatedData.full_name) {
                    localStorage.setItem("name", updatedData.full_name);
                }
            }
            setMessage("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage(
                error.response?.data?.error || "Unable to update profile."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="profile-loading">Loading tourist profile details...</div>
        );
    }

    const initialLetter = formData.full_name ? formData.full_name.charAt(0).toUpperCase() : (profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "T");

    return (
        <main className="profile-page">
            {/* BACK TO HOME BUTTON */}
            <div className="profile-top-bar">
                <button
                    type="button"
                    className="back-home-top-btn"
                    onClick={() => navigate("/")}
                >
                    ← Back to Home
                </button>
            </div>

            {/* HERO HEADER */}
            <section className="profile-header">
                <div>
                    <h1>My Profile</h1>
                    <p>Manage your account, travel preferences, budget, previous trips, and security settings.</p>
                </div>

                <div className="profile-hero-meta">
                    <div className="profile-avatar">{initialLetter}</div>
                </div>
            </section>

                {message && (
                    <div
                        className={
                            message.includes("successfully")
                                ? "profile-message success"
                                : "profile-message error"
                        }
                    >
                        {message}
                    </div>
                )}

                <form className="profile-form" onSubmit={handleSubmit}>
                    {/* 01: PERSONAL INFORMATION (AUTO-FILLED) */}
                    <section className="profile-card">
                        <div className="card-title">
                            <span>01</span>
                            <div>
                                <h2>Personal Information</h2>
                                <p>Auto-filled with your account details</p>
                            </div>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="Full Name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email || profile?.email || localStorage.getItem("email") || ""}
                                    disabled
                                    title="Email address is associated with your login account"
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter contact phone number"
                                />
                            </div>

                            <div className="form-group">
                                <label>Date of Birth</label>
                                <input
                                    type="date"
                                    name="date_of_birth"
                                    value={formData.date_of_birth}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </section>

                    {/* 02: TRAVEL PREFERENCES */}
                    <section className="profile-card">
                        <div className="card-title">
                            <span>02</span>
                            <div>
                                <h2>Travel Preferences</h2>
                                <p>Select destination types and experiences you prefer</p>
                            </div>
                        </div>

                        <div className="preference-grid">
                            {preferenceOptions.map((preference) => (
                                <label
                                    key={preference}
                                    className={
                                        formData.travel_preferences.includes(preference)
                                            ? "preference-option selected"
                                            : "preference-option"
                                    }
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.travel_preferences.includes(preference)}
                                        onChange={() => handlePreferenceChange(preference)}
                                    />
                                    <span>{preference}</span>
                                </label>
                            ))}
                        </div>
                    </section>

                    {/* 03: TRAVEL BUDGET & STYLE */}
                    <section className="profile-card">
                        <div className="card-title">
                            <span>03</span>
                            <div>
                                <h2>Travel Budget & Style</h2>
                                <p>Set your travel budget range and preferred travel style</p>
                            </div>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Travel Budget Range</label>
                                <select
                                    name="budget_range"
                                    value={formData.budget_range}
                                    onChange={handleChange}
                                >
                                    <option value="">Select budget range</option>
                                    <option value="Budget (Low)">Budget (Low)</option>
                                    <option value="Moderate (Medium)">Moderate (Medium)</option>
                                    <option value="Premium (High)">Premium (High)</option>
                                    <option value="Luxury">Luxury</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Travel Style</label>
                                <select
                                    name="travel_style"
                                    value={formData.travel_style}
                                    onChange={handleChange}
                                >
                                    <option value="">Select travel style</option>
                                    <option value="Relaxation">Relaxation</option>
                                    <option value="Adventure">Adventure</option>
                                    <option value="Family">Family</option>
                                    <option value="Solo">Solo</option>
                                    <option value="Cultural">Cultural</option>
                                    <option value="Nature">Nature</option>
                                    <option value="Luxury">Luxury</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* 04: ADD PREVIOUS TRIPS */}
                    <section className="profile-card">
                        <div className="card-title">
                            <span>04</span>
                            <div>
                                <h2>Previous Trips History</h2>
                                <p>Add and view your past travel experiences</p>
                            </div>
                        </div>

                        {/* Add New Trip Inputs */}
                        <div className="add-trip-box">
                            <h4>+ Add a Previous Trip</h4>
                            <div className="add-trip-grid">
                                <input
                                    type="text"
                                    placeholder="Destination Name (e.g. Munnar)"
                                    value={newTrip.destination}
                                    onChange={(e) => setNewTrip({ ...newTrip, destination: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Year / Dates (e.g. 2025)"
                                    value={newTrip.year}
                                    onChange={(e) => setNewTrip({ ...newTrip, year: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Category (e.g. Hill Station, Beach)"
                                    value={newTrip.category}
                                    onChange={(e) => setNewTrip({ ...newTrip, category: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Notes / Review (Optional)"
                                    value={newTrip.notes}
                                    onChange={(e) => setNewTrip({ ...newTrip, notes: e.target.value })}
                                />
                            </div>
                            <button
                                type="button"
                                className="btn-add-trip"
                                onClick={handleAddTrip}
                            >
                                + Add Trip to Profile
                            </button>
                        </div>

                        {/* Added Trips List */}
                        {formData.previous_trips && formData.previous_trips.length > 0 ? (
                            <div className="trips-history-list" style={{ marginTop: "16px" }}>
                                {formData.previous_trips.map((trip, idx) => (
                                    <div key={trip.id || idx} className="trip-history-card">
                                        <div className="trip-history-info">
                                            <h4>🌴 {trip.destination}</h4>
                                            <p>
                                                📅 Year: <strong>{trip.year}</strong> | Tag: <span className="trip-cat-tag">{trip.category}</span>
                                            </p>
                                            {trip.notes && <p className="trip-notes-text">"{trip.notes}"</p>}
                                        </div>
                                        <button
                                            type="button"
                                            className="btn-remove-trip"
                                            onClick={() => handleRemoveTrip(trip.id || idx)}
                                            title="Remove trip"
                                        >
                                            🗑️ Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-trips-text">No previous trips added yet. Add your past destinations above!</p>
                        )}
                    </section>

                    {/* 05: MY BOOKED TRIPS & ITINERARIES */}
                    <section className="profile-card">
                        <div className="card-title" style={{ marginBottom: "16px" }}>
                            <span>05</span>
                            <div>
                                <h2>My Booked Trips & Itineraries</h2>
                                <p>View your confirmed multi-service bookings and references</p>
                            </div>
                        </div>

                        {userBookings && userBookings.length > 0 ? (
                            <div className="bookings-list-container">
                                {userBookings.map((b) => (
                                    <div key={b.booking_id} className="user-booking-card">
                                        <div className="booking-card-header">
                                            <div className="booking-header-left">
                                                <span className="booking-id-badge">
                                                    Booking #{b.booking_id}
                                                </span>
                                                <h3 className="booking-destination-title">
                                                    📍 {b.destination?.name || "Kerala Trip Itinerary"}
                                                </h3>
                                                {(b.start_date || b.end_date) && (
                                                    <span className="booking-dates-text">
                                                        📅 {b.start_date || "N/A"} to {b.end_date || "N/A"}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="booking-header-right">
                                                <div className="booking-price-tag">
                                                    ₹{parseFloat(b.total_amount || 0).toLocaleString()}
                                                </div>
                                                <span className={`booking-status-pill ${(b.booking_status || "").toLowerCase()}`}>
                                                    {b.booking_status || "Confirmed"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="booking-items-section">
                                            <strong className="booking-items-label">
                                                Included Services ({b.items?.length || 0}):
                                            </strong>
                                            <div className="booking-items-list">
                                                {b.items?.map((item) => (
                                                    <div
                                                        key={item.booking_item_id}
                                                        className="booking-item-row"
                                                    >
                                                        <div className="booking-item-info">
                                                            <span className="booking-item-type-badge">
                                                                {item.service_type}
                                                            </span>
                                                            <span className="booking-item-name">{item.item_name}</span>
                                                        </div>
                                                        <span className="booking-item-price">
                                                            ₹{parseFloat(item.amount || 0).toLocaleString()}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-bookings-box">
                                <p>No trips booked yet.</p>
                                <button
                                    type="button"
                                    onClick={() => navigate("/destinations")}
                                    className="btn-explore-trips"
                                >
                                    Explore & Plan a Trip →
                                </button>
                            </div>
                        )}
                    </section>

                    {/* 06: PASSWORD CHANGING OPTION */}
                    <section className="profile-card">
                        <div className="card-title" style={{ marginBottom: "12px" }}>
                            <span>06</span>
                            <div>
                                <h2>Security & Password</h2>
                                <p>Optionally update your login password</p>
                            </div>
                        </div>

                        {!showPasswordChange ? (
                            <button
                                type="button"
                                className="btn-toggle-password"
                                onClick={() => setShowPasswordChange(true)}
                            >
                                🔒 Change Password
                            </button>
                        ) : (
                            <div className="password-change-box">
                                {passwordMessage && (
                                    <div className={passwordMessage.includes("successfully") ? "profile-message success" : "profile-message error"}>
                                        {passwordMessage}
                                    </div>
                                )}
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Current Password</label>
                                        <input
                                            type="password"
                                            name="current_password"
                                            value={passwordData.current_password}
                                            onChange={handlePasswordChangeInput}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>New Password</label>
                                        <input
                                            type="password"
                                            name="new_password"
                                            value={passwordData.new_password}
                                            onChange={handlePasswordChangeInput}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Confirm New Password</label>
                                        <input
                                            type="password"
                                            name="confirm_password"
                                            value={passwordData.confirm_password}
                                            onChange={handlePasswordChangeInput}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="password-actions">
                                    <button
                                        type="button"
                                        className="btn-cancel-pwd"
                                        onClick={() => setShowPasswordChange(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-submit-pwd"
                                        disabled={updatingPassword}
                                        onClick={handlePasswordSubmit}
                                    >
                                        {updatingPassword ? "Updating..." : "Update Password"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* SAVE PROFILE BUTTON */}
                    <div className="profile-actions">
                        <button
                            type="submit"
                            disabled={saving}
                            className="save-profile-btn"
                        >
                            {saving ? "Saving Changes..." : "Save Profile Changes"}
                        </button>
                    </div>
                </form>
            </main>
    );
}