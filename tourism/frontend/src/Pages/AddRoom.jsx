import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ServiceProviderNavbar from "../Components/ServiceProviderNavbar";
import "../styles/AddRoom.css";
import api from "../services/api";

export default function AddRoom() {
    const navigate = useNavigate();
    const location = useLocation();

    const [hotels, setHotels] = useState([]);
    const [selectedHotelId, setSelectedHotelId] = useState(
        location.state?.hotel_id || ""
    );
    const [loadingHotel, setLoadingHotel] = useState(true);

    const [roomData, setRoomData] = useState({
        room_name: "",
        description: "",
        price_per_night: "",
        total_rooms: "",
        maximum_guests: "",
    });

    const [roomImages, setRoomImages] = useState([]);

    useEffect(() => {
        const fetchProviderHotel = async () => {
            const providerId = localStorage.getItem("provider_id");
            if (!providerId) {
                setLoadingHotel(false);
                return;
            }

            try {
                const response = await api.get(`provider-hotel/${providerId}/`);
                if (response.data?.hotel) {
                    setHotels([response.data.hotel]);
                    if (!selectedHotelId) {
                        setSelectedHotelId(response.data.hotel.hotel_id);
                    }
                }
            } catch (error) {
                console.error("Error fetching provider hotel:", error);
            } finally {
                setLoadingHotel(false);
            }
        };

        fetchProviderHotel();
    }, [selectedHotelId]);

    const handleChange = (e) => {
        setRoomData({
            ...roomData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setRoomImages((prev) => [...prev, ...files]);
    };

    const removeRoomImage = (indexToRemove) => {
        setRoomImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedHotelId) {
            alert("Please select a hotel to attach this room to.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("hotel_id", selectedHotelId);
            formData.append("room_name", roomData.room_name);
            formData.append("description", roomData.description);
            formData.append("price_per_night", roomData.price_per_night);
            formData.append("total_rooms", roomData.total_rooms);
            formData.append("maximum_guests", roomData.maximum_guests);

            roomImages.forEach((image) => {
                formData.append("room_images", image);
            });

            const response = await api.post("add-room/", formData);

            if (response.status === 201 || response.status === 200) {
                alert("Room added successfully!");
                navigate("/provider/my-services");
            }
        } catch (error) {
            console.error("Error adding room:", error);
            if (error.response?.data?.error) {
                alert(error.response.data.error);
            } else {
                alert("Failed to add room. Please try again.");
            }
        }
    };

    return (
        <div className="service-provider-layout">
            <ServiceProviderNavbar />

            <main className="room-page-content">
                <div className="room-page-header">
                    <div>
                        <h2>Add Room</h2>
                        <p>
                            Dashboard <span>›</span> My Services <span>›</span> Add Room
                        </p>
                    </div>
                    <button type="button" className="top-back-btn" onClick={() => navigate(-1)}>
                        ← Back
                    </button>
                </div>

                <form className="room-form-card" onSubmit={handleSubmit}>
                    <div className="room-form-header">
                        <div className="room-icon">🛏️</div>
                        <div>
                            <h1>Room Information</h1>
                            <p>Add a new room type to your registered hotel</p>
                        </div>
                    </div>

                    <div className="room-divider"></div>

                    {/* HOTEL SELECTION */}
                    <div className="room-section">
                        <h3>Select Hotel</h3>
                        <p className="section-description">
                            Choose the hotel where this room type will be offered.
                        </p>

                        <div className="room-form-group">
                            <label>
                                Hotel <span>*</span>
                            </label>
                            {loadingHotel ? (
                                <p className="loading-text">Loading your hotel details...</p>
                            ) : hotels.length > 0 ? (
                                <select
                                    value={selectedHotelId}
                                    onChange={(e) => setSelectedHotelId(e.target.value)}
                                    required
                                >
                                    {hotels.map((h) => (
                                        <option key={h.hotel_id} value={h.hotel_id}>
                                            {h.hotel_name} ({h.district})
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="no-hotel-warning">
                                    <p>⚠️ No hotel registered yet under your account.</p>
                                    <button
                                        type="button"
                                        className="add-hotel-redirect"
                                        onClick={() => navigate("/provider/add-hotel")}
                                    >
                                        + Add Hotel First
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ROOM DETAILS */}
                    <div className="room-section">
                        <h3>Basic Room Details</h3>
                        <p className="section-description">
                            Provide details about room features, pricing, and capacity.
                        </p>

                        <div className="room-form-group">
                            <label>
                                Room Name / Type <span>*</span>
                            </label>
                            <input
                                type="text"
                                name="room_name"
                                value={roomData.room_name}
                                onChange={handleChange}
                                placeholder="e.g., Deluxe Ocean View Suite, Family Room"
                                required
                            />
                        </div>

                        <div className="room-form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={roomData.description}
                                onChange={handleChange}
                                placeholder="Describe room amenities, view, bed type, etc."
                                rows="4"
                            />
                        </div>

                        <div className="room-two-column">
                            <div className="room-form-group">
                                <label>
                                    Price per Night (₹) <span>*</span>
                                </label>
                                <input
                                    type="number"
                                    name="price_per_night"
                                    value={roomData.price_per_night}
                                    onChange={handleChange}
                                    placeholder="e.g. 2500"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="room-form-group">
                                <label>
                                    Total Rooms Available <span>*</span>
                                </label>
                                <input
                                    type="number"
                                    name="total_rooms"
                                    value={roomData.total_rooms}
                                    onChange={handleChange}
                                    placeholder="e.g. 5"
                                    min="1"
                                    required
                                />
                            </div>
                        </div>

                        <div className="room-form-group">
                            <label>
                                Maximum Guests Capacity <span>*</span>
                            </label>
                            <input
                                type="number"
                                name="maximum_guests"
                                value={roomData.maximum_guests}
                                onChange={handleChange}
                                placeholder="e.g. 2 Adults, 1 Child"
                                min="1"
                                required
                            />
                        </div>
                    </div>

                    {/* ROOM PHOTOS */}
                    <div className="room-section">
                        <h3>Room Photos</h3>
                        <p className="section-description">
                            Upload photos of the room interior and view.
                        </p>

                        <div className="image-upload-box">
                            <div className="upload-icon">📷</div>
                            <p>Upload room photos</p>
                            <span>Multiple files allowed</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                            />
                        </div>

                        {roomImages.length > 0 && (
                            <div className="image-preview-wrapper">
                                <p className="preview-heading">{roomImages.length} image(s) selected:</p>
                                <div className="image-preview-grid">
                                    {roomImages.map((file, idx) => (
                                        <div key={idx} className="preview-thumb-card">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Room preview ${idx + 1}`}
                                            />
                                            <button
                                                type="button"
                                                className="btn-remove-thumb"
                                                onClick={() => removeRoomImage(idx)}
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

                    {/* ACTIONS */}
                    <div className="room-form-actions">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() => navigate("/provider/my-services")}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="save-room-button"
                        >
                            Save Room <span>→</span>
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
