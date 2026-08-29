import { NavLink, useNavigate } from "react-router-dom";
import "../styles/ServiceProviderNavbar.css";

export default function ServiceProviderNavbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    return (
        <aside className="provider-sidebar">
            {/* BRAND */}
            <div className="provider-brand">
                <div className="provider-brand-text">
                    <h2>Wandera</h2>
                    <p>PROVIDER</p>
                </div>
            </div>

            {/* DIVIDER */}
            <div className="provider-divider"></div>

            {/* MENU */}
            <nav className="provider-menu">
                <NavLink
                    to="/provider-home"
                    className={({ isActive }) =>
                        isActive ? "provider-menu-item active" : "provider-menu-item"
                    }
                >
                    <span>Dashboard</span>
                </NavLink>

                <NavLink
                    to="/provider/profile"
                    className={({ isActive }) =>
                        isActive ? "provider-menu-item active" : "provider-menu-item"
                    }
                >
                    <span>My Profile</span>
                </NavLink>

                <NavLink
                    to="/provider/add-service"
                    className={({ isActive }) =>
                        isActive ? "provider-menu-item active" : "provider-menu-item"
                    }
                >
                    <span>Add Service</span>
                </NavLink>

                <NavLink
                    to="/provider/my-services"
                    className={({ isActive }) =>
                        isActive ? "provider-menu-item active" : "provider-menu-item"
                    }
                >
                    <span>My Services</span>
                </NavLink>

                <NavLink
                    to="/provider/bookings"
                    className={({ isActive }) =>
                        isActive ? "provider-menu-item active" : "provider-menu-item"
                    }
                >
                    <span>Bookings</span>
                </NavLink>

                <NavLink
                    to="/provider/availability"
                    className={({ isActive }) =>
                        isActive ? "provider-menu-item active" : "provider-menu-item"
                    }
                >
                    <span>Availability</span>
                </NavLink>

                <NavLink
                    to="/provider/reviews"
                    className={({ isActive }) =>
                        isActive ? "provider-menu-item active" : "provider-menu-item"
                    }
                >
                    <span>Reviews</span>
                </NavLink>
            </nav>

            {/* BOTTOM DIVIDER */}
            <div className="provider-bottom-divider"></div>

            {/* LOGOUT BUTTON */}
            <button className="provider-logout" onClick={handleLogout}>
                <span>Logout</span>
            </button>
        </aside>
    );
}