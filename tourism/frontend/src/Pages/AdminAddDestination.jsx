import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../Components/AdminNavbar";
import MapPicker from "../Components/MapPicker";
import EditDestinationModal from "../Components/EditDestinationModal";
import api from "../services/api";
import "../styles/AdminAddDestination.css";

export default function AdminAddDestination() {
    const navigate = useNavigate();
    const adminName = localStorage.getItem("name") || "Admin";

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
        description: "",
        status: "Active",
        latitude: "",
        longitude: "",
    });

    const [image, setImage] = useState(null);
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        loadDestinations();
    }, []);

    const loadDestinations = async () => {
        try {
            const res = await api.get("destination-list/");
            setDestinations(res.data || []);
        } catch (err) {
            console.error("Error loading destinations:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (dest) => {
        setSelectedDestination(dest);
        setIsEditModalOpen(true);
    };

    const handleDeleteDestination = async (dest) => {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete "${dest.name}"? This action cannot be undone.`
        );
        if (!confirmDelete) return;

        try {
            await api.delete(`delete-destination/${dest.destination_id}/`);
            alert("Destination deleted successfully.");
            loadDestinations();
        } catch (error) {
            console.error("Error deleting destination:", error);
            alert("Failed to delete destination.");
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const data = new FormData();
        data.append("name", formData.name);
        data.append("category", formData.category);
        data.append("district", formData.district);
        data.append("location", formData.district);
        data.append("area", formData.district);
        data.append("description", formData.description);
        data.append("status", formData.status);

        if (formData.latitude !== null && formData.latitude !== undefined && formData.latitude !== "") {
            data.append("latitude", formData.latitude);
        }
        if (formData.longitude !== null && formData.longitude !== undefined && formData.longitude !== "") {
            data.append("longitude", formData.longitude);
        }

        if (image) {
            data.append("image", image);
        }

        try {
            await api.post("destinations/", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            alert("Destination Added Successfully!");
            setIsAdding(false);

            setFormData({
                name: "",
                category: "",
                district: "",
                description: "",
                status: "Active",
                latitude: "",
                longitude: "",
            });

            setImage(null);
            const fileInput = document.getElementById("destinationImage");
            if (fileInput) fileInput.value = "";

            loadDestinations();
        } catch (error) {
            console.error("Error adding destination:", error);
            alert("Failed to add destination.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    return (
        <div className="admin-dashboard">
            {/* SIDEBAR NAVBAR */}
            <AdminNavbar />

            {/* MAIN CONTENT AREA */}
            <main className="admin-main">
                {/* STICKY HEADER WITH LOGGED ADMIN ON RIGHT */}
                <header className="admin-header">
                    <div>
                        <p className="welcome-small">SYSTEM MANAGEMENT</p>
                        <h1>Destinations</h1>
                    </div>

                    <div className="admin-user">
                        <div className="user-avatar">
                            AD
                        </div>
                        <div className="user-info">
                            <strong>Admin</strong>
                        </div>
                    </div>
                </header>

                <section className="dashboard-content">
                    {isAdding ? (
                        /* ADD DESTINATION FORM VIEW (COMPACT, LABELS ON LEFT, NO LOCATION/AREA FIELD) */
                        <div style={{ maxWidth: "460px", margin: "0 auto" }}>
                            <div style={{ marginBottom: "12px" }}>
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    style={{
                                        background: "transparent",
                                        border: "1px solid #cbd5e1",
                                        borderRadius: "6px",
                                        padding: "5px 12px",
                                        fontSize: "11px",
                                        fontWeight: "600",
                                        color: "#475569",
                                        cursor: "pointer",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "5px"
                                    }}
                                >
                                    ← Back to Destinations
                                </button>
                            </div>

                            <div className="destination-form-card" style={{ padding: "16px 20px", borderRadius: "10px" }}>
                                <div className="panel-card-header" style={{ paddingBottom: "10px", marginBottom: "12px" }}>
                                    <h3 style={{ fontSize: "14px" }}>Add New Destination</h3>
                                    <p style={{ fontSize: "10px", margin: "2px 0 0 0" }}>Fill in destination details and upload cover photo</p>
                                </div>

                                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {/* Destination Name */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <label style={{ width: "120px", minWidth: "120px", fontSize: "11px", fontWeight: "600", color: "#334155" }}>
                                            Destination Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            style={{
                                                flex: 1,
                                                padding: "6px 10px",
                                                fontSize: "11.5px",
                                                border: "1px solid #cbd5e1",
                                                borderRadius: "6px",
                                                outline: "none"
                                            }}
                                        />
                                    </div>

                                    {/* Category */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <label style={{ width: "120px", minWidth: "120px", fontSize: "11px", fontWeight: "600", color: "#334155" }}>
                                            Category
                                        </label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            required
                                            style={{
                                                flex: 1,
                                                padding: "6px 10px",
                                                fontSize: "11.5px",
                                                border: "1px solid #cbd5e1",
                                                borderRadius: "6px",
                                                outline: "none",
                                                background: "#ffffff"
                                            }}
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

                                    {/* District */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <label style={{ width: "120px", minWidth: "120px", fontSize: "11px", fontWeight: "600", color: "#334155" }}>
                                            District
                                        </label>
                                        <select
                                            name="district"
                                            value={formData.district}
                                            onChange={handleChange}
                                            required
                                            style={{
                                                flex: 1,
                                                padding: "6px 10px",
                                                fontSize: "11.5px",
                                                border: "1px solid #cbd5e1",
                                                borderRadius: "6px",
                                                outline: "none",
                                                background: "#ffffff"
                                            }}
                                        >
                                            <option value="">Select District</option>
                                            {districts.map((dist) => (
                                                <option key={dist} value={dist}>
                                                    {dist}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Description */}
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                                        <label style={{ width: "120px", minWidth: "120px", fontSize: "11px", fontWeight: "600", color: "#334155", paddingTop: "5px" }}>
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            rows="3"
                                            value={formData.description}
                                            onChange={handleChange}
                                            required
                                            style={{
                                                flex: 1,
                                                padding: "6px 10px",
                                                fontSize: "11.5px",
                                                border: "1px solid #cbd5e1",
                                                borderRadius: "6px",
                                                outline: "none",
                                                fontFamily: "inherit",
                                                resize: "vertical"
                                            }}
                                        ></textarea>
                                    </div>

                                    {/* Cover Photo */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <label style={{ width: "120px", minWidth: "120px", fontSize: "11px", fontWeight: "600", color: "#334155" }}>
                                            Cover Photo
                                        </label>
                                        <input
                                            type="file"
                                            id="destinationImage"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            required
                                            style={{ flex: 1, fontSize: "11px" }}
                                        />
                                    </div>

                                    {/* Map Coordinates */}
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                                        <label style={{ width: "120px", minWidth: "120px", fontSize: "11px", fontWeight: "600", color: "#334155", paddingTop: "4px" }}>
                                            Map Location
                                        </label>
                                        <div style={{ flex: 1 }}>
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
                                                height="170px"
                                            />
                                            <div style={{ display: "flex", gap: "10px", marginTop: "3px", fontSize: "10px", color: "#64748b" }}>
                                                <span><strong>Lat:</strong> {formData.latitude ? Number(formData.latitude).toFixed(4) : "—"}</span>
                                                <span><strong>Lng:</strong> {formData.longitude ? Number(formData.longitude).toFixed(4) : "—"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <label style={{ width: "120px", minWidth: "120px", fontSize: "11px", fontWeight: "600", color: "#334155" }}>
                                            Status
                                        </label>
                                        <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                                            <label style={{ display: "inline-flex", alignItems: "center", gap: "4px", cursor: "pointer", fontSize: "11px", color: "#334155" }}>
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value="Active"
                                                    checked={formData.status === "Active"}
                                                    onChange={handleChange}
                                                />
                                                <span>Active</span>
                                            </label>
                                            <label style={{ display: "inline-flex", alignItems: "center", gap: "4px", cursor: "pointer", fontSize: "11px", color: "#334155" }}>
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value="Inactive"
                                                    checked={formData.status === "Inactive"}
                                                    onChange={handleChange}
                                                />
                                                <span>Inactive</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            style={{
                                                background: "#08D0F5",
                                                color: "#071526",
                                                border: "none",
                                                borderRadius: "6px",
                                                padding: "7px 18px",
                                                fontSize: "11.5px",
                                                fontWeight: "600",
                                                cursor: "pointer"
                                            }}
                                        >
                                            {submitting ? "Adding Destination..." : "+ Add Destination"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    ) : (
                        /* DESTINATIONS LIST VIEW */
                        <div>
                            {/* TOP ACTION BAR */}
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "16px",
                                flexWrap: "wrap",
                                gap: "10px"
                            }}>
                                <div>
                                    <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                                        Registered Destinations
                                    </h2>
                                    <p style={{ fontSize: "11px", color: "#64748b", margin: "2px 0 0 0" }}>
                                        {destinations.length} destination{destinations.length !== 1 ? "s" : ""} published in portal
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setIsAdding(true)}
                                    style={{
                                        background: "#08D0F5",
                                        color: "#071526",
                                        border: "none",
                                        borderRadius: "6px",
                                        padding: "7px 14px",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "6px"
                                    }}
                                >
                                    + Add Destination
                                </button>
                            </div>

                            {/* REGISTERED DESTINATIONS TABLE (FULL WIDTH) */}
                            <div className="destinations-list-card" style={{ width: "100%" }}>
                                <div className="destinations-table-wrapper">
                                    <table className="destinations-table">
                                        <thead>
                                            <tr>
                                                <th>Image</th>
                                                <th>Destination Name</th>
                                                <th>Category</th>
                                                <th>District</th>
                                                <th>Status</th>
                                                <th style={{ textAlign: "center" }}>Actions</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {destinations.length > 0 ? (
                                                destinations.map((dest) => (
                                                    <tr key={dest.destination_id}>
                                                        <td>
                                                            {dest.image ? (
                                                                <img
                                                                    src={
                                                                        dest.image.startsWith("http")
                                                                            ? dest.image
                                                                            : `http://127.0.0.1:8000${dest.image}`
                                                                    }
                                                                    alt={dest.name}
                                                                    className="dest-thumb"
                                                                />
                                                            ) : (
                                                                <div className="dest-thumb-placeholder">🌴</div>
                                                            )}
                                                        </td>
                                                        <td className="fw-bold">{dest.name}</td>
                                                        <td>
                                                            <span className="service-tag">{dest.category}</span>
                                                        </td>
                                                        <td>{dest.district || dest.location}</td>
                                                        <td>
                                                            <span
                                                                className={`status-badge ${
                                                                    dest.status === "Active" ? "approved" : "rejected"
                                                                }`}
                                                            >
                                                                {dest.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ textAlign: "center" }}>
                                                            <div style={{ display: "flex", gap: "6px", justifyContent: "center", alignItems: "center" }}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleEditClick(dest)}
                                                                    style={{
                                                                        background: "transparent",
                                                                        border: "1px solid #cbd5e1",
                                                                        borderRadius: "6px",
                                                                        width: "28px",
                                                                        height: "28px",
                                                                        display: "inline-flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        cursor: "pointer",
                                                                        fontSize: "12px",
                                                                        color: "#334155"
                                                                    }}
                                                                    title="Edit Destination"
                                                                >
                                                                    ✏️
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteDestination(dest)}
                                                                    style={{
                                                                        background: "transparent",
                                                                        border: "1px solid #cbd5e1",
                                                                        borderRadius: "6px",
                                                                        width: "28px",
                                                                        height: "28px",
                                                                        display: "inline-flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        cursor: "pointer",
                                                                        fontSize: "12px",
                                                                        color: "#334155"
                                                                    }}
                                                                    title="Delete Destination"
                                                                >
                                                                    🗑️
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan="6"
                                                        style={{
                                                            textAlign: "center",
                                                            padding: "30px",
                                                            color: "#64748b"
                                                        }}
                                                    >
                                                        {loading ? "Loading destinations..." : "No destinations added yet."}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </main>

            {selectedDestination && (
                <EditDestinationModal
                    destination={selectedDestination}
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedDestination(null);
                    }}
                    onDestinationUpdated={() => {
                        loadDestinations();
                    }}
                />
            )}
        </div>
    );
}