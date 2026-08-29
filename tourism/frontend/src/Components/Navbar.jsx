import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/Navbar.css";

export default function Navbar() {
    const navigate = useNavigate();

    const [userId, setUserId] = useState(localStorage.getItem("user_id"));
    const [showProfileMenu, setShowProfileMenu] = useState(false);

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
            <div className="logo">Wandera</div>

            <ul className="nav-links">
                <li>
                    <NavLink to="/" end>
                        Home
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/destinations">
                        Destinations
                    </NavLink>
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