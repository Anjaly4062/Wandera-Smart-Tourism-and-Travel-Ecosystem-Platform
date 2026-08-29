import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ServiceProviderNavbar from "../Components/ServiceProviderNavbar";
import "../styles/AddActivityItem.css";
import api from "../services/api";

export default function AddActivityItem() {
    const navigate = useNavigate();
    const location = useLocation();

    const [activityCenter, setActivityCenter] = useState(null);
    const [selectedActivityId, setSelectedActivityId] = useState(location.state?.activity_id || "");
    const [loadingCenter, setLoadingCenter] = useState(true);

    const [itemData, setItemData] = useState({
        activity_title: "",
        category: "Adventure Sports",
        description: "",
        price: "",
        duration: "2 Hours",
        available_times: "Daily 9:00 AM - 5:00 PM",
        capacity: "10",
        instructions: "",
    });

    const [itemImages, setItemImages] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchProviderActivity = async () => {
            const providerId = localStorage.getItem("provider_id");
            if (!providerId) {
                setLoadingCenter(false);
                return;
            }

            try {
                const response = await api.get(`provider-info/${providerId}/`);
                if (response.data?.provider?.activity) {
                    const act = response.data.provider.activity;
                    setActivityCenter(act);
                    if (!selectedActivityId) {
                        setSelectedActivityId(act.activity_id);
                    }
                }
            } catch (error) {
                console.error("Error fetching provider activity center:", error);
            } finally {
                setLoadingCenter(false);
            }
        };

        fetchProviderActivity();
    }, [selectedActivityId]);

    const handleChange = (e) => {
        setItemData({
            ...itemData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImages = (e) => {
        const files = Array.from(e.target.files);
        setItemImages((prev) => [...prev, ...files]);
    };

    const removeImage = (index) => {
        setItemImages((prev) => prev.filter((_, idx) => idx !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (!selectedActivityId) {
                alert("No Activity Center found. Please create your activity center details first.");
                navigate("/provider/add-activity");
                return;
            }

            const formData = new FormData();
            formData.append("activity_id", selectedActivityId);
            formData.append("activity_title", itemData.activity_title);
            formData.append("category", itemData.category);
            formData.append("description", itemData.description);
            formData.append("price", itemData.price);
            formData.append("duration", itemData.duration);
            formData.append("available_times", itemData.available_times);
            formData.append("capacity", itemData.capacity);
            formData.append("instructions", itemData.instructions);

            itemImages.forEach((image) => {
                formData.append("activity_item_images", image);
            });

            const response = await api.post("add-activity-item/", formData);

            if (response.status === 201 || response.status === 200) {
                alert("Activity package added successfully!");
                navigate("/provider/my-services");
            }
        } catch (error) {
            console.error("Error adding activity item:", error);
            alert(error.response?.data?.error || "Failed to add activity item.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="service-provider-layout">
            <ServiceProviderNavbar />

            <main className="actitem-page-content">
                <div className="actitem-page-header">
                    <div>
                        <h2>Add Activity / Experience Package</h2>
                        <p>
                            Dashboard <span>›</span> My Services <span>›</span> Add Activity
                        </p>
                    </div>
                    <button type="button" className="top-back-btn" onClick={() => navigate(-1)}>
                        ← Back
                    </button>
                </div>

                <form className="actitem-form-card" onSubmit={handleSubmit}>
                    <div className="actitem-form-header">
                        <div className="actitem-icon">🧗</div>
                        <div>
                            <h1>Activity Package Information</h1>
                            <p>Add a new activity experience to your registered center</p>
                        </div>
                    </div>

                    <div className="actitem-divider"></div>

                    {/* CENTER SELECTION */}
                    <div className="actitem-section">
                        <h3>Connected Activity Center</h3>
                        <p className="section-description">
                            Select or verify the activity center this package belongs to.
                        </p>

                        <div className="actitem-form-group">
                            <label>Activity Center <span>*</span></label>
                            {loadingCenter ? (
                                <p style={{ fontSize: "11px", color: "#64748b" }}>Loading center details...</p>
                            ) : activityCenter ? (
                                <select
                                    value={selectedActivityId}
                                    onChange={(e) => setSelectedActivityId(e.target.value)}
                                    required
                                >
                                    <option value={activityCenter.activity_id}>
                                        {activityCenter.activity_name} ({activityCenter.district || activityCenter.location})
                                    </option>
                                </select>
                            ) : (
                                <div style={{ background: "#ecfdf5", padding: "12px", border: "1px solid #d1fae5", borderRadius: "8px", color: "#047857", fontSize: "12px" }}>
                                    <p style={{ marginBottom: "8px" }}>⚠️ No activity center registered yet under your account.</p>
                                    <button
                                        type="button"
                                        style={{ padding: "6px 14px", background: "#059669", color: "white", border: "none", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}
                                        onClick={() => navigate("/provider/add-activity")}
                                    >
                                        + Add Activity Center First
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* DETAILS */}
                    <div className="actitem-section">
                        <h3>Activity Specifications</h3>

                        <div className="actitem-form-group">
                            <label>Activity Title / Package Name <span>*</span></label>
                            <input
                                type="text"
                                name="activity_title"
                                value={itemData.activity_title}
                                onChange={handleChange}
                                placeholder="e.g. Zipline Adventure, Kayaking Safari, Peak Trekking"
                                required
                            />
                        </div>

                        <div className="actitem-two-column">
                            <div className="actitem-form-group">
                                <label>Category / Type <span>*</span></label>
                                <select
                                    name="category"
                                    value={itemData.category}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Adventure Sports">Adventure Sports</option>
                                    <option value="Water Sports / Boating">Water Sports / Boating</option>
                                    <option value="Trekking & Hiking">Trekking & Hiking</option>
                                    <option value="Camping & Bonfire">Camping & Bonfire</option>
                                    <option value="Cultural / Heritage Tour">Cultural & Heritage Tour</option>
                                    <option value="Wildlife Safari">Wildlife Safari</option>
                                </select>
                            </div>

                            <div className="actitem-form-group">
                                <label>Price per Person (₹) <span>*</span></label>
                                <input
                                    type="number"
                                    name="price"
                                    value={itemData.price}
                                    onChange={handleChange}
                                    placeholder="e.g. 750"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>

                        <div className="actitem-two-column">
                            <div className="actitem-form-group">
                                <label>Duration <span>*</span></label>
                                <input
                                    type="text"
                                    name="duration"
                                    value={itemData.duration}
                                    onChange={handleChange}
                                    placeholder="e.g. 2 Hours, Half Day"
                                    required
                                />
                            </div>

                            <div className="actitem-form-group">
                                <label>Max Capacity per Session <span>*</span></label>
                                <input
                                    type="number"
                                    name="capacity"
                                    value={itemData.capacity}
                                    onChange={handleChange}
                                    placeholder="Max participants"
                                    min="1"
                                    required
                                />
                            </div>
                        </div>

                        <div className="actitem-form-group">
                            <label>Schedule / Available Times <span>*</span></label>
                            <input
                                type="text"
                                name="available_times"
                                value={itemData.available_times}
                                onChange={handleChange}
                                placeholder="e.g. Daily 9:00 AM - 5:00 PM"
                                required
                            />
                        </div>

                        <div className="actitem-form-group">
                            <label>Activity Description <span>*</span></label>
                            <textarea
                                name="description"
                                value={itemData.description}
                                onChange={handleChange}
                                placeholder="Describe the activity, safety harness provided, sights seen..."
                                rows="4"
                                required
                            />
                        </div>

                        <div className="actitem-form-group">
                            <label>Instructions & Safety Requirements</label>
                            <textarea
                                name="instructions"
                                value={itemData.instructions}
                                onChange={handleChange}
                                placeholder="e.g. Wear sports shoes, Minimum age 10 years, Bring extra towel..."
                                rows="3"
                            />
                        </div>
                    </div>

                    {/* PHOTOS */}
                    <div className="actitem-section">
                        <h3>Activity Photos</h3>
                        <p className="section-description">Upload action photos of tourists experiencing this activity.</p>

                        <div className="image-upload-box">
                            <div className="upload-icon">📷</div>
                            <p>Upload activity photos</p>
                            <span>Select multiple images</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImages}
                            />
                        </div>

                        {itemImages.length > 0 && (
                            <div className="image-preview-wrapper">
                                <p className="preview-heading">{itemImages.length} image(s) selected:</p>
                                <div className="image-preview-grid">
                                    {itemImages.map((file, idx) => (
                                        <div key={idx} className="preview-thumb-card">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Activity preview ${idx + 1}`}
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
                    <div className="actitem-form-actions">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() => navigate("/provider/my-services")}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="save-actitem-button" disabled={submitting}>
                            {submitting ? "Saving..." : "Save Activity Package"} <span>→</span>
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
