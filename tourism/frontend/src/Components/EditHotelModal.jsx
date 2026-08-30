import { useState, useEffect } from "react";
import api from "../services/api";
import MapPicker from "../Components/MapPicker";
import "../styles/EditHotelModal.css";

export default function EditHotelModal({ hotel, isOpen, onClose, onHotelUpdated }) {
    const [hotelData, setHotelData] = useState({
        hotel_name: "",
        description: "",
        address: "",
        district: "",
        location: "",
        contact_number: "",
        email: "",
        check_in_time: "",
        check_out_time: "",
        latitude: "",
        longitude: "",
    });

    const [facilities, setFacilities] = useState([]);
    const [facilityInput, setFacilityInput] = useState("");
    const [newImages, setNewImages] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (hotel) {
            setHotelData({
                hotel_name: hotel.hotel_name || "",
                description: hotel.description || "",
                address: hotel.address || "",
                district: hotel.district || "",
                location: hotel.location || "",
                contact_number: hotel.contact_number || "",
                email: hotel.email || "",
                check_in_time: hotel.check_in_time || "",
                check_out_time: hotel.check_out_time || "",
                latitude: hotel.latitude !== undefined && hotel.latitude !== null ? hotel.latitude : "",
                longitude: hotel.longitude !== undefined && hotel.longitude !== null ? hotel.longitude : "",
            });

            if (hotel.facilities) {
                setFacilities(hotel.facilities.map((f) => f.facility_name));
            } else {
                setFacilities([]);
            }
        }
    }, [hotel]);

    if (!isOpen || !hotel) return null;

    const handleChange = (e) => {
        setHotelData({
            ...hotelData,
            [e.target.name]: e.target.value,
        });
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
            formData.append("hotel_name", hotelData.hotel_name);
            formData.append("description", hotelData.description);
            formData.append("address", hotelData.address);
            formData.append("district", hotelData.district);
            formData.append("location", hotelData.location);
            formData.append("contact_number", hotelData.contact_number);
            formData.append("email", hotelData.email);
            formData.append("check_in_time", hotelData.check_in_time);
            formData.append("check_out_time", hotelData.check_out_time);
            if (hotelData.latitude !== null && hotelData.latitude !== undefined && hotelData.latitude !== "") {
                formData.append("latitude", hotelData.latitude);
            }
            if (hotelData.longitude !== null && hotelData.longitude !== undefined && hotelData.longitude !== "") {
                formData.append("longitude", hotelData.longitude);
            }
            formData.append("facilities", JSON.stringify(facilities));

            newImages.forEach((img) => {
                formData.append("hotel_images", img);
            });

            const response = await api.post(`edit-hotel/${hotel.hotel_id}/`, formData);

            if (response.status === 200) {
                alert("Hotel details updated successfully!");
                if (onHotelUpdated) onHotelUpdated(response.data.hotel);
                onClose();
            }
        } catch (error) {
            console.error("Error updating hotel:", error);
            alert("Failed to update hotel details.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="edit-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>✏️ Edit Hotel Details</h3>
                    <button className="close-modal-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form-body">
                    <div className="modal-form-group">
                        <label>Hotel Name <span>*</span></label>
                        <input
                            type="text"
                            name="hotel_name"
                            value={hotelData.hotel_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="modal-form-group">
                        <label>Description <span>*</span></label>
                        <textarea
                            name="description"
                            value={hotelData.description}
                            onChange={handleChange}
                            rows="3"
                            required
                        />
                    </div>

                    <div className="modal-form-group">
                        <label>Address <span>*</span></label>
                        <textarea
                            name="address"
                            value={hotelData.address}
                            onChange={handleChange}
                            rows="2"
                            required
                        />
                    </div>

                    <div className="modal-two-col">
                        <div className="modal-form-group">
                            <label>District <span>*</span></label>
                            <select
                                name="district"
                                value={hotelData.district}
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

                        <div className="modal-form-group">
                            <label>Location / Landmark <span>*</span></label>
                            <input
                                type="text"
                                name="location"
                                value={hotelData.location}
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
                            latitude={hotelData.latitude}
                            longitude={hotelData.longitude}
                            onLocationSelect={({ latitude, longitude }) => {
                                setHotelData((prev) => ({
                                    ...prev,
                                    latitude: latitude !== null ? latitude : "",
                                    longitude: longitude !== null ? longitude : "",
                                }));
                            }}
                            height="240px"
                        />
                    </div>

                    <div className="modal-two-col">
                        <div className="modal-form-group">
                            <label>Contact Number <span>*</span></label>
                            <input
                                type="tel"
                                name="contact_number"
                                value={hotelData.contact_number}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="modal-form-group">
                            <label>Email <span>*</span></label>
                            <input
                                type="email"
                                name="email"
                                value={hotelData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="modal-two-col">
                        <div className="modal-form-group">
                            <label>Check-in Time <span>*</span></label>
                            <input
                                type="time"
                                name="check_in_time"
                                value={hotelData.check_in_time}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="modal-form-group">
                            <label>Check-out Time <span>*</span></label>
                            <input
                                type="time"
                                name="check_out_time"
                                value={hotelData.check_out_time}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* FACILITIES */}
                    <div className="modal-form-group">
                        <label>Hotel Facilities</label>
                        <div className="facility-add-row">
                            <input
                                type="text"
                                value={facilityInput}
                                onChange={(e) => setFacilityInput(e.target.value)}
                                placeholder="Add facility (e.g. Wi-Fi, Pool)"
                            />
                            <button type="button" onClick={addFacility} className="btn-add-fac">+ Add</button>
                        </div>
                        {facilities.length > 0 && (
                            <div className="fac-chips-row">
                                {facilities.map((fac, idx) => (
                                    <span key={idx} className="fac-chip">
                                        {fac}
                                        <button type="button" onClick={() => removeFacility(idx)}>×</button>
                                    </span>
                                ))}
                            </div>
                        )}
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
