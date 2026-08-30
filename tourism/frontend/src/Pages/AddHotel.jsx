import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ServiceProviderNavbar from "../Components/ServiceProviderNavbar";
import MapPicker from "../Components/MapPicker";
import "../styles/AddHotel.css";
import api from "../services/api";

export default function AddHotel() {

    const navigate = useNavigate();
    const location = useLocation();

    
    const serviceData = location.state || {};

    const [hotelData, setHotelData] = useState({
        hotel_name: serviceData.business_name || "",
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
    const [hotelImages, setHotelImages] = useState([]);

    const [facilities, setFacilities] = useState([]);

    const [facilityInput, setFacilityInput] = useState("");

    const handleHotelChange = (e) => {
        setHotelData({
            ...hotelData,
            [e.target.name]: e.target.value
        });
    };

    const handleHotelImages = (e) => {
        const files = Array.from(e.target.files);
        setHotelImages((prev) => [...prev, ...files]);
    };

    const removeHotelImage = (indexToRemove) => {
        setHotelImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const addFacility = () => {
        const facility = facilityInput.trim();
        if (!facility) return;
        if (facilities.includes(facility)) return;
        setFacilities([...facilities, facility]);
        setFacilityInput("");
    };

    const removeFacility = (index) => {
        setFacilities(facilities.filter((_, i) => i !== index));
    };
const handleSubmit = async (e) => {

    e.preventDefault();

    try {

     

        const providerId = localStorage.getItem("provider_id");

        console.log("Provider ID:", providerId);

        if (!providerId) {
            alert("Provider ID not found. Please login again.");
            return;
        }
        const formData = new FormData();
        formData.append(
            "provider_id",
            providerId
        );
        formData.append(
            "hotel_name",
            hotelData.hotel_name
        );

        formData.append(
            "description",
            hotelData.description
        );

        formData.append(
            "address",
            hotelData.address
        );

        formData.append(
            "district",
            hotelData.district
        );

        formData.append(
            "location",
            hotelData.location
        );

        if (hotelData.latitude !== null && hotelData.latitude !== undefined && hotelData.latitude !== "") {
            formData.append("latitude", hotelData.latitude);
        }
        if (hotelData.longitude !== null && hotelData.longitude !== undefined && hotelData.longitude !== "") {
            formData.append("longitude", hotelData.longitude);
        }

        formData.append(
            "contact_number",
            hotelData.contact_number
        );

        formData.append(
            "email",
            hotelData.email
        );

        formData.append(
            "check_in_time",
            hotelData.check_in_time
        );

        formData.append(
            "check_out_time",
            hotelData.check_out_time
        );


        hotelImages.forEach((image) => {

            formData.append(
                "hotel_images",
                image
            );

        });
        formData.append(
            "facilities",
            JSON.stringify(facilities)
        );

        formData.append(
            "rooms",
            JSON.stringify([])
        );

        console.log(
            "Submitting hotel with provider:",
            providerId
        );

        const response = await api.post(
            "add-hotel/",
            formData
        );

        console.log(
            "Hotel saved successfully:",
            response.data
        );

        alert(
            "Hotel details saved successfully!"
        );

        navigate("/provider/my-services");


    } catch (error) {

        console.error(
            "Error saving hotel:",
            error
        );

        if (error.response) {

            console.error(
                "Django response:",
                error.response.data
            );

            alert(
                error.response.data.error ||
                "Failed to save hotel."
            );

        } else {

            alert(
                "Something went wrong."
            );

        }

    }

};

    return (

        <div className="service-provider-layout">

            <ServiceProviderNavbar />

            <main className="hotel-page-content">


                <div className="hotel-page-header">

                    <div>

                        <h2>Add Hotel</h2>

                        <p>
                            Dashboard
                            <span>›</span>
                            Add Service
                            <span>›</span>
                            Hotel Details
                        </p>

                    </div>

                    <button type="button" className="top-back-btn" onClick={() => navigate(-1)}>
                        ← Back
                    </button>

                </div>



                <form
                    className="hotel-form-card"
                    onSubmit={handleSubmit}
                >


                    {/* =================================================
                        FORM HEADER
                    ================================================= */}

                    <div className="hotel-form-header">

                        <div className="hotel-icon">
                            🏨
                        </div>

                        <div>

                            <h1>
                                Hotel Information
                            </h1>

                            <p>
                                Add the details of your hotel
                            </p>

                        </div>

                    </div>


                    <div className="hotel-divider"></div>


                    <div className="hotel-section">

                        <h3>
                            Basic Hotel Details
                        </h3>

                        <p className="section-description">
                            Provide basic information about your hotel.
                        </p>


                        

                        <div className="hotel-form-group">

                            <label>
                                Hotel Name <span>*</span>
                            </label>

                            <input
                                type="text"
                                name="hotel_name"
                                value={hotelData.hotel_name}
                                onChange={handleHotelChange}
                                placeholder="Enter hotel name"
                                required
                            />

                        </div>


                        

                        <div className="hotel-form-group">

                            <label>
                                Description <span>*</span>
                            </label>

                            <textarea
                                name="description"
                                value={hotelData.description}
                                onChange={handleHotelChange}
                                placeholder="Describe your hotel"
                                rows="4"
                                required
                            />

                        </div>


                        

                        <div className="hotel-form-group">

                            <label>
                                Address <span>*</span>
                            </label>

                            <textarea
                                name="address"
                                value={hotelData.address}
                                onChange={handleHotelChange}
                                placeholder="Enter complete hotel address"
                                rows="3"
                                required
                            />

                        </div>


                        
                        <div className="hotel-form-group">

                            <label>
                                District <span>*</span>
                            </label>

                            <select
                                name="district"
                                value={hotelData.district}
                                onChange={handleHotelChange}
                                required
                            >

                                <option value="">
                                    Select district
                                </option>

                                <option value="Thiruvananthapuram">
                                    Thiruvananthapuram
                                </option>

                                <option value="Kollam">
                                    Kollam
                                </option>

                                <option value="Pathanamthitta">
                                    Pathanamthitta
                                </option>

                                <option value="Alappuzha">
                                    Alappuzha
                                </option>

                                <option value="Kottayam">
                                    Kottayam
                                </option>

                                <option value="Idukki">
                                    Idukki
                                </option>

                                <option value="Ernakulam">
                                    Ernakulam
                                </option>

                                <option value="Thrissur">
                                    Thrissur
                                </option>

                                <option value="Palakkad">
                                    Palakkad
                                </option>

                                <option value="Malappuram">
                                    Malappuram
                                </option>

                                <option value="Kozhikode">
                                    Kozhikode
                                </option>

                                <option value="Wayanad">
                                    Wayanad
                                </option>

                                <option value="Kannur">
                                    Kannur
                                </option>

                                <option value="Kasaragod">
                                    Kasaragod
                                </option>

                            </select>

                        </div>



                        <div className="hotel-form-group">

                            <label>
                                Location <span>*</span>
                            </label>

                            <input
                                type="text"
                                name="location"
                                value={hotelData.location}
                                onChange={handleHotelChange}
                                placeholder="Google Maps location / landmark"
                                required
                            />

                        </div>

                        <div className="hotel-form-group">
                            <label>
                                Pin Location on Map <span style={{ color: "#64748b", fontWeight: "normal", fontSize: "12px" }}>(Optional)</span>
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
                                height="260px"
                            />
                        </div>

                    </div>


                    

                    <div className="hotel-section">

                        <h3>
                            Contact & Timing
                        </h3>

                        <p className="section-description">
                            Provide contact information and hotel timings.
                        </p>


                        <div className="hotel-form-group">

                            <label>
                                Contact Number <span>*</span>
                            </label>

                            <input
                                type="tel"
                                name="contact_number"
                                value={hotelData.contact_number}
                                onChange={handleHotelChange}
                                placeholder="Enter contact number"
                                required
                            />

                        </div>


                        <div className="hotel-form-group">

                            <label>
                                Email <span>*</span>
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={hotelData.email}
                                onChange={handleHotelChange}
                                placeholder="hotel@example.com"
                                required
                            />

                        </div>


                        <div className="hotel-two-column">

                            <div className="hotel-form-group">

                                <label>
                                    Check-in Time <span>*</span>
                                </label>

                                <input
                                    type="time"
                                    name="check_in_time"
                                    value={hotelData.check_in_time}
                                    onChange={handleHotelChange}
                                    required
                                />

                            </div>


                            <div className="hotel-form-group">

                                <label>
                                    Check-out Time <span>*</span>
                                </label>

                                <input
                                    type="time"
                                    name="check_out_time"
                                    value={hotelData.check_out_time}
                                    onChange={handleHotelChange}
                                    required
                                />

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        SECTION 3 — HOTEL PHOTOS
                    ================================================= */}

                    <div className="hotel-section">

                        <h3>
                            Hotel Photos
                        </h3>

                        <p className="section-description">
                            Upload multiple photos of your hotel.
                        </p>


                        <div className="image-upload-box">

                            <div className="upload-icon">
                                📷
                            </div>

                            <p>
                                Upload hotel photos
                            </p>

                            <span>
                                You can select multiple images
                            </span>

                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleHotelImages}
                            />

                        </div>


                        {hotelImages.length > 0 && (
                            <div className="image-preview-wrapper">
                                <p className="preview-heading">{hotelImages.length} image(s) selected:</p>
                                <div className="image-preview-grid">
                                    {hotelImages.map((file, idx) => (
                                        <div key={idx} className="preview-thumb-card">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Upload preview ${idx + 1}`}
                                            />
                                            <button
                                                type="button"
                                                className="btn-remove-thumb"
                                                onClick={() => removeHotelImage(idx)}
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


                    {/* =================================================
                        SECTION 4 — FACILITIES
                    ================================================= */}

                    <div className="hotel-section">

                        <h3>
                            Hotel Facilities
                        </h3>

                        <p className="section-description">
                            Add facilities available at your hotel.
                        </p>


                        <div className="facility-input-row">

                            <input
                                type="text"
                                value={facilityInput}
                                onChange={(e) =>
                                    setFacilityInput(e.target.value)
                                }
                                placeholder="Example: Wi-Fi, Swimming Pool, Parking"
                            />

                            <button
                                type="button"
                                onClick={addFacility}
                                className="add-facility-button"
                            >
                                + Add
                            </button>

                        </div>


                        {facilities.length > 0 && (

                            <div className="facility-list">

                                {facilities.map(
                                    (facility, index) => (

                                        <div
                                            className="facility-tag"
                                            key={index}
                                        >

                                            {facility}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeFacility(index)
                                                }
                                            >
                                                ×
                                            </button>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </div>


                    {/* =================================================
                        FINAL SUBMIT
                    ================================================= */}

                    <div className="hotel-form-actions">

                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() =>
                                navigate("/provider-home")
                            }
                        >
                            Back
                        </button>


                        <button
                            type="submit"
                            className="save-hotel-button"
                        >
                            Save Hotel
                            <span>→</span>
                        </button>

                    </div>

                </form>

            </main>

        </div>
    );
}