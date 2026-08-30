import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../Components/AdminNavbar";
import api from "../services/api";
import "../styles/AdminHome.css";

export default function AdminHome() {
    const navigate = useNavigate();
    const adminName = localStorage.getItem("name") || "Admin";

    const [stats, setStats] = useState({
        tourists_count: 0,
        providers_count: 0,
        destinations_count: 0,
        pending_requests_count: 0,
        bookings_count: 0,
        pending_hidden_spots_count: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAdminStats();
    }, []);

    const loadAdminStats = async () => {
        try {
            const res = await api.get("admin-stats/");
            if (res.data) {
                setStats({
                    tourists_count: res.data.tourists_count || 0,
                    providers_count: res.data.providers_count || 0,
                    destinations_count: res.data.destinations_count || 0,
                    pending_requests_count: res.data.pending_requests_count || 0,
                    bookings_count: res.data.bookings_count || 0,
                    pending_hidden_spots_count: res.data.pending_hidden_spots_count || 0
                });
            }
        } catch (error) {
            console.error("Error loading admin stats:", error);
        } finally {
            setLoading(false);
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

            {/* MAIN DASHBOARD CONTENT */}
            <main className="admin-main">
                {/* HEADER WITH LOGGED ADMIN ON RIGHT */}
                <header className="admin-header">
                    <div>
                        <p className="welcome-small">Welcome back</p>
                        <h1>Admin Dashboard</h1>
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
                    {/* WELCOME BANNER CARD */}
                    <div className="welcome-card">
                        <div className="welcome-text">
                            <span className="welcome-label">WANDERA SYSTEM CONTROL PORTAL</span>
                            <h2>Overview & Management</h2>
                            <p>
                                Monitor tourists, approve service provider registrations, and manage destinations across Kerala.
                            </p>
                        </div>

                        <div className="welcome-decoration">
                            <div className="circle-one"></div>
                            <div className="circle-two"></div>
                            <div className="decoration-icon">✦</div>
                        </div>
                    </div>

                    {/* DYNAMIC REAL-TIME STATS GRID (TOURISTS, SERVICE PROVIDERS, DESTINATIONS, PENDING REQUESTS) */}
                    <div className="stats-grid">
                        <div
                            className="stat-card"
                            onClick={() => navigate("/admin/tourists")}
                            role="button"
                            tabIndex={0}
                        >
                            <div className="stat-icon service-icon">👤</div>
                            <div>
                                <span>Tourists</span>
                                <h3>{loading ? "..." : stats.tourists_count}</h3>
                            </div>
                        </div>

                        <div
                            className="stat-card"
                            onClick={() => navigate("/admin/service-providers")}
                            role="button"
                            tabIndex={0}
                        >
                            <div className="stat-icon booking-icon">💼</div>
                            <div>
                                <span>Service Providers</span>
                                <h3>{loading ? "..." : stats.providers_count}</h3>
                            </div>
                        </div>

                        <div
                            className="stat-card"
                            onClick={() => navigate("/admin/add-destination")}
                            role="button"
                            tabIndex={0}
                        >
                            <div className="stat-icon pending-icon">📍</div>
                            <div>
                                <span>Destinations</span>
                                <h3>{loading ? "..." : stats.destinations_count}</h3>
                            </div>
                        </div>

                        <div
                            className="stat-card"
                            onClick={() => navigate("/admin/provider-request?filter=pending")}
                            role="button"
                            tabIndex={0}
                        >
                            <div className="stat-icon review-icon">◷</div>
                            <div>
                                <span>Pending Requests</span>
                                <h3>{loading ? "..." : stats.pending_requests_count}</h3>
                            </div>
                        </div>

                        <div
                            className="stat-card"
                            onClick={() => navigate("/admin/bookings")}
                            role="button"
                            tabIndex={0}
                        >
                            <div className="stat-icon booking-icon">📅</div>
                            <div>
                                <span>Bookings</span>
                                <h3>{loading ? "..." : stats.bookings_count}</h3>
                            </div>
                        </div>

                        <div
                            className="stat-card"
                            onClick={() => navigate("/admin/hidden-spots")}
                            role="button"
                            tabIndex={0}
                        >
                            <div className="stat-icon pending-icon">💎</div>
                            <div>
                                <span>Hidden Spots</span>
                                <h3>{loading ? "..." : stats.pending_hidden_spots_count}</h3>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}