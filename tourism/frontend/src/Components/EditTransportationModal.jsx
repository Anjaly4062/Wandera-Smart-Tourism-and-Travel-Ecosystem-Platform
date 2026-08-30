import { useState, useEffect } from "react";
import api from "../services/api";
import MapPicker from "../Components/MapPicker";
import "../styles/EditHotelModal.css";

export default function EditTransportationModal({ transportation, isOpen, onClose, onTransportationUpdated }) {
    const [transportationData, setTransportationData] = useState({
        service_name: "",
        vehicle_type: "",
        description: "",
        starting_location: "",
        service_area: "",
        contact_number: "",
        email: "",
        price_fare: "",
        availability_status: "Available",
        latitude: "",
        longitude: "",
    });

    const [newImages, setNewImages] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (transportation) {
            setTransportationData({
                service_name: transportation.service_name || "",
                vehicle_type: transportation.vehicle_type || "",
                description: transportation.description || "",
                starting_location: transportation.starting_location || "",
                service_area: transportation.service_area || "",
                contact_number: transportation.contact_number || "",
                email: transportation.email || "",
                price_fare: transportation.price_fare || "",
                availability_status: transportation.availability_status || "Available",
                latitude: transportation.latitude !== undefined && transportation.latitude !== null ? transportation.latitude : "",
                longitude: transportation.longitude !== undefined && transportation.longitude !== null ? transportation.longitude : "",
            });
        }
    }, [transportation]);

    if (!isOpen || !transportation) return null;

    const handleChange = (e) => {
        setTransportationData({
            ...transportationData,
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
            formData.append("service_name", transportationData.service_name);
            formData.append("vehicle_type", transportationData.vehicle_type);
            formData.append("description", transportationData.description);
            formData.append("starting_location", transportationData.starting_location);
            formData.append("service_area", transportationData.service_area);
            formData.append("contact_number", transportationData.contact_number);
            formData.append("email", transportationData.email);
            formData.append("price_fare", transportationData.price_fare);
            formData.append("availability_status", transportationData.availability_status);
            if (transportationData.latitude !== null && transportationData.latitude !== undefined && transportationData.latitude !== "") {
                formData.append("latitude", transportationData.latitude);
            }
            if (transportationData.longitude !== null && transportationData.longitude !== undefined && transportationData.longitude !== "") {
                formData.append("longitude", transportationData.longitude);
            }

            newImages.forEach((img) => {
                formData.append("transportation_images", img);
            });

            const response = await api.post(`edit-transportation/${transportation.transportation_id}/`, formData);

            if (response.status === 200) {
                alert("Transportation service updated successfully!");
                if (onTransportationUpdated) onTransportationUpdated(response.data.transportation);
                onClose();
            }
        } catch (error) {
            console.error("Error updating transportation service:", error);
            alert("Failed to update transportation service details.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="edit-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>✏️ Edit Transportation Details</h3>
                    <button className="close-modal-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form-body">
                    <div className="modal-form-group">
                        <label>Agency / Service Name <span>*</span></label>
                        <input
                            type="text"
                            name="service_name"
                            value={transportationData.service_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="modal-two-col">
                        <div className="modal-form-group">
                            <label>Primary Vehicle Type <span>*</span></label>
                            <input
                                type="text"
                                name="vehicle_type"
                                value={transportationData.vehicle_type}
                                onChange={handleChange}
                                placeholder="e.g. Taxi, SUV, Tempo Traveller"
                                required
                            />
                        </div>

                        <div className="modal-form-group">
                            <label>Starting Location / Main Hub <span>*</span></label>
                            <input
                                type="text"
                                name="starting_location"
                                value={transportationData.starting_location}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="modal-form-group" style={{ marginBottom: "16px" }}>
                        <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>Update Map Location</span>
                            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "normal" }}>
                                (Drag or click to adjust pinned coordinates)
                            </span>
                        </label>
                        <MapPicker
                            latitude={transportationData.latitude}
                            longitude={transportationData.longitude}
                            onLocationSelect={({ latitude, longitude }) => {
                                setTransportationData((prev) => ({
                                    ...prev,
                                    latitude: latitude !== null ? latitude : "",
                                    longitude: longitude !== null ? longitude : "",
                                }));
                            }}
                            height="240px"
                        />
                    </div>

                    <div className="modal-form-group">
                        <label>Service Coverage Area <span>*</span></label>
                        <input
                            type="text"
                            name="service_area"
                            value={transportationData.service_area}
                            onChange={handleChange}
                            placeholder="e.g. All Kerala, Munnar & Surrounding"
                            required
                        />
                    </div>

                    <div className="modal-two-col">
                        <div className="modal-form-group">
                            <label>Contact Phone <span>*</span></label>
                            <input
                                type="tel"
                                name="contact_number"
                                value={transportationData.contact_number}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="modal-form-group">
                            <label>Email Address <span>*</span></label>
                            <input
                                type="email"
                                name="email"
                                value={transportationData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="modal-two-col">
                        <div className="modal-form-group">
                            <label>Base Price / Fare (₹)</label>
                            <input
                                type="number"
                                name="price_fare"
                                value={transportationData.price_fare}
                                onChange={handleChange}
                                placeholder="Starting rate"
                            />
                        </div>

                        <div className="modal-form-group">
                            <label>Availability Status</label>
                            <select
                                name="availability_status"
                                value={transportationData.availability_status}
                                onChange={handleChange}
                            >
                                <option value="Available">Available</option>
                                <option value="Busy">Busy</option>
                                <option value="Unavailable">Unavailable</option>
                            </select>
                        </div>
                    </div>

                    <div className="modal-form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={transportationData.description}
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
