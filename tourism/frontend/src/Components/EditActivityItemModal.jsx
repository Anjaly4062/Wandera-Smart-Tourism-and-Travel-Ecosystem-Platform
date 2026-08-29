import { useState, useEffect } from "react";
import api from "../services/api";
import "../styles/EditHotelModal.css";

export default function EditActivityItemModal({ item, isOpen, onClose, onItemUpdated }) {
    const [itemData, setItemData] = useState({
        activity_title: "",
        category: "",
        description: "",
        price: "",
        duration: "",
        available_times: "",
        capacity: "",
        instructions: "",
    });

    const [newImages, setNewImages] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (item) {
            setItemData({
                activity_title: item.activity_title || "",
                category: item.category || "",
                description: item.description || "",
                price: item.price || "",
                duration: item.duration || "",
                available_times: item.available_times || "",
                capacity: item.capacity || "",
                instructions: item.instructions || "",
            });
        }
    }, [item]);

    if (!isOpen || !item) return null;

    const handleChange = (e) => {
        setItemData({
            ...itemData,
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
            formData.append("activity_title", itemData.activity_title);
            formData.append("category", itemData.category);
            formData.append("description", itemData.description);
            formData.append("price", itemData.price);
            formData.append("duration", itemData.duration);
            formData.append("available_times", itemData.available_times);
            formData.append("capacity", itemData.capacity);
            formData.append("instructions", itemData.instructions);

            newImages.forEach((img) => {
                formData.append("activity_item_images", img);
            });

            const response = await api.post(`edit-activity-item/${item.item_id}/`, formData);

            if (response.status === 200) {
                alert("Activity package updated successfully!");
                if (onItemUpdated) onItemUpdated(response.data.item);
                onClose();
            }
        } catch (error) {
            console.error("Error updating activity package:", error);
            alert("Failed to update activity package details.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="edit-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>✏️ Edit Activity Package Details</h3>
                    <button className="close-modal-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form-body">
                    <div className="modal-form-group">
                        <label>Package Title <span>*</span></label>
                        <input
                            type="text"
                            name="activity_title"
                            value={itemData.activity_title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="modal-two-col">
                        <div className="modal-form-group">
                            <label>Category</label>
                            <input
                                type="text"
                                name="category"
                                value={itemData.category}
                                onChange={handleChange}
                                placeholder="e.g. Zipline, Kayaking, Trekking"
                            />
                        </div>

                        <div className="modal-form-group">
                            <label>Price per Person (₹) <span>*</span></label>
                            <input
                                type="number"
                                name="price"
                                value={itemData.price}
                                onChange={handleChange}
                                min="0"
                                required
                            />
                        </div>
                    </div>

                    <div className="modal-two-col">
                        <div className="modal-form-group">
                            <label>Duration <span>*</span></label>
                            <input
                                type="text"
                                name="duration"
                                value={itemData.duration}
                                onChange={handleChange}
                                placeholder="e.g. 1 Hour, 3 Hours"
                                required
                            />
                        </div>

                        <div className="modal-form-group">
                            <label>Max Capacity <span>*</span></label>
                            <input
                                type="number"
                                name="capacity"
                                value={itemData.capacity}
                                onChange={handleChange}
                                min="1"
                                required
                            />
                        </div>
                    </div>

                    <div className="modal-form-group">
                        <label>Available Timings</label>
                        <input
                            type="text"
                            name="available_times"
                            value={itemData.available_times}
                            onChange={handleChange}
                            placeholder="e.g. 9:00 AM - 5:00 PM Daily"
                        />
                    </div>

                    <div className="modal-form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={itemData.description}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>

                    <div className="modal-form-group">
                        <label>Instructions / Guidelines</label>
                        <textarea
                            name="instructions"
                            value={itemData.instructions}
                            onChange={handleChange}
                            rows="2"
                            placeholder="Safety gear provided, wear sports shoes, etc."
                        />
                    </div>

                    <div className="modal-form-group">
                        <label>Add New Package Photos</label>
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
                                                alt={`Package photo preview ${idx + 1}`}
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
                            {saving ? "Saving..." : "Save Package"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
