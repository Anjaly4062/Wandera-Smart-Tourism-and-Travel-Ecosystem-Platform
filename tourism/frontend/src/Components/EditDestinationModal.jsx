import { useState, useEffect } from "react";
import api from "../services/api";
import MapPicker from "./MapPicker";
import "../styles/EditHotelModal.css";

export default function EditDestinationModal({ destination, isOpen, onClose, onDestinationUpdated }) {
    const districts = [
        "Thiruvananthapuram",
        "Kollam",
        "Pathanamthitta",
        "Alappuzha",
        "Kottayam",
        "Idukki",
        "Ernakulam",
        "Thrissur",
        "Palakkad",
        "Malappuram",
        "Kozhikode",
        "Wayanad",
        "Kannur",
        "Kasaragod",
    ];

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        district: "",
        location: "",
        description: "",
        status: "Active",
        latitude: "",
        longitude: "",
    });

    const [newImage, setNewImage] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (destination) {
            setFormData({
                name: destination.name || "",
                category: destination.category || "",
                district: destination.district || "",
                location: destination.location || destination.area || "",
                description: destination.description || "",
                status: destination.status || "Active",
                latitude: destination.latitude !== undefined && destination.latitude !== null ? destination.latitude : "",
                longitude: destination.longitude !== undefined && destination.longitude !== null ? destination.longitude : "",
            });
            setNewImage(null);
        }
    }, [destination]);

    if (!isOpen || !destination) return null;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setNewImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("category", formData.category);
            data.append("district", formData.district);
            data.append("location", formData.location);
            data.append("description", formData.description);
            data.append("status", formData.status);

            if (formData.latitude !== null && formData.latitude !== undefined && formData.latitude !== "") {
                data.append("latitude", formData.latitude);
            }
            if (formData.longitude !== null && formData.longitude !== undefined && formData.longitude !== "") {
                data.append("longitude", formData.longitude);
            }

            if (newImage) {
                data.append("image", newImage);
            }

            const res = await api.post(`edit-destination/${destination.destination_id}/`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            alert("Destination updated successfully!");
            if (onDestinationUpdated) {
                onDestinationUpdated(res.data.destination || res.data);
            }
            onClose();
        } catch (error) {
            console.error("Error updating destination:", error);
            alert("Failed to update destination.");
        } finally {
            setSaving(false);
        }
    };

    const currentImageUrl = destination.image
        ? destination.image.startsWith("http")
            ? destination.image
            : `http://127.0.0.1:8000${destination.image}`
        : null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="edit-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Edit Destination</h3>
                    <button className="close-modal-btn" onClick={onClose}>
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form-body">
                    <div className="modal-form-group">
                        <label>
                            Destination Name <span>*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="modal-two-col">
                        <div className="modal-form-group">
                            <label>
                                Category <span>*</span>
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="Beach">Beach</option>
                                <option value="Hill Station">Hill Station</option>
                                <option value="Waterfall">Waterfall</option>
                                <option value="Temple">Temple</option>
                                <option value="Wildlife">Wildlife</option>
                                <option value="Museum">Museum</option>
                                <option value="Backwaters">Backwaters</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="modal-form-group">
                            <label>
                                District <span>*</span>
                            </label>
                            <select
                                name="district"
                                value={formData.district}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select District</option>
                                {districts.map((d) => (
                                    <option key={d} value={d}>
                                        {d}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="modal-form-group">
                        <label>
                            Location / Area <span>*</span>
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="modal-form-group">
                        <label>
                            Description <span>*</span>
                        </label>
                        <textarea
                            rows="3"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="modal-two-col">
                        <div className="modal-form-group">
                            <label>Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="modal-form-group">
                            <label>Replace Cover Photo (Optional)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>

                    {/* IMAGE PREVIEW */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {newImage ? (
                            <div>
                                <span style={{ fontSize: "10px", color: "#0284c7", fontWeight: "600", display: "block", marginBottom: "4px" }}>
                                    New Selected Photo Preview:
                                </span>
                                <img
                                    src={URL.createObjectURL(newImage)}
                                    alt="New Cover Preview"
                                    style={{ width: "80px", height: "60px", objectFit: "cover", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                                />
                            </div>
                        ) : currentImageUrl ? (
                            <div>
                                <span style={{ fontSize: "10px", color: "#64748b", fontWeight: "600", display: "block", marginBottom: "4px" }}>
                                    Current Cover Photo:
                                </span>
                                <img
                                    src={currentImageUrl}
                                    alt="Current Cover"
                                    style={{ width: "80px", height: "60px", objectFit: "cover", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                                />
                            </div>
                        ) : null}
                    </div>

                    {/* MAP PICKER */}
                    <div className="modal-form-group">
                        <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>Destination Map Location</span>
                            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "normal" }}>
                                (Drag pin to adjust coordinates)
                            </span>
                        </label>
                        <MapPicker
                            latitude={formData.latitude}
                            longitude={formData.longitude}
                            onLocationSelect={({ latitude, longitude }) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    latitude: latitude !== null ? latitude : "",
                                    longitude: longitude !== null ? longitude : "",
                                }));
                            }}
                            height="200px"
                        />
                    </div>

                    <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                        <button
                            type="button"
                            className="btn-modal-cancel"
                            onClick={onClose}
                            style={{
                                padding: "8px 16px",
                                borderRadius: "8px",
                                border: "1px solid #cbd5e1",
                                background: "#ffffff",
                                color: "#475569",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: "600"
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-modal-save"
                            style={{
                                padding: "8px 20px",
                                borderRadius: "8px",
                                border: "none",
                                background: "#0284c7",
                                color: "#ffffff",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: "600"
                            }}
                        >
                            {saving ? "Saving Changes..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
