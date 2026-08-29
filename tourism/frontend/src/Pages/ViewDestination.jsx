import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../Components/Navbar";
import "../styles/ViewDestination.css";

export default function ViewDestination() {
    const [destinations, setDestinations] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        getDestinations();
    }, []);

    const getDestinations = async () => {
        try {
            const response = await api.get("destination-list/");
            setDestinations(response.data);
        } catch (error) {
            console.error("Error fetching destinations:", error);
        }
    };

    // Filter destinations by Name, Location, Category, and District
    const filteredDestinations = destinations.filter((destination) => {
        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase().trim();
        const nameMatch = destination.name ? destination.name.toLowerCase().includes(query) : false;
        const locationMatch = destination.location ? destination.location.toLowerCase().includes(query) : false;
        const categoryMatch = destination.category ? destination.category.toLowerCase().includes(query) : false;
        const districtMatch = destination.district ? destination.district.toLowerCase().includes(query) : false;
        const areaMatch = destination.area ? destination.area.toLowerCase().includes(query) : false;

        return nameMatch || locationMatch || categoryMatch || districtMatch || areaMatch;
    });

    return (
        <div className="destination-page">
            {/* ================= NAVBAR ================= */}
            <Navbar />

            {/* ================= MAIN CONTAINER ================= */}
            <div className="destination-container">
                {/* ================= HERO SECTION (LEFT TITLE, WHITE SEARCH BAR ON RIGHT) ================= */}
                <section className="hero-section">
                    <div className="hero-flex-container">
                        <h2 className="hero-title">Explore Destinations</h2>

                        {/* WHITE SEARCH BAR WITH SEARCH ICON AT THE END */}
                        <div className="white-search-bar">
                            <input
                                type="text"
                                placeholder="Search by name, location, category, district..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="white-search-input"
                            />
                            {searchQuery && (
                                <button
                                    className="clear-search-btn-dark"
                                    onClick={() => setSearchQuery("")}
                                    title="Clear search"
                                >
                                    ✕
                                </button>
                            )}
                            <span className="search-icon-end">🔍</span>
                        </div>
                    </div>
                </section>

                {/* ================= DESTINATION GRID ================= */}
                <div className="destination-grid">
                    {filteredDestinations.length > 0 ? (
                        filteredDestinations.map((destination) => (
                            <div
                                className="destination-card"
                                key={destination.destination_id}
                            >
                                {/* ================= IMAGE ================= */}
                                <div className="image-wrapper">
                                    <img
                                        src={
                                            destination.image
                                                ? destination.image.startsWith("http")
                                                    ? destination.image
                                                    : `http://127.0.0.1:8000${destination.image}`
                                                : ""
                                        }
                                        alt={destination.name}
                                        className="destination-image"
                                    />
                                    <span className="category-badge">
                                        {destination.category}
                                    </span>
                                </div>

                                {/* ================= CONTENT ================= */}
                                <div className="destination-content">
                                    <h3>{destination.name}</h3>

                                    {/* FULL DESCRIPTION */}
                                    <p className="description">
                                        {destination.description}
                                    </p>

                                    {/* ================= VIEW BUTTON ================= */}
                                    <Link
                                        to={`/view/${destination.destination_id}`}
                                        className="view-btn"
                                    >
                                        View Details →
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty">
                            <h2>
                                {searchQuery
                                    ? `No destinations found matching "${searchQuery}"`
                                    : "No Destinations Available"}
                            </h2>
                            {searchQuery && (
                                <p style={{ marginTop: "8px", fontSize: "12px", color: "#a3b8ad" }}>
                                    Try searching by name, location, category, or district.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}