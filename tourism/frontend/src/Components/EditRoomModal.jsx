import { useState, useEffect } from "react";
import api from "../services/api";
import "../styles/EditHotelModal.css"; // Reuse modal overlay & card styles

export default function EditRoomModal({ room, isOpen, onClose, onRoomUpdated }) {
    const [roomData, setRoomData] = useState({
        room_name: "",
        description: "",
        price_per_night: "",
        total_rooms: "",
        maximum_guests: "",
    });

    const [newImages, setNewImages] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (room) {
            setRoomData({
                room_name: room.room_name || "",
                description: room.description || "",
                price_per_night: room.price_per_night || "",
                total_rooms: room.total_rooms || "",
                maximum_guests: room.maximum_guests || "",
            });
        }
    }, [room]);

    if (!isOpen || !room) return null;

    const handleChange = (e) => {
        setRoomData({
            ...roomData,
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
            formData.append("room_name", roomData.room_name);
            formData.append("description", roomData.description);
            formData.append("price_per_night", roomData.price_per_night);
            formData.append("total_rooms", roomData.total_rooms);
            formData.append("maximum_guests", roomData.maximum_guests);

            newImages.forEach((img) => {
                formData.append("room_images", img);
            });

            const response = await api.post(`edit-room/${room.room_id}/`, formData);

            if (response.status === 200) {
                alert("Room updated successfully!");
                if (onRoomUpdated) onRoomUpdated(response.data.room);
                onClose();
            }
        } catch (error) {
            console.error("Error updating room:", error);
            alert("Failed to update room details.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="edit-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>✏️ Edit Room Details</h3>
                    <button className="close-modal-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form-body">
                    <div className="modal-form-group">
                        <label>Room Name / Type <span>*</span></label>
                        <input
                            type="text"
                            name="room_name"
                            value={roomData.room_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="modal-form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={roomData.description}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>

                    <div className="modal-two-col">
                        <div className="modal-form-group">
                            <label>Price per Night (₹) <span>*</span></label>
                            <input
                                type="number"
                                name="price_per_night"
                                value={roomData.price_per_night}
                                onChange={handleChange}
                                min="0"
                                required
                            />
                        </div>

                        <div className="modal-form-group">
                            <label>Total Rooms <span>*</span></label>
                            <input
                                type="number"
                                name="total_rooms"
                                value={roomData.total_rooms}
                                onChange={handleChange}
                                min="1"
                                required
                            />
                        </div>
                    </div>

                    <div className="modal-form-group">
                        <label>Maximum Guests <span>*</span></label>
                        <input
                            type="number"
                            name="maximum_guests"
                            value={roomData.maximum_guests}
                            onChange={handleChange}
                            min="1"
                            required
                        />
                    </div>

                    <div className="modal-form-group">
                        <label>Add New Room Photos</label>
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
                                                alt={`Room photo preview ${idx + 1}`}
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
                            {saving ? "Saving..." : "Save Room"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
