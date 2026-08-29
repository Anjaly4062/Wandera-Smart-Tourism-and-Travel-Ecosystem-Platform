import { useState, useEffect } from "react";
import api from "../services/api";
import "../styles/EditHotelModal.css";

export default function EditVehicleModal({ vehicle, isOpen, onClose, onVehicleUpdated }) {
    const [vehicleData, setVehicleData] = useState({
        vehicle_name: "",
        vehicle_type: "",
        description: "",
        price_fare: "",
        fare_unit: "/ day",
        seating_capacity: "",
        availability_status: "Available",
    });

    const [newImages, setNewImages] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (vehicle) {
            setVehicleData({
                vehicle_name: vehicle.vehicle_name || "",
                vehicle_type: vehicle.vehicle_type || "",
                description: vehicle.description || "",
                price_fare: vehicle.price_fare || "",
                fare_unit: vehicle.fare_unit || "/ day",
                seating_capacity: vehicle.seating_capacity || "",
                availability_status: vehicle.availability_status || "Available",
            });
        }
    }, [vehicle]);

    if (!isOpen || !vehicle) return null;

    const handleChange = (e) => {
        setVehicleData({
            ...vehicleData,
            [e.target.value ? e.target.name : e.target.name]: e.target.value,
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
            formData.append("vehicle_name", vehicleData.vehicle_name);
            formData.append("vehicle_type", vehicleData.vehicle_type);
            formData.append("description", vehicleData.description);
            formData.append("price_fare", vehicleData.price_fare);
            formData.append("fare_unit", vehicleData.fare_unit);
            formData.append("seating_capacity", vehicleData.seating_capacity);
            formData.append("availability_status", vehicleData.availability_status);

            newImages.forEach((img) => {
                formData.append("vehicle_images", img);
            });

            const response = await api.post(`edit-vehicle/${vehicle.vehicle_id}/`, formData);

            if (response.status === 200) {
                alert("Vehicle updated successfully!");
                if (onVehicleUpdated) onVehicleUpdated(response.data.vehicle);
                onClose();
            }
        } catch (error) {
            console.error("Error updating vehicle:", error);
            alert("Failed to update vehicle details.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="edit-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>✏️ Edit Vehicle Details</h3>
                    <button className="close-modal-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form-body">
                    <div className="modal-form-group">
                        <label>Vehicle Name / Model <span>*</span></label>
                        <input
                            type="text"
                            name="vehicle_name"
                            value={vehicleData.vehicle_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="modal-two-col">
                        <div className="modal-form-group">
                            <label>Vehicle Type <span>*</span></label>
                            <input
                                type="text"
                                name="vehicle_type"
                                value={vehicleData.vehicle_type}
                                onChange={handleChange}
                                placeholder="e.g. SUV, Sedan, Traveller"
                                required
                            />
                        </div>

                        <div className="modal-form-group">
                            <label>Seating Capacity <span>*</span></label>
                            <input
                                type="number"
                                name="seating_capacity"
                                value={vehicleData.seating_capacity}
                                onChange={handleChange}
                                min="1"
                                required
                            />
                        </div>
                    </div>

                    <div className="modal-two-col">
                        <div className="modal-form-group">
                            <label>Price / Fare (₹) <span>*</span></label>
                            <input
                                type="number"
                                name="price_fare"
                                value={vehicleData.price_fare}
                                onChange={handleChange}
                                min="0"
                                required
                            />
                        </div>

                        <div className="modal-form-group">
                            <label>Fare Unit</label>
                            <input
                                type="text"
                                name="fare_unit"
                                value={vehicleData.fare_unit}
                                onChange={handleChange}
                                placeholder="e.g. / day, / km"
                            />
                        </div>
                    </div>

                    <div className="modal-form-group">
                        <label>Availability Status</label>
                        <select
                            name="availability_status"
                            value={vehicleData.availability_status}
                            onChange={handleChange}
                        >
                            <option value="Available">Available</option>
                            <option value="Booked">Booked</option>
                            <option value="Maintenance">Maintenance</option>
                        </select>
                    </div>

                    <div className="modal-form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={vehicleData.description}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>

                    <div className="modal-form-group">
                        <label>Add New Vehicle Photos</label>
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
                                                alt={`Vehicle photo preview ${idx + 1}`}
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
                            {saving ? "Saving..." : "Save Vehicle"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
