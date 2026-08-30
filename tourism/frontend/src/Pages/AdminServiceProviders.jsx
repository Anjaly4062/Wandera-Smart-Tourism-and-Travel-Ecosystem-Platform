import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../Components/AdminNavbar";
import api from "../services/api";
import "../styles/AdminProviderRequest.css";

export default function AdminServiceProviders() {
    const navigate = useNavigate();
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [serviceTypeFilter, setServiceTypeFilter] = useState("all");

    useEffect(() => {
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        try {
            setLoading(true);
            const res = await api.get("service-providers/");
            setProviders(res.data || []);
        } catch (error) {
            console.error("Error fetching service providers:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProviders = providers.filter((item) => {
        return (
            serviceTypeFilter === "all" ||
            (item.service_type && item.service_type.toLowerCase() === serviceTypeFilter.toLowerCase())
        );
    });

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
                        <h1>Service Providers</h1>
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
                    {/* SUMMARY BANNER */}
                    <div className="request-summary-card">
                        <div className="summary-left">
                            <span className="summary-label">SERVICE PARTNERS</span>
                            <h2>Approved Service Providers</h2>
                            <p>
                                Comprehensive directory of verified service providers offering hotels, dining, transportation, and activities.
                            </p>
                        </div>
                        <div className="summary-badge-pill">
                            <span>Total Active</span>
                            <strong>{providers.length} Provider{providers.length !== 1 ? "s" : ""}</strong>
                        </div>
                    </div>

                    {/* FILTER ROW (SERVICE TYPE) */}
                    <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>
                            Filter by Service Type:
                        </label>
                        <select
                            value={serviceTypeFilter}
                            onChange={(e) => setServiceTypeFilter(e.target.value)}
                            style={{
                                padding: "6px 12px",
                                borderRadius: "6px",
                                border: "1px solid #cbd5e1",
                                fontSize: "12px",
                                background: "#ffffff",
                                outline: "none",
                                cursor: "pointer"
                            }}
                        >
                            <option value="all">All Service Types</option>
                            <option value="Hotel">Hotels</option>
                            <option value="Restaurant">Restaurants</option>
                            <option value="Transportation">Transportation</option>
                            <option value="Activity">Activities</option>
                        </select>
                    </div>

                    {/* PROVIDERS TABLE CONTAINER */}
                    <div className="table-wrapper-card">
                        <table className="provider-request-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Business Name</th>
                                    <th>Owner Name</th>
                                    <th>Service Type</th>
                                    <th>Destination</th>
                                    <th>District / Location</th>
                                    <th>Contact Info</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            style={{
                                                textAlign: "center",
                                                padding: "36px",
                                                color: "#64748b"
                                            }}
                                        >
                                            Loading service providers...
                                        </td>
                                    </tr>
                                ) : filteredProviders.length > 0 ? (
                                    filteredProviders.map((item, index) => (
                                        <tr key={item.provider_id || index}>
                                            <td style={{ color: "#64748b" }}>{index + 1}</td>
                                            <td className="fw-bold">{item.business_name}</td>
                                            <td>{item.full_name || "-"}</td>
                                            <td>
                                                <span className="service-tag">{item.service_type}</span>
                                            </td>
                                            <td>{item.destination_name !== "None" ? item.destination_name : <span style={{ color: "#94a3b8" }}>General</span>}</td>
                                            <td>{item.district || item.location || "-"}</td>
                                            <td>
                                                <div style={{ fontSize: "12px" }}>
                                                    <div>{item.email}</div>
                                                    {item.phone && (
                                                        <div style={{ color: "#64748b", fontSize: "11px", marginTop: "2px" }}>
                                                            📞 {item.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <span
                                                    className={`status-badge ${item.status === "active" ? "approved" : "rejected"}`}
                                                >
                                                    {item.status ? item.status.toUpperCase() : "ACTIVE"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            style={{
                                                textAlign: "center",
                                                padding: "40px 20px",
                                                color: "#64748b"
                                            }}
                                        >
                                            No service providers found matching filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}
