import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef } from "react";
import "../styles/Navbar.css";

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const [userId, setUserId] = useState(localStorage.getItem("user_id"));
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showDestDropdown, setShowDestDropdown] = useState(false);
    const destTimeoutRef = useRef(null);

    const isDestActive = [
        "/destinations",
        "/hotels",
        "/transportation",
        "/restaurants",
        "/activities"
    ].includes(location.pathname) || location.pathname.startsWith("/view/");

    const handleMouseEnterDest = () => {
        if (destTimeoutRef.current) {
            clearTimeout(destTimeoutRef.current);
        }
        setShowDestDropdown(true);
    };

    const handleMouseLeaveDest = () => {
        destTimeoutRef.current = setTimeout(() => {
            setShowDestDropdown(false);
        }, 150);
    };

    const handleProfileClick = () => {
        if (userId) {
            navigate("/my-profile");
        } else {
            alert("Please login first to access your profile.");
            navigate("/login");
        }
        setShowProfileMenu(false);
    };

    const handleLogout = () => {
        localStorage.clear();
        setUserId(null);
        setShowProfileMenu(false);
        navigate("/");
    };

    return (
        <nav className="navbar">
            <div className="logo" onClick={() => navigate("/")}>Wandera</div>

            <ul className="nav-links">
                <li>
                    <NavLink to="/" end>
                        Home
                    </NavLink>
                </li>

                <li 
                    className="nav-dropdown-container"
                    onMouseEnter={handleMouseEnterDest}
                    onMouseLeave={handleMouseLeaveDest}
                >
                    <NavLink
                        to="/destinations"
                        className={`nav-dropdown-trigger ${isDestActive ? "active" : ""}`}
                        onClick={() => setShowDestDropdown(false)}
                    >
                        Destinations <span className="dropdown-caret">▼</span>
                    </NavLink>

                    {showDestDropdown && (
                        <div 
                            className="nav-dropdown-menu"
                            onMouseEnter={handleMouseEnterDest}
                            onMouseLeave={handleMouseLeaveDest}
                        >
                            <NavLink
                                to="/hotels"
                                style={{ color: "#000000" }}
                                className={({ isActive }) =>
                                    `dropdown-nav-text-item ${isActive ? "active-sub-item" : ""}`
                                }
                                onClick={() => setShowDestDropdown(false)}
                            >
                                Hotels
                            </NavLink>

                            <NavLink
                                to="/transportation"
                                style={{ color: "#000000" }}
                                className={({ isActive }) =>
                                    `dropdown-nav-text-item ${isActive ? "active-sub-item" : ""}`
                                }
                                onClick={() => setShowDestDropdown(false)}
                            >
                                Transportation
                            </NavLink>

                            <NavLink
                                to="/restaurants"
                                style={{ color: "#000000" }}
                                className={({ isActive }) =>
                                    `dropdown-nav-text-item ${isActive ? "active-sub-item" : ""}`
                                }
                                onClick={() => setShowDestDropdown(false)}
                            >
                                Restaurants
                            </NavLink>

                            <NavLink
                                to="/activities"
                                style={{ color: "#000000" }}
                                className={({ isActive }) =>
                                    `dropdown-nav-text-item ${isActive ? "active-sub-item" : ""}`
                                }
                                onClick={() => setShowDestDropdown(false)}
                            >
                                Activities
                            </NavLink>
                        </div>
                    )}
                </li>

                <li>
                    <NavLink to="/hidden-spots">
                        Hidden Spots
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/itineraries">
                        Itineraries
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/about">
                        About
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/plan-your-trip">
                        My Trip
                    </NavLink>
                </li>

                {!userId && (
                    <>
                        <li>
                            <NavLink to="/login">
                                Login
                            </NavLink>
                        </li>

                        <li>
                            <NavLink to="/signup">
                                Signup
                            </NavLink>
                        </li>
                    </>
                )}

                <li className="profile-menu-container">
                    <button
                        className="profile-button"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                        My Profile
                    </button>

                    {showProfileMenu && (
                        <div className="profile-dropdown">
                            {userId ? (
                                <>
                                    <button
                                        className="dropdown-item"
                                        onClick={handleProfileClick}
                                    >
                                        👤 <span>Profile</span>
                                    </button>

                                    <button
                                        className="dropdown-item"
                                        onClick={() => {
                                            setShowProfileMenu(false);
                                            navigate("/plan-your-trip");
                                        }}
                                    >
                                        🗺️ <span>My Trip Plan</span>
                                    </button>

                                    <button
                                        className="logout-dropdown-btn"
                                        onClick={handleLogout}
                                    >
                                        🔒 Logout
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="dropdown-item"
                                    onClick={() => {
                                        setShowProfileMenu(false);
                                        navigate("/login");
                                    }}
                                >
                                    🔑 <span>Login</span>
                                </button>
                            )}
                        </div>
                    )}
                </li>
            </ul>
        </nav>
    );
}