import { useState, useEffect } from "react";
import api from "../services/api";
import MapPicker from "../Components/MapPicker";
import "../styles/EditHotelModal.css";

export default function EditRestaurantModal({ restaurant, isOpen, onClose, onRestaurantUpdated }) {
    const [restaurantData, setRestaurantData] = useState({
        restaurant_name: "",
        description: "",
        address: "",
        district: "",
        location: "",
        contact_number: "",
        email: "",
        cuisine_type: "",
        opening_time: "",
        closing_time: "",
        latitude: "",
        longitude: "",
    });

    const [newImages, setNewImages] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (restaurant) {
            setRestaurantData({
                restaurant_name: restaurant.restaurant_name || "",
                description: restaurant.description || "",
                address: restaurant.address || "",
                district: restaurant.district || "",
                location: restaurant.location || "",
                contact_number: restaurant.contact_number || "",
                email: restaurant.email || "",
                cuisine_type: restaurant.cuisine_type || "",
                opening_time: restaurant.opening_time || "",
                closing_time: restaurant.closing_time || "",
                latitude: restaurant.latitude !== undefined && restaurant.latitude !== null ? restaurant.latitude : "",
                longitude: restaurant.longitude !== undefined && restaurant.longitude !== null ? restaurant.longitude : "",
            });
        }
    }, [restaurant]);

    if (!isOpen || !restaurant) return null;

    const handleChange = (e) => {
        setRestaurantData({
            ...restaurantData,
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

            newImages.forEach((img) => {
                formData.append("restaurant_images", img);
            });

            const response = await api.post(`edit-restaurant/${restaurant.restaurant_id}/`, formData);

            if (response.status === 200) {
                alert("Restaurant details updated successfully!");
                if (onRestaurantUpdated) onRestaurantUpdated(response.data.restaurant);
                onClose();
            }
        } catch (error) {
            console.error("Error updating restaurant:", error);
            alert("Failed to update restaurant details.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="edit-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>✏️ Edit Restaurant Details</h3>
                    <button className="close-modal-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form-body">
                    <div className="modal-form-group">
                        <label>Restaurant Name <span>*</span></label>
                        <input
                            type="text"
                            name="restaurant_name"
                            value={restaurantData.restaurant_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="modal-two-col">
                        <div className="modal-form-group">
                            <label>Cuisine Type <span>*</span></label>
                            <input
                                type="text"
                                name="cuisine_type"
                                value={restaurantData.cuisine_type}
                                onChange={handleChange}
                                placeholder="e.g. South Indian, Seafood, Chinese"
                                required
                            />
                        </div>

                        <div className="modal-form-group">
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

                    <div className="modal-form-group">
                        <label>Location / Area <span>*</span></label>
                        <input
                            type="text"
                            name="location"
                            value={restaurantData.location}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="modal-form-group" style={{ marginBottom: "16px" }}>
                        <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>Update Map Location</span>
                            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "normal" }}>
                                (Drag or click to adjust pinned coordinates)
                            </span>
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
                            height="240px"
                        />
                    </div>

                    <div className="modal-form-group">
                        <label>Full Address <span>*</span></label>
                        <textarea
                            name="address"
                            value={restaurantData.address}
                            onChange={handleChange}
                            rows="2"
                            required
                        />
                    </div>

                    <div className="modal-two-col">
                        <div className="modal-form-group">
                            <label>Contact Phone <span>*</span></label>
                            <input
                                type="tel"
                                name="contact_number"
                                value={restaurantData.contact_number}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="modal-form-group">
                            <label>Email Address <span>*</span></label>
                            <input
                                type="email"
                                name="email"
                                value={restaurantData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="modal-two-col">
                        <div className="modal-form-group">
                            <label>Opening Time <span>*</span></label>
                            <input
                                type="time"
                                name="opening_time"
                                value={restaurantData.opening_time}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="modal-form-group">
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

                    <div className="modal-form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={restaurantData.description}
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
