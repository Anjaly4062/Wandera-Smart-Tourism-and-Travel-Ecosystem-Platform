import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ServiceProviderNavbar from "../Components/ServiceProviderNavbar";
import MapPicker from "../Components/MapPicker";
import "../styles/AddRestaurant.css";
import api from "../services/api";

export default function AddRestaurant() {
    const navigate = useNavigate();

    const [restaurantData, setRestaurantData] = useState({
        restaurant_name: "",
        description: "",
        address: "",
        district: "",
        location: "",
        contact_number: "",
        email: "",
        cuisine_type: "",
        opening_time: "09:00",
        closing_time: "22:00",
        latitude: "",
        longitude: "",
    });

    const [restaurantImages, setRestaurantImages] = useState([]);
    const [facilities, setFacilities] = useState([]);
    const [facilityInput, setFacilityInput] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setRestaurantData({
            ...restaurantData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImages = (e) => {
        const files = Array.from(e.target.files);
        setRestaurantImages((prev) => [...prev, ...files]);
    };

    const removeImage = (index) => {
        setRestaurantImages((prev) => prev.filter((_, idx) => idx !== index));
    };

    const addFacility = () => {
        const fac = facilityInput.trim();
        if (!fac) return;
        if (facilities.includes(fac)) return;
        setFacilities([...facilities, fac]);
        setFacilityInput("");
    };

    const removeFacility = (index) => {
        setFacilities(facilities.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const providerId = localStorage.getItem("provider_id");
            if (!providerId) {
                alert("Provider ID not found. Please login again.");
                return;
            }

            const formData = new FormData();
            formData.append("provider_id", providerId);
            formData.append("restaurant_name", restaurantData.restaurant_name);
            formData.append("description", restaurantData.description);
            formData.append("address", restaurantData.address);
            formData.append("district", restaurantData.district);
            formData.append("location", restaurantData.location);
            formData.append("contact_number", restaurantData.contact_number);
            formData.append("email", restaurantData.email);
            formData.append("cuisine_type", restaurantData.cuisine_type);
            formData.append("opening_time", restaurantData.opening_time);
            formData.append("closing_time", restaurantData.closing_time);
            if (restaurantData.latitude !== null && restaurantData.latitude !== undefined && restaurantData.latitude !== "") {
                formData.append("latitude", restaurantData.latitude);
            }
            if (restaurantData.longitude !== null && restaurantData.longitude !== undefined && restaurantData.longitude !== "") {
                formData.append("longitude", restaurantData.longitude);
            }
            formData.append("facilities", JSON.stringify(facilities));

            restaurantImages.forEach((image) => {
                formData.append("restaurant_images", image);
            });

            const response = await api.post("add-restaurant/", formData);

            if (response.status === 201) {
                alert("Restaurant service details saved successfully!");
                navigate("/provider/my-services");
            }
        } catch (error) {
            console.error("Error saving restaurant:", error);
            alert(error.response?.data?.error || "Failed to save restaurant details.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="service-provider-layout">
            <ServiceProviderNavbar />

            <main className="restaurant-page-content">
                <div className="restaurant-page-header">
                    <div>
                        <h2>Add Restaurant Service</h2>
                        <p>
                            Dashboard <span>›</span> Add Service <span>›</span> Restaurant Details
                        </p>
                    </div>
                    <button type="button" className="top-back-btn" onClick={() => navigate(-1)}>
                        ← Back
                    </button>
                </div>

                <form className="restaurant-form-card" onSubmit={handleSubmit}>
                    <div className="restaurant-form-header">
                        <div className="restaurant-icon">🍽️</div>
                        <div>
                            <h1>Restaurant Information</h1>
                            <p>Add the details of your restaurant and dining service</p>
                        </div>
                    </div>

                    <div className="restaurant-divider"></div>

                    {/* BASIC DETAILS */}
                    <div className="restaurant-section">
                        <h3>Basic Restaurant Details</h3>
                        <p className="section-description">Provide name, cuisine, description, and location.</p>

                        <div className="restaurant-form-group">
                            <label>Restaurant Name <span>*</span></label>
                            <input
                                type="text"
                                name="restaurant_name"
                                value={restaurantData.restaurant_name}
                                onChange={handleChange}
                                placeholder="Enter restaurant name"
                                required
                            />
                        </div>

                        <div className="restaurant-two-column">
                            <div className="restaurant-form-group">
                                <label>Cuisine Type <span>*</span></label>
                                <input
                                    type="text"
                                    name="cuisine_type"
                                    value={restaurantData.cuisine_type}
                                    onChange={handleChange}
                                    placeholder="e.g. Kerala Traditional, Chinese, Multi-Cuisine"
                                    required
                                />
                            </div>

                            <div className="restaurant-form-group">
                                <label>District <span>*</span></label>
                                <select
                                    name="district"
                                    value={restaurantData.district}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select district</option>
                                    <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                                    <option value="Kollam">Kollam</option>
                                    <option value="Pathanamthitta">Pathanamthitta</option>
                                    <option value="Alappuzha">Alappuzha</option>
                                    <option value="Kottayam">Kottayam</option>
                                    <option value="Idukki">Idukki</option>
                                    <option value="Ernakulam">Ernakulam</option>
                                    <option value="Thrissur">Thrissur</option>
                                    <option value="Palakkad">Palakkad</option>
                                    <option value="Malappuram">Malappuram</option>
                                    <option value="Kozhikode">Kozhikode</option>
                                    <option value="Wayanad">Wayanad</option>
                                    <option value="Kannur">Kannur</option>
                                    <option value="Kasaragod">Kasaragod</option>
                                </select>
                            </div>
                        </div>

                        <div className="restaurant-form-group">
                            <label>Location / Landmark <span>*</span></label>
                            <input
                                type="text"
                                name="location"
                                value={restaurantData.location}
                                onChange={handleChange}
                                placeholder="Landmark or Google Maps location"
                                required
                            />
                        </div>

                        <div className="restaurant-form-group">
                            <label>
                                Pin Location on Map <span style={{ color: "#64748b", fontWeight: "normal", fontSize: "12px" }}>(Optional)</span>
                            </label>
                            <MapPicker
                                latitude={restaurantData.latitude}
                                longitude={restaurantData.longitude}
                                onLocationSelect={({ latitude, longitude }) => {
                                    setRestaurantData((prev) => ({
                                        ...prev,
                                        latitude: latitude !== null ? latitude : "",
                                        longitude: longitude !== null ? longitude : "",
                                    }));
                                }}
                                height="260px"
                            />
                        </div>

                        <div className="restaurant-form-group">
                            <label>Address <span>*</span></label>
                            <textarea
                                name="address"
                                value={restaurantData.address}
                                onChange={handleChange}
                                placeholder="Enter full restaurant address"
                                rows="3"
                                required
                            />
                        </div>

                        <div className="restaurant-form-group">
                            <label>Description <span>*</span></label>
                            <textarea
                                name="description"
                                value={restaurantData.description}
                                onChange={handleChange}
                                placeholder="Describe your restaurant, specialties, ambiance..."
                                rows="4"
                                required
                            />
                        </div>
                    </div>

                    {/* CONTACT & TIMINGS */}
                    <div className="restaurant-section">
                        <h3>Contact Information & Timings</h3>

                        <div className="restaurant-two-column">
                            <div className="restaurant-form-group">
                                <label>Contact Number <span>*</span></label>
                                <input
                                    type="tel"
                                    name="contact_number"
                                    value={restaurantData.contact_number}
                                    onChange={handleChange}
                                    placeholder="Contact phone number"
                                    required
                                />
                            </div>

                            <div className="restaurant-form-group">
                                <label>Email <span>*</span></label>
                                <input
                                    type="email"
                                    name="email"
                                    value={restaurantData.email}
                                    onChange={handleChange}
                                    placeholder="restaurant@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="restaurant-two-column">
                            <div className="restaurant-form-group">
                                <label>Opening Time <span>*</span></label>
                                <input
                                    type="time"
                                    name="opening_time"
                                    value={restaurantData.opening_time}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="restaurant-form-group">
                                <label>Closing Time <span>*</span></label>
                                <input
                                    type="time"
                                    name="closing_time"
                                    value={restaurantData.closing_time}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* FACILITIES */}
                    <div className="restaurant-section">
                        <h3>Facilities & Amenities</h3>

                        <div className="facility-input-row">
                            <input
                                type="text"
                                value={facilityInput}
                                onChange={(e) => setFacilityInput(e.target.value)}
                                placeholder="e.g. AC Dining, Outdoor Seating, Parking, Wi-Fi"
                            />
                            <button type="button" onClick={addFacility} className="add-facility-button">
                                + Add
                            </button>
                        </div>

                        {facilities.length > 0 && (
                            <div className="facility-list">
                                {facilities.map((fac, idx) => (
                                    <div key={idx} className="facility-tag">
                                        {fac}
                                        <button type="button" onClick={() => removeFacility(idx)}>×</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* PHOTOS */}
                    <div className="restaurant-section">
                        <h3>Restaurant Photos</h3>
                        <p className="section-description">Upload photos of your dining area, dishes, or exterior.</p>

                        <div className="image-upload-box">
                            <div className="upload-icon">📷</div>
                            <p>Upload restaurant photos</p>
                            <span>Select multiple images</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImages}
                            />
                        </div>

                        {restaurantImages.length > 0 && (
                            <div className="image-preview-wrapper">
                                <p className="preview-heading">{restaurantImages.length} image(s) selected:</p>
                                <div className="image-preview-grid">
                                    {restaurantImages.map((file, idx) => (
                                        <div key={idx} className="preview-thumb-card">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Restaurant preview ${idx + 1}`}
                                            />
                                            <button
                                                type="button"
                                                className="btn-remove-thumb"
                                                onClick={() => removeImage(idx)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SUBMIT */}
                    <div className="restaurant-form-actions">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() => navigate("/provider-home")}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="save-restaurant-button" disabled={submitting}>
                            {submitting ? "Saving..." : "Save Restaurant"} <span>→</span>
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
