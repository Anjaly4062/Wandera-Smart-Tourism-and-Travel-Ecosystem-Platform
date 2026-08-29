import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ServiceProviderNavbar from "../Components/ServiceProviderNavbar";
import "../styles/AddVehicle.css";
import api from "../services/api";

export default function AddVehicle() {
    const navigate = useNavigate();
    const location = useLocation();

    const [transAgency, setTransAgency] = useState(null);
    const [selectedTransId, setSelectedTransId] = useState(location.state?.transportation_id || "");
    const [loadingAgency, setLoadingAgency] = useState(true);

    const [vehicleData, setVehicleData] = useState({
        vehicle_name: "",
        vehicle_type: "SUV Cab",
        description: "",
        price_fare: "",
        fare_unit: "/ day",
        seating_capacity: "4",
        availability_status: "Available",
    });

    const [vehicleImages, setVehicleImages] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchProviderTrans = async () => {
            const providerId = localStorage.getItem("provider_id");
            if (!providerId) {
                setLoadingAgency(false);
                return;
            }

            try {
                const response = await api.get(`provider-info/${providerId}/`);
                if (response.data?.provider?.transportation) {
                    const trans = response.data.provider.transportation;
                    setTransAgency(trans);
                    if (!selectedTransId) {
                        setSelectedTransId(trans.transportation_id);
                    }
                }
            } catch (error) {
                console.error("Error fetching provider transportation agency:", error);
            } finally {
                setLoadingAgency(false);
            }
        };

        fetchProviderTrans();
    }, [selectedTransId]);

    const handleChange = (e) => {
        setVehicleData({
            ...vehicleData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImages = (e) => {
        const files = Array.from(e.target.files);
        setVehicleImages((prev) => [...prev, ...files]);
    };

    const removeImage = (index) => {
        setVehicleImages((prev) => prev.filter((_, idx) => idx !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (!selectedTransId) {
                alert("No Transportation Agency found. Please create your agency details first.");
                navigate("/provider/add-transportation");
                return;
            }

            const formData = new FormData();
            formData.append("transportation_id", selectedTransId);
            formData.append("vehicle_name", vehicleData.vehicle_name);
            formData.append("vehicle_type", vehicleData.vehicle_type);
            formData.append("description", vehicleData.description);
            formData.append("price_fare", vehicleData.price_fare);
            formData.append("fare_unit", vehicleData.fare_unit);
            formData.append("seating_capacity", vehicleData.seating_capacity);
            formData.append("availability_status", vehicleData.availability_status);

            vehicleImages.forEach((image) => {
                formData.append("vehicle_images", image);
            });

            const response = await api.post("add-vehicle/", formData);

            if (response.status === 201 || response.status === 200) {
                alert("Vehicle added successfully to your agency!");
                navigate("/provider/my-services");
            }
        } catch (error) {
            console.error("Error adding vehicle:", error);
            alert(error.response?.data?.error || "Failed to add vehicle.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="service-provider-layout">
            <ServiceProviderNavbar />

            <main className="vehicle-page-content">
                <div className="vehicle-page-header">
                    <div>
                        <h2>Add Vehicle to Agency</h2>
                        <p>
                            Dashboard <span>›</span> My Services <span>›</span> Add Vehicle
                        </p>
                    </div>
                    <button type="button" className="top-back-btn" onClick={() => navigate(-1)}>
                        ← Back
                    </button>
                </div>

                <form className="vehicle-form-card" onSubmit={handleSubmit}>
                    <div className="vehicle-form-header">
                        <div className="vehicle-icon">🚗</div>
                        <div>
                            <h1>Vehicle Information</h1>
                            <p>Add a new vehicle to your registered transportation agency</p>
                        </div>
                    </div>

                    <div className="vehicle-divider"></div>

                    {/* AGENCY SELECTION */}
                    <div className="vehicle-section">
                        <h3>Connected Transportation Agency</h3>
                        <p className="section-description">
                            Select or verify the transportation service this vehicle belongs to.
                        </p>

                        <div className="vehicle-form-group">
                            <label>Transportation Agency <span>*</span></label>
                            {loadingAgency ? (
                                <p style={{ fontSize: "11px", color: "#64748b" }}>Loading agency details...</p>
                            ) : transAgency ? (
                                <select
                                    value={selectedTransId}
                                    onChange={(e) => setSelectedTransId(e.target.value)}
                                    required
                                >
                                    <option value={transAgency.transportation_id}>
                                        {transAgency.service_name} ({transAgency.district || transAgency.starting_location})
                                    </option>
                                </select>
                            ) : (
                                <div style={{ background: "#fff7ed", padding: "12px", border: "1px solid #ffedd5", borderRadius: "8px", color: "#c2410c", fontSize: "12px" }}>
                                    <p style={{ marginBottom: "8px" }}>⚠️ No transportation agency registered yet under your account.</p>
                                    <button
                                        type="button"
                                        style={{ padding: "6px 14px", background: "#f97316", color: "white", border: "none", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}
                                        onClick={() => navigate("/provider/add-transportation")}
                                    >
                                        + Add Agency First
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* VEHICLE INFO */}
                    <div className="vehicle-section">
                        <h3>Vehicle Specifications</h3>

                        <div className="vehicle-form-group">
                            <label>Vehicle Model / Name <span>*</span></label>
                            <input
                                type="text"
                                name="vehicle_name"
                                value={vehicleData.vehicle_name}
                                onChange={handleChange}
                                placeholder="e.g. Toyota Innova Crysta AC"
                                required
                            />
                        </div>

                        <div className="vehicle-two-column">
                            <div className="vehicle-form-group">
                                <label>Vehicle Type / Category <span>*</span></label>
                                <select
                                    name="vehicle_type"
                                    value={vehicleData.vehicle_type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Sedan Taxi">Sedan Taxi (Dzire, Etios)</option>
                                    <option value="SUV Cab">SUV Cab (Innova, Crysta)</option>
                                    <option value="Tempo Traveller">Tempo Traveller (12/17 Seater)</option>
                                    <option value="Luxury Bus">Luxury Tourist Bus</option>
                                    <option value="Self Drive Car">Self Drive Car</option>
                                    <option value="Two Wheeler">Scooter / Bike Rental</option>
                                    <option value="Houseboat / Boat">Ferry / Houseboat</option>
                                </select>
                            </div>

                            <div className="vehicle-form-group">
                                <label>Seating Capacity <span>*</span></label>
                                <input
                                    type="number"
                                    name="seating_capacity"
                                    value={vehicleData.seating_capacity}
                                    onChange={handleChange}
                                    placeholder="e.g. 7 Passengers"
                                    min="1"
                                    required
                                />
                            </div>
                        </div>

                        <div className="vehicle-two-column">
                            <div className="vehicle-form-group">
                                <label>Standard Fare / Rate (₹) <span>*</span></label>
                                <input
                                    type="number"
                                    name="price_fare"
                                    value={vehicleData.price_fare}
                                    onChange={handleChange}
                                    placeholder="e.g. 2500"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="vehicle-form-group">
                                <label>Fare Unit / Rate Type <span>*</span></label>
                                <select
                                    name="fare_unit"
                                    value={vehicleData.fare_unit}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="/ day">per day (₹ / day)</option>
                                    <option value="/ km">per kilometer (₹ / km)</option>
                                    <option value="/ trip">per trip / package (₹ / trip)</option>
                                    <option value="/ hour">per hour (₹ / hour)</option>
                                </select>
                            </div>
                        </div>

                        <div className="vehicle-form-group">
                            <label>Availability Status</label>
                            <select
                                name="availability_status"
                                value={vehicleData.availability_status}
                                onChange={handleChange}
                            >
                                <option value="Available">Available for Rent/Booking</option>
                                <option value="Busy">Currently Booked / Maintenance</option>
                            </select>
                        </div>

                        <div className="vehicle-form-group">
                            <label>Vehicle Description</label>
                            <textarea
                                name="description"
                                value={vehicleData.description}
                                onChange={handleChange}
                                placeholder="Describe vehicle condition, AC features, luggage space, music system..."
                                rows="4"
                            />
                        </div>
                    </div>

                    {/* VEHICLE PHOTOS */}
                    <div className="vehicle-section">
                        <h3>Vehicle Photos</h3>
                        <p className="section-description">Upload exterior and interior photos of this vehicle.</p>

                        <div className="image-upload-box">
                            <div className="upload-icon">📷</div>
                            <p>Upload vehicle photos</p>
                            <span>Select multiple images</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImages}
                            />
                        </div>

                        {vehicleImages.length > 0 && (
                            <div className="image-preview-wrapper">
                                <p className="preview-heading">{vehicleImages.length} image(s) selected:</p>
                                <div className="image-preview-grid">
                                    {vehicleImages.map((file, idx) => (
                                        <div key={idx} className="preview-thumb-card">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Vehicle preview ${idx + 1}`}
                                            />
                                            <button
                                                type="button"
                                                className="btn-remove-thumb"
                                                onClick={() => removeImage(idx)}
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
                    <div className="vehicle-form-actions">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() => navigate("/provider/my-services")}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="save-vehicle-button" disabled={submitting}>
                            {submitting ? "Saving..." : "Save Vehicle"} <span>→</span>
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
