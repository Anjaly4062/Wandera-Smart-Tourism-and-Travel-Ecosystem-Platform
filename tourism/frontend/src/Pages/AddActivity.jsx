import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ServiceProviderNavbar from "../Components/ServiceProviderNavbar";
import MapPicker from "../Components/MapPicker";
import "../styles/AddActivity.css";
import api from "../services/api";

export default function AddActivity() {
    const navigate = useNavigate();

    const [activityData, setActivityData] = useState({
        activity_name: "",
        description: "",
        location: "",
        district: "",
        contact_number: "",
        email: "",
        latitude: "",
        longitude: "",
    });

    const [activityImages, setActivityImages] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setActivityData({
            ...activityData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImages = (e) => {
        const files = Array.from(e.target.files);
        setActivityImages((prev) => [...prev, ...files]);
    };

    const removeImage = (index) => {
        setActivityImages((prev) => prev.filter((_, idx) => idx !== index));
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
            formData.append("activity_name", activityData.activity_name);
            formData.append("description", activityData.description);
            formData.append("location", activityData.location);
            formData.append("district", activityData.district);
            formData.append("contact_number", activityData.contact_number);
            formData.append("email", activityData.email);
            if (activityData.latitude !== null && activityData.latitude !== undefined && activityData.latitude !== "") {
                formData.append("latitude", activityData.latitude);
            }
            if (activityData.longitude !== null && activityData.longitude !== undefined && activityData.longitude !== "") {
                formData.append("longitude", activityData.longitude);
            }

            activityImages.forEach((image) => {
                formData.append("activity_images", image);
            });

            const response = await api.post("add-activity/", formData);

            if (response.status === 201 || response.status === 200) {
                alert("Activity Center details saved successfully!");
                navigate("/provider/my-services");
            }
        } catch (error) {
            console.error("Error saving activity center:", error);
            alert(error.response?.data?.error || "Failed to save activity service details.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="service-provider-layout">
            <ServiceProviderNavbar />

            <main className="activity-page-content">
                <div className="activity-page-header">
                    <div>
                        <h2>Add Activity Center</h2>
                        <p>
                            Dashboard <span>›</span> Add Service <span>›</span> Activity Center Details
                        </p>
                    </div>
                    <button type="button" className="top-back-btn" onClick={() => navigate(-1)}>
                        ← Back
                    </button>
                </div>

                <form className="activity-form-card" onSubmit={handleSubmit}>
                    <div className="activity-form-header">
                        <div className="activity-icon">🧗</div>
                        <div>
                            <h1>Activity Center Information</h1>
                            <p>Register your adventure sports club, trekking agency or tour center</p>
                        </div>
                    </div>

                    <div className="activity-divider"></div>

                    {/* BASIC DETAILS */}
                    <div className="activity-section">
                        <h3>Center Details</h3>

                        <div className="activity-form-group">
                            <label>Center / Agency Name <span>*</span></label>
                            <input
                                type="text"
                                name="activity_name"
                                value={activityData.activity_name}
                                onChange={handleChange}
                                placeholder="e.g. Wayanad Adventure Sports & Zipline Park"
                                required
                            />
                        </div>

                        <div className="activity-two-column">
                            <div className="activity-form-group">
                                <label>District <span>*</span></label>
                                <select
                                    name="district"
                                    value={activityData.district}
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

                            <div className="activity-form-group">
                                <label>Location / Spot <span>*</span></label>
                                <input
                                    type="text"
                                    name="location"
                                    value={activityData.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Banasura Sagar Dam, Meenmutty Waterfalls"
                                    required
                                />
                            </div>
                        </div>

                        <div className="activity-form-group">
                            <label>
                                Pin Activity Spot on Map <span style={{ color: "#64748b", fontWeight: "normal", fontSize: "12px" }}>(Optional)</span>
                            </label>
                            <MapPicker
                                latitude={activityData.latitude}
                                longitude={activityData.longitude}
                                onLocationSelect={({ latitude, longitude }) => {
                                    setActivityData((prev) => ({
                                        ...prev,
                                        latitude: latitude !== null ? latitude : "",
                                        longitude: longitude !== null ? longitude : "",
                                    }));
                                }}
                                height="260px"
                            />
                        </div>

                        <div className="activity-form-group">
                            <label>Center Description <span>*</span></label>
                            <textarea
                                name="description"
                                value={activityData.description}
                                onChange={handleChange}
                                placeholder="Describe your activity center, equipment safety, certified instructors..."
                                rows="4"
                                required
                            />
                        </div>
                    </div>

                    {/* CONTACT DETAILS */}
                    <div className="activity-section">
                        <h3>Contact Information</h3>

                        <div className="activity-two-column">
                            <div className="activity-form-group">
                                <label>Contact Number <span>*</span></label>
                                <input
                                    type="tel"
                                    name="contact_number"
                                    value={activityData.contact_number}
                                    onChange={handleChange}
                                    placeholder="Phone number for bookings/inquiries"
                                    required
                                />
                            </div>

                            <div className="activity-form-group">
                                <label>Email Address <span>*</span></label>
                                <input
                                    type="email"
                                    name="email"
                                    value={activityData.email}
                                    onChange={handleChange}
                                    placeholder="activity@example.com"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* PHOTOS */}
                    <div className="activity-section">
                        <h3>Center Photos</h3>
                        <p className="section-description">Upload photos of your park, equipment, and surrounding nature.</p>

                        <div className="image-upload-box">
                            <div className="upload-icon">📷</div>
                            <p>Upload center photos</p>
                            <span>Select multiple images</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImages}
                            />
                        </div>

                        {activityImages.length > 0 && (
                            <div className="image-preview-wrapper">
                                <p className="preview-heading">{activityImages.length} image(s) selected:</p>
                                <div className="image-preview-grid">
                                    {activityImages.map((file, idx) => (
                                        <div key={idx} className="preview-thumb-card">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Center preview ${idx + 1}`}
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

                    {/* ACTIONS */}
                    <div className="activity-form-actions">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() => navigate("/provider-home")}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="save-activity-button" disabled={submitting}>
                            {submitting ? "Saving..." : "Save Center Details"} <span>→</span>
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
