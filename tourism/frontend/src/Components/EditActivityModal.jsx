import { useState, useEffect } from "react";
import api from "../services/api";
import "../styles/EditHotelModal.css";

export default function EditActivityModal({ activity, isOpen, onClose, onActivityUpdated }) {
    const [activityData, setActivityData] = useState({
        activity_name: "",
        description: "",
        location: "",
        district: "",
        contact_number: "",
        email: "",
        price: "",
        duration: "",
        available_times: "",
        capacity: "",
        instructions: "",
    });

    const [newImages, setNewImages] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (activity) {
            setActivityData({
                activity_name: activity.activity_name || "",
                description: activity.description || "",
                location: activity.location || "",
                district: activity.district || "",
                contact_number: activity.contact_number || "",
                email: activity.email || "",
                price: activity.price || "",
                duration: activity.duration || "",
                available_times: activity.available_times || "",
                capacity: activity.capacity || "",
                instructions: activity.instructions || "",
            });
        }
    }, [activity]);

    if (!isOpen || !activity) return null;

    const handleChange = (e) => {
        setActivityData({
            ...activityData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setNewImages((prev) => [...prev, ...files]);
    };

    const removeNewImage = (indexToRemove) => {
        setNewImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formData = new FormData();
            formData.append("activity_name", activityData.activity_name);
            formData.append("description", activityData.description);
            formData.append("location", activityData.location);
            formData.append("district", activityData.district);
            formData.append("contact_number", activityData.contact_number);
            formData.append("email", activityData.email);
            formData.append("price", activityData.price);
            formData.append("duration", activityData.duration);
            formData.append("available_times", activityData.available_times);
            formData.append("capacity", activityData.capacity);
            formData.append("instructions", activityData.instructions);

            newImages.forEach((img) => {
                formData.append("activity_images", img);
            });

            const response = await api.post(`edit-activity/${activity.activity_id}/`, formData);

            if (response.status === 200) {
                alert("Activity center updated successfully!");
                if (onActivityUpdated) onActivityUpdated(response.data.activity);
                onClose();
            }
        } catch (error) {
            console.error("Error updating activity center:", error);
            alert("Failed to update activity center details.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="edit-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>✏️ Edit Activity Details</h3>
                    <button className="close-modal-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form-body">
                    <div className="modal-form-group">
                        <label>Activity / Park Name <span>*</span></label>
                        <input
                            type="text"
                            name="activity_name"
                            value={activityData.activity_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="modal-two-col">
                        <div className="modal-form-group">
                            <label>Spot / Location <span>*</span></label>
                            <input
                                type="text"
                                name="location"
                                value={activityData.location}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="modal-form-group">
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
                    </div>

                    <div className="modal-two-col">
                        <div className="modal-form-group">
                            <label>Contact Phone <span>*</span></label>
                            <input
                                type="tel"
                                name="contact_number"
                                value={activityData.contact_number}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="modal-form-group">
                            <label>Email Address <span>*</span></label>
                            <input
                                type="email"
                                name="email"
                                value={activityData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="modal-two-col">
                        <div className="modal-form-group">
                            <label>Starting Price (₹)</label>
                            <input
                                type="number"
                                name="price"
                                value={activityData.price}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="modal-form-group">
                            <label>Duration</label>
                            <input
                                type="text"
                                name="duration"
                                value={activityData.duration}
                                onChange={handleChange}
                                placeholder="e.g. 2 Hours, Full Day"
                            />
                        </div>
                    </div>

                    <div className="modal-form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={activityData.description}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>

                    {/* ADD NEW PHOTOS */}
                    <div className="modal-form-group">
                        <label>Add New Photos</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                        />
                        {newImages.length > 0 && (
                            <div className="image-preview-wrapper">
                                <p className="preview-heading">{newImages.length} image(s) selected:</p>
                                <div className="image-preview-grid">
                                    {newImages.map((file, idx) => (
                                        <div key={idx} className="preview-thumb-card">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`New photo preview ${idx + 1}`}
                                            />
                                            <button
                                                type="button"
                                                className="btn-remove-thumb"
                                                onClick={() => removeNewImage(idx)}
                                                title="Remove image"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer-actions">
                        <button type="button" className="btn-modal-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-modal-save" disabled={saving}>
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
