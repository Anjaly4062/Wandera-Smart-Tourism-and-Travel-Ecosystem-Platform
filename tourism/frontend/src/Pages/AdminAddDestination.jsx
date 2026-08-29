import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../Components/AdminNavbar";
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
        location: "",
        description: "",
        status: "Active",
    });

    const [image, setImage] = useState(null);
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

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
        data.append("location", formData.location);
        data.append("description", formData.description);
        data.append("status", formData.status);

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

            setFormData({
                name: "",
                category: "",
                district: "",
                location: "",
                description: "",
                status: "Active",
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
                        <div className="notification" title="Notifications">
                            🔔<span className="notification-dot"></span>
                        </div>
                        <div className="user-avatar">
                            {adminName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="user-info">
                            <strong>{adminName}</strong>
                            <span className="service-type-badge-pill">🛡️ Super Admin</span>
                        </div>
                        <button
                            className="top-logout-btn"
                            onClick={handleLogout}
                        >
                            🚪 Logout
                        </button>
                    </div>
                </header>

                <section className="dashboard-content">
                    {/* SUMMARY BANNER */}
                    <div className="request-summary-card">
                        <div className="summary-left">
                            <span className="summary-label">KERALA TOURISM PORTAL</span>
                            <h2>Destination Management</h2>
                            <p>
                                Add new tourism destinations, update categories, and publish spots across all 14 districts of Kerala.
                            </p>
                        </div>
                        <div className="summary-badge-pill">
                            <span> Total Published</span>
                            <strong>{destinations.length} Destination{destinations.length !== 1 ? "s" : ""}</strong>
                        </div>
                    </div>

                    {/* TWO COLUMN GRID: FORM & EXISTING DESTINATIONS */}
                    <div className="destinations-columns-grid">
                        {/* LEFT COLUMN: ADD DESTINATION FORM */}
                        <div className="destination-form-card">
                            <div className="panel-card-header">
                                <h3> Add New Destination</h3>
                                <p>Fill in destination details and upload cover photo</p>
                            </div>

                            <form onSubmit={handleSubmit} className="destination-form">
                                <div className="form-group-compact">
                                    <label>Destination Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="e.g. Munnar Hill Station"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-row-two">
                                    <div className="form-group-compact">
                                        <label>Category</label>
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

                                    <div className="form-group-compact">
                                        <label>District</label>
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

                                <div className="form-group-compact">
                                    <label>Location / Area</label>
                                    <input
                                        type="text"
                                        name="location"
                                        placeholder="e.g. Idukki District, Munnar"
                                        value={formData.location}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group-compact">
                                    <label>Description</label>
                                    <textarea
                                        rows="3"
                                        name="description"
                                        placeholder="Brief details about attractions and experiences"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-row-two">
                                    <div className="form-group-compact">
                                        <label>Cover Photo</label>
                                        <input
                                            id="destinationImage"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group-compact">
                                        <label>Status</label>
                                        <div className="status-radio-group">
                                            <label className="radio-label">
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value="Active"
                                                    checked={formData.status === "Active"}
                                                    onChange={handleChange}
                                                />
                                                <span>Active</span>
                                            </label>

                                            <label className="radio-label">
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
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn-submit-destination"
                                >
                                    {submitting ? "Adding Destination..." : "+ Add Destination"}
                                </button>
                            </form>
                        </div>

                        {/* RIGHT COLUMN: REGISTERED DESTINATIONS LIST */}
                        <div className="destinations-list-card">
                            <div className="panel-card-header">
                                <h3> Registered Destinations</h3>
                                <p>Currently published destinations in portal</p>
                            </div>

                            <div className="destinations-table-wrapper">
                                <table className="destinations-table">
                                    <thead>
                                        <tr>
                                            <th>Image</th>
                                            <th>Destination Name</th>
                                            <th>Category</th>
                                            <th>District</th>
                                            <th>Status</th>
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
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="5"
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
                </section>
            </main>
        </div>
    );
}