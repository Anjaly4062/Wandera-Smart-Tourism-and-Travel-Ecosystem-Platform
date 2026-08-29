import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../Components/AdminNavbar";
import api from "../services/api";
import "../styles/AdminProviderRequest.css";

function AdminProviderRequests() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const adminName = localStorage.getItem("name") || "Admin";

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            const res = await api.get("provider-requests/");
            setRequests(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    const acceptRequest = async (id) => {
        try {
            await api.post(`provider-request/${id}/accept/`);
            alert("Provider Approved Successfully!");
            loadRequests();
        } catch (error) {
            console.log(error);
        }
    };

    const rejectRequest = async (id) => {
        try {
            await api.post(`provider-request/${id}/reject/`);
            alert("Request Rejected");
            loadRequests();
        } catch (error) {
            console.log(error);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    const pendingCount = requests.filter(
        (r) => r.approval_status === "Pending"
    ).length;

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
                        <h1>Provider Requests</h1>
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
                            <span className="summary-label">APPROVAL QUEUE</span>
                            <h2>Service Provider Registrations</h2>
                            <p>
                                Review submitted documents, business licenses, and certificates to approve or reject provider accounts.
                            </p>
                        </div>
                        <div className="summary-badge-pill">
                            <span>◷ Pending Approval</span>
                            <strong>{pendingCount} Request{pendingCount !== 1 ? "s" : ""}</strong>
                        </div>
                    </div>

                    {/* REQUESTS TABLE CONTAINER WITH HORIZONTAL SCROLL FOR FULL VISIBILITY */}
                    <div className="table-wrapper-card">
                        <table className="provider-request-table">
                            <thead>
                                <tr>
                                    <th>Applicant Name</th>
                                    <th>Email Address</th>
                                    <th>Business Name</th>
                                    <th>Service Type</th>
                                    <th>Status</th>
                                    <th>Certificate</th>
                                    <th style={{ textAlign: "center" }}>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {requests.length > 0 ? (
                                    requests.map((item) => (
                                        <tr key={item.request_id}>
                                            <td className="fw-bold">{item.full_name}</td>
                                            <td>{item.email}</td>
                                            <td>{item.business_name}</td>
                                            <td>
                                                <span className="service-tag">{item.service_type}</span>
                                            </td>
                                            <td>
                                                <span
                                                    className={`status-badge ${item.approval_status.toLowerCase()}`}
                                                >
                                                    {item.approval_status}
                                                </span>
                                            </td>
                                            <td>
                                                {item.certificate ? (
                                                    <a
                                                        href={`http://127.0.0.1:8000${item.certificate}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="cert-link"
                                                    >
                                                        📄 View Certificate
                                                    </a>
                                                ) : (
                                                    <span className="no-cert">No File</span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                <div className="action-buttons">
                                                    {item.approval_status === "Pending" ? (
                                                        <>
                                                            <button
                                                                className="accept-btn"
                                                                onClick={() => acceptRequest(item.request_id)}
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                className="reject-btn"
                                                                onClick={() => rejectRequest(item.request_id)}
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="processed-tag">
                                                            {item.approval_status === "Approved" || item.approval_status === "Accepted"
                                                                ? "✓ Approved"
                                                                : "✗ Rejected"}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            style={{
                                                textAlign: "center",
                                                padding: "40px 20px",
                                                color: "#64748b"
                                            }}
                                        >
                                            No pending provider requests found.
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

export default AdminProviderRequests;