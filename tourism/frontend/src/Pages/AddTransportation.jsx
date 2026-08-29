import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ServiceProviderNavbar from "../Components/ServiceProviderNavbar";
import "../styles/AddTransportation.css";
import api from "../services/api";

export default function AddTransportation() {
    const navigate = useNavigate();

    const [transData, setTransData] = useState({
        service_name: "",
        description: "",
        address: "",
        district: "",
        starting_location: "",
        service_area: "",
        contact_number: "",
        email: "",
    });

    const [transImages, setTransImages] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setTransData({
            ...transData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImages = (e) => {
        const files = Array.from(e.target.files);
        setTransImages((prev) => [...prev, ...files]);
    };

    const removeImage = (index) => {
        setTransImages((prev) => prev.filter((_, idx) => idx !== index));
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
            formData.append("service_name", transData.service_name);
            formData.append("description", transData.description);
            formData.append("address", transData.address);
            formData.append("district", transData.district);
            formData.append("starting_location", transData.starting_location);
            formData.append("service_area", transData.service_area);
            formData.append("contact_number", transData.contact_number);
            formData.append("email", transData.email);

            transImages.forEach((image) => {
                formData.append("transportation_images", image);
            });

            const response = await api.post("add-transportation/", formData);

            if (response.status === 201 || response.status === 200) {
                alert("Transportation Agency details saved successfully!");
                navigate("/provider/my-services");
            }
        } catch (error) {
            console.error("Error saving transportation agency:", error);
            alert(error.response?.data?.error || "Failed to save transportation service details.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="service-provider-layout">
            <ServiceProviderNavbar />

            <main className="trans-page-content">
                <div className="trans-page-header">
                    <div>
                        <h2>Add Transportation Agency</h2>
                        <p>
                            Dashboard <span>›</span> Add Service <span>›</span> Transportation Agency Details
                        </p>
                    </div>
                    <button type="button" className="top-back-btn" onClick={() => navigate(-1)}>
                        ← Back
                    </button>
                </div>

                <form className="trans-form-card" onSubmit={handleSubmit}>
                    <div className="trans-form-header">
                        <div className="trans-icon">🚍</div>
                        <div>
                            <h1>Transportation Agency Information</h1>
                            <p>Add the main details of your travel agency or transport service</p>
                        </div>
                    </div>

                    <div className="trans-divider"></div>

                    {/* BASIC DETAILS */}
                    <div className="trans-section">
                        <h3>Agency Details</h3>

                        <div className="trans-form-group">
                            <label>Agency / Service Name <span>*</span></label>
                            <input
                                type="text"
                                name="service_name"
                                value={transData.service_name}
                                onChange={handleChange}
                                placeholder="e.g. Royal Kerala Travels & Cabs"
                                required
                            />
                        </div>

                        <div className="trans-two-column">
                            <div className="trans-form-group">
                                <label>District <span>*</span></label>
                                <select
                                    name="district"
                                    value={transData.district}
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

                            <div className="trans-form-group">
                                <label>Starting Location / Main Hub <span>*</span></label>
                                <input
                                    type="text"
                                    name="starting_location"
                                    value={transData.starting_location}
                                    onChange={handleChange}
                                    placeholder="e.g. Cochin International Airport / Ernakulam South"
                                    required
                                />
                            </div>
                        </div>

                        <div className="trans-form-group">
                            <label>Service Area / Destinations Covered <span>*</span></label>
                            <input
                                type="text"
                                name="service_area"
                                value={transData.service_area}
                                onChange={handleChange}
                                placeholder="e.g. All Kerala, Munnar, Alleppey, Wayanad"
                                required
                            />
                        </div>

                        <div className="trans-form-group">
                            <label>Address <span>*</span></label>
                            <textarea
                                name="address"
                                value={transData.address}
                                onChange={handleChange}
                                placeholder="Enter office/hub address"
                                rows="3"
                                required
                            />
                        </div>

                        <div className="trans-form-group">
                            <label>Agency Description <span>*</span></label>
                            <textarea
                                name="description"
                                value={transData.description}
                                onChange={handleChange}
                                placeholder="Describe your transport agency, fleet features, driver expertise..."
                                rows="4"
                                required
                            />
                        </div>
                    </div>

                    {/* CONTACT DETAILS */}
                    <div className="trans-section">
                        <h3>Contact Information</h3>

                        <div className="trans-two-column">
                            <div className="trans-form-group">
                                <label>Contact Phone <span>*</span></label>
                                <input
                                    type="tel"
                                    name="contact_number"
                                    value={transData.contact_number}
                                    onChange={handleChange}
                                    placeholder="Phone number for taxi/vehicle bookings"
                                    required
                                />
                            </div>

                            <div className="trans-form-group">
                                <label>Email Address <span>*</span></label>
                                <input
                                    type="email"
                                    name="email"
                                    value={transData.email}
                                    onChange={handleChange}
                                    placeholder="agency@example.com"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* AGENCY PHOTOS */}
                    <div className="trans-section">
                        <h3>Agency </h3>
                        <p className="section-description">Upload photos of your agency office or vehicles.</p>

                        <div className="image-upload-box">
                            <div className="upload-icon">📷</div>
                            <p>Upload agency photos</p>
                            <span>Select multiple images</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImages}
                            />
                        </div>

                        {transImages.length > 0 && (
                            <div className="image-preview-wrapper">
                                <p className="preview-heading">{transImages.length} image(s) selected:</p>
                                <div className="image-preview-grid">
                                    {transImages.map((file, idx) => (
                                        <div key={idx} className="preview-thumb-card">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Agency preview ${idx + 1}`}
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
                    <div className="trans-form-actions">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() => navigate("/provider-home")}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="save-trans-button" disabled={submitting}>
                            {submitting ? "Saving..." : "Save Agency Details"} <span>→</span>
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
