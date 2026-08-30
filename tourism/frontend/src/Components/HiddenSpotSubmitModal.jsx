import { useState, useRef } from "react";
import MapPicker from "./MapPicker";
import api from "../services/api";

const PLACE_TYPES = [
    "Waterfall",
    "Viewpoint",
    "Nature Spot",
    "Beach",
    "Temple",
    "Cave",
    "Trekking Trail",
    "Lake",
    "Heritage",
    "Other",
];

export default function HiddenSpotSubmitModal({ isOpen, onClose, onSpotSubmitted }) {
    const fileInputRef = useRef(null);

    const [name, setName] = useState("");
    const [spotType, setSpotType] = useState("Nature Spot");
    const [location, setLocation] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [description, setDescription] = useState("");
    const [photos, setPhotos] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    if (!isOpen) return null;

    const handlePhotoChange = (e) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length === 0) return;

        const newPhotos = [...photos, ...selectedFiles];
        setPhotos(newPhotos);

        const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
        setPreviewUrls((prev) => [...prev, ...newPreviews]);
    };

    const handleRemovePhoto = (index) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
        setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        const userId = localStorage.getItem("user_id");
        if (!userId) {
            setErrorMessage("Please log in as a tourist to submit a hidden spot.");
            return;
        }

        if (!location.trim()) {
            setErrorMessage("Please enter the location or nearest landmark.");
            return;
        }

        if (!description.trim()) {
            setErrorMessage("Please provide a short description of this hidden spot.");
            return;
        }

        // Place Name: if left empty, default to "[Type] near [Location]"
        const finalName = name.trim() || `${spotType} near ${location.trim()}`;

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append("user_id", userId);
            formData.append("name", finalName);
            formData.append("spot_type", spotType);
            formData.append("location", location.trim());
            formData.append("description", description.trim());

            if (latitude !== "" && latitude !== null && latitude !== undefined) {
                formData.append("latitude", latitude);
            }
            if (longitude !== "" && longitude !== null && longitude !== undefined) {
                formData.append("longitude", longitude);
            }

            // Append photos (support both single image and multiple photos)
            if (photos.length > 0) {
                formData.append("image", photos[0]);
            }
            photos.forEach((photo) => {
                formData.append("photos", photo);
            });

            await api.post("hidden-spots/submit/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setSuccessMessage(
                "Hidden spot submitted successfully! It has been saved as a Pending Hidden Spot Request and sent to Admin for verification. Once approved, it will appear here for all tourists."
            );

            setTimeout(() => {
                // Reset form
                setName("");
                setSpotType("Nature Spot");
                setLocation("");
                setLatitude("");
                setLongitude("");
                setDescription("");
                setPhotos([]);
                setPreviewUrls([]);
                setSuccessMessage("");
                if (onSpotSubmitted) onSpotSubmitted();
                onClose();
            }, 2500);
        } catch (error) {
            console.error("Error submitting hidden spot:", error);
            const msg =
                error.response?.data?.error ||
                "Failed to submit hidden spot. Please check your connection and try again.";
            setErrorMessage(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="spot-modal-overlay" onClick={onClose}>
            <div className="spot-modal-card" onClick={(e) => e.stopPropagation()}>
                {/* MODAL HEADER */}
                <div className="spot-modal-header">
                    <div className="spot-modal-title-wrap">
                        <span className="spot-modal-badge">COMMUNITY CONTRIBUTION</span>
                        <h3 className="spot-modal-title">
                            <span>💎</span>
                            <span>Share a Hidden Spot</span>
                        </h3>
                    </div>
                    <button
                        type="button"
                        className="spot-modal-close"
                        onClick={onClose}
                        title="Close"
                    >
                        ✕
                    </button>
                </div>

                {/* MODAL BODY */}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
                    <div className="spot-modal-body">
                        {errorMessage && (
                            <div className="spot-alert-error">
                                ⚠ {errorMessage}
                            </div>
                        )}

                        {successMessage && (
                            <div className="spot-alert-success">
                                ✓ {successMessage}
                            </div>
                        )}

                        {/* ROW 1: PLACE TYPE & SPOT NAME */}
                        <div className="spot-form-row">
                            <div className="spot-form-group">
                                <label className="spot-form-label">
                                    Place Type *
                                </label>
                                <select
                                    className="spot-form-select"
                                    value={spotType}
                                    onChange={(e) => setSpotType(e.target.value)}
                                    required
                                >
                                    {PLACE_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="spot-form-group">
                                <label className="spot-form-label">
                                    <span>Place / Spot Name</span>
                                    <span className="spot-form-label-hint">Optional</span>
                                </label>
                                <input
                                    type="text"
                                    className="spot-form-input"
                                    placeholder="e.g. Meenmutty Secret Fall"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* ROW 2: LOCATION LANDMARK */}
                        <div className="spot-form-group">
                            <label className="spot-form-label">
                                <span>Location / Landmark *</span>
                                <span className="spot-form-label-hint">Town, Area or District</span>
                            </label>
                            <input
                                type="text"
                                className="spot-form-input"
                                placeholder="e.g. Near Meppadi, Wayanad"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                required
                            />
                        </div>

                        {/* ROW 3: MAP PICKER FOR EXACT LOCATION */}
                        <div className="spot-form-group">
                            <label className="spot-form-label">
                                <span>Map Location Picker</span>
                                <span className="spot-form-label-hint">Click on map to pin location</span>
                            </label>
                            <MapPicker
                                latitude={latitude}
                                longitude={longitude}
                                onLocationSelect={({ latitude: lat, longitude: lng }) => {
                                    setLatitude(lat || "");
                                    setLongitude(lng || "");
                                }}
                                height="200px"
                            />
                        </div>

                        {/* ROW 4: SHORT DESCRIPTION */}
                        <div className="spot-form-group">
                            <label className="spot-form-label">
                                <span>Short Description *</span>
                                <span className="spot-form-label-hint">Best time to visit, trail notes</span>
                            </label>
                            <textarea
                                className="spot-form-textarea"
                                rows="3"
                                placeholder="Briefly describe what makes this spot special and how travelers can reach it safely..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>

                        {/* ROW 5: PHOTOS */}
                        <div className="spot-form-group">
                            <label className="spot-form-label">
                                <span>Photos</span>
                                <span className="spot-form-label-hint">Multiple photos supported</span>
                            </label>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handlePhotoChange}
                                multiple
                                accept="image/*"
                                style={{ display: "none" }}
                            />

                            <div
                                className="spot-photo-upload-box"
                                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                            >
                                <div className="spot-photo-upload-left">
                                    <span className="spot-photo-icon">📷</span>
                                    <div className="spot-photo-text">
                                        <strong>Click to select spot photos</strong>
                                        <span>JPG, PNG or WEBP from your device</span>
                                    </div>
                                </div>
                                <button type="button" className="spot-photo-btn">
                                    Browse
                                </button>
                            </div>

                            {previewUrls.length > 0 && (
                                <div className="spot-thumbnails-list">
                                    {previewUrls.map((url, idx) => (
                                        <div key={idx} className="spot-thumbnail-card">
                                            <img src={url} alt={`Upload ${idx + 1}`} />
                                            <button
                                                type="button"
                                                className="spot-thumbnail-remove"
                                                onClick={() => handleRemovePhoto(idx)}
                                                title="Remove photo"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* MODAL FOOTER */}
                    <div className="spot-modal-footer">
                        <button
                            type="button"
                            className="btn-spot-cancel"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="btn-spot-submit"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>Submitting Request...</>
                            ) : (
                                <>
                                    <span>✓</span>
                                    <span>Submit for Verification</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
