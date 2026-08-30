import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../Components/AdminNavbar";
import api from "../services/api";
import "../styles/AdminProviderRequest.css";

export default function AdminTourists() {
    const navigate = useNavigate();
    const [tourists, setTourists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTourists();
    }, []);

    const fetchTourists = async () => {
        try {
            setLoading(true);
            const res = await api.get("tourists/");
            setTourists(res.data);
        } catch (error) {
            console.error("Error fetching tourists:", error);
        } finally {
            setLoading(false);
        }
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
                        <h1>Registered Tourists</h1>
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
                            <span className="summary-label">USER DIRECTORY</span>
                            <h2>Registered Tourist Accounts</h2>
                            <p>
                                View and manage all registered tourist accounts across Wandera portal.
                            </p>
                        </div>
                        <div className="summary-badge-pill">
                            <span>Total Registered</span>
                            <strong>{tourists.length} Tourist{tourists.length !== 1 ? "s" : ""}</strong>
                        </div>
                    </div>

                    {/* TOURISTS TABLE CONTAINER */}
                    <div className="table-wrapper-card">
                        <table className="provider-request-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Tourist Name</th>
                                    <th>Email Address</th>
                                    <th>Phone Number</th>
                                    <th>Account Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            style={{
                                                textAlign: "center",
                                                padding: "36px",
                                                color: "#64748b"
                                            }}
                                        >
                                            Loading tourist records...
                                        </td>
                                    </tr>
                                ) : tourists.length > 0 ? (
                                    tourists.map((item, index) => (
                                        <tr key={item.user_id || index}>
                                            <td style={{ color: "#64748b" }}>{index + 1}</td>
                                            <td className="fw-bold">{item.full_name}</td>
                                            <td>{item.email}</td>
                                            <td>{item.phone ? item.phone : <span style={{ color: "#94a3b8" }}>Not provided</span>}</td>
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
                                            colSpan="5"
                                            style={{
                                                textAlign: "center",
                                                padding: "40px 20px",
                                                color: "#64748b"
                                            }}
                                        >
                                            No registered tourists found.
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
