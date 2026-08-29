import { NavLink, useNavigate } from "react-router-dom";
import "../styles/AdminNavbar.css";

export default function AdminNavbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    return (
        <aside className="admin-sidebar">
            {/* BRAND / LOGO */}
            <div className="admin-brand">
                <div className="admin-logo-icon">W</div>
                <div className="admin-brand-text">
                    <h2>Wandera</h2>
                    <p>ADMIN PORTAL</p>
                </div>
            </div>

            <div className="admin-divider"></div>

            {/* NAVIGATION MENU (NO ICONS) */}
            <nav className="admin-menu">
                <NavLink
                    to="/admin"
                    end
                    className={({ isActive }) =>
                        isActive ? "admin-menu-item active" : "admin-menu-item"
                    }
                >
                    <span>Dashboard</span>
                </NavLink>

                <NavLink
                    to="/admin/provider-request"
                    className={({ isActive }) =>
                        isActive ? "admin-menu-item active" : "admin-menu-item"
                    }
                >
                    <span>Provider Requests</span>
                </NavLink>

                <NavLink
                    to="/admin/add-destination"
                    className={({ isActive }) =>
                        isActive ? "admin-menu-item active" : "admin-menu-item"
                    }
                >
                    <span>Destinations</span>
                </NavLink>
            </nav>

            <div className="admin-bottom-divider"></div>

            {/* LOGOUT (NO ICON) */}
            <button className="admin-logout" onClick={handleLogout}>
                <span>Logout</span>
            </button>
        </aside>
    );
}