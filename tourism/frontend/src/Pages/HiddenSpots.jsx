import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../Components/Navbar";
import HiddenSpotSubmitModal from "../Components/HiddenSpotSubmitModal";
import api from "../services/api";
import "../styles/HiddenSpots.css";

/**
 * Extracts and deduplicates all image URLs for a hidden spot
 */
export const getAllSpotImages = (spot) => {
    if (!spot) return [];
    const urls = [];
    const seen = new Set();

    const addUrl = (imgPath) => {
        if (!imgPath || typeof imgPath !== "string") return;
        const fullUrl = imgPath.startsWith("http")
            ? imgPath
            : `http://127.0.0.1:8000${imgPath.startsWith("/") ? "" : "/"}${imgPath}`;

        const cleanPath = fullUrl.split("?")[0];
        if (!seen.has(cleanPath)) {
            seen.add(cleanPath);
            urls.push(fullUrl);
        }
    };

    // Primary image
    if (spot.image) {
        addUrl(spot.image);
    }

    // Multiple photos from images relation
    if (spot.images && Array.isArray(spot.images)) {
        spot.images.forEach((imgObj) => {
            if (imgObj && imgObj.image) {
                addUrl(imgObj.image);
            } else if (typeof imgObj === "string") {
                addUrl(imgObj);
            }
        });
    }

    return urls;
};

/**
 * Compact, interactive photo carousel for a hidden spot card
 */
function SpotCardMediaCarousel({ spot, onOpenLightbox }) {
    const images = getAllSpotImages(spot);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handlePrev = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    if (images.length === 0) {
        return (
            <div className="spot-card-media">
                <div className="spot-card-placeholder">
                    <span>💎</span>
                </div>
                <span className="spot-type-tag">{spot.spot_type}</span>
            </div>
        );
    }

    return (
        <div
            className="spot-card-media"
            style={{ cursor: "pointer" }}
            onClick={() => onOpenLightbox(spot)}
            title="Click to view all photos"
        >
            <img
                src={images[currentIndex]}
                alt={`${spot.name || "Hidden Spot"} - photo ${currentIndex + 1}`}
                className="spot-card-img"
            />

            <span className="spot-type-tag">{spot.spot_type}</span>

            {images.length > 1 && (
                <>
                    <button
                        type="button"
                        className="spot-carousel-arrow spot-carousel-prev"
                        onClick={handlePrev}
                        title="Previous photo"
                        aria-label="Previous photo"
                    >
                        ‹
                    </button>

                    <button
                        type="button"
                        className="spot-carousel-arrow spot-carousel-next"
                        onClick={handleNext}
                        title="Next photo"
                        aria-label="Next photo"
                    >
                        ›
                    </button>

                    <span className="spot-carousel-badge">
                        📷 {currentIndex + 1} / {images.length}
                    </span>

                    <div className="spot-carousel-dots">
                        {images.map((_, idx) => (
                            <span
                                key={idx}
                                className={`spot-carousel-dot ${idx === currentIndex ? "active" : ""}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentIndex(idx);
                                }}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default function HiddenSpots() {
    const navigate = useNavigate();
    const location = useLocation();

    const [spots, setSpots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [gallerySpot, setGallerySpot] = useState(null);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

    useEffect(() => {
        loadApprovedSpots();
    }, []);

    // Check if redirected back after login with ?share=true
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get("share") === "true" || params.get("share") === "1") {
            const userId = localStorage.getItem("user_id");
            if (!userId) {
                navigate("/login", { state: { returnUrl: "/hidden-spots?share=true" } });
            } else {
                setIsSubmitModalOpen(true);
            }
        }
    }, [location.search, navigate]);

    const handleShareSpotClick = (e) => {
        if (e) e.preventDefault();
        const userId = localStorage.getItem("user_id");
        if (!userId) {
            navigate("/login", { state: { returnUrl: "/hidden-spots?share=true" } });
            return;
        }
        setIsSubmitModalOpen(true);
    };

    const loadApprovedSpots = async () => {
        try {
            const res = await api.get("hidden-spots/approved/");
            setSpots(res.data || []);
        } catch (error) {
            console.error("Error loading approved hidden spots:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="hidden-spots-page">
            <Navbar />

            <div className="hidden-spots-container">
                {/* HERO / HEADER SECTION */}
                <section className="hidden-spots-hero">
                    <div className="hidden-hero-left">
                        <h1>Hidden Spots in Kerala</h1>
                        <p>
                            Discover unexplored waterfalls, secret viewpoints, and pristine trails
                            shared by travelers and verified by Wandera.
                        </p>
                    </div>

                    <div className="hidden-hero-actions">
                        <button
                            type="button"
                            className="btn-share-spot"
                            onClick={handleShareSpotClick}
                        >
                            <span>+</span>
                            <span>Share Hidden Spot</span>
                        </button>
                    </div>
                </section>

                {/* ADMIN-APPROVED HIDDEN SPOTS SECTION */}
                <div>
                    {loading ? (
                        <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
                            Loading verified hidden spots...
                        </div>
                    ) : spots.length > 0 ? (
                        <div className="spots-grid">
                            {spots.map((spot) => {
                                const spotImages = getAllSpotImages(spot);

                                return (
                                    <div key={spot.spot_id} className="spot-card">
                                        <SpotCardMediaCarousel
                                            spot={spot}
                                            onOpenLightbox={(selected) => setGallerySpot(selected)}
                                        />

                                        <div className="spot-card-body">
                                            <h3>{spot.name}</h3>

                                            <div className="spot-location-label">
                                                <span>📍</span>
                                                <span>{spot.location}</span>
                                            </div>

                                            <p className="spot-desc">{spot.description}</p>

                                            {spotImages.length > 1 && (
                                                <div className="spot-card-footer">
                                                    <button
                                                        type="button"
                                                        className="btn-card-map"
                                                        onClick={() => setGallerySpot(spot)}
                                                    >
                                                        📷 View all {spotImages.length} photos
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ textAlign: "center", padding: "60px 20px", background: "#1e293b", borderRadius: "10px", border: "1px solid #334155" }}>
                            <span style={{ fontSize: "36px", display: "block", marginBottom: "10px" }}>💎</span>
                            <h3 style={{ margin: "0 0 6px 0", color: "#ffffff" }}>No Hidden Spots Found</h3>
                            <p style={{ margin: "0 0 16px 0", color: "#94a3b8", fontSize: "12.5px" }}>
                                Be the first traveler to share an undiscovered hidden gem in Kerala!
                            </p>
                            <button
                                type="button"
                                className="btn-share-spot"
                                onClick={handleShareSpotClick}
                            >
                                + Share Hidden Spot
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* COMPACT ELEGANT SUBMISSION MODAL */}
            <HiddenSpotSubmitModal
                isOpen={isSubmitModalOpen}
                onClose={() => setIsSubmitModalOpen(false)}
                onSpotSubmitted={loadApprovedSpots}
            />

            {/* MULTIPLE PHOTOS GALLERY LIGHTBOX MODAL */}
            {gallerySpot && (
                <div className="gallery-modal-overlay" onClick={() => setGallerySpot(null)}>
                    <div className="gallery-modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="gallery-modal-header">
                            <div>
                                <h3 style={{ margin: 0, fontSize: "14px", color: "#ffffff" }}>
                                    {gallerySpot.name} — Photos ({getAllSpotImages(gallerySpot).length})
                                </h3>
                                <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#94a3b8" }}>
                                    📍 {gallerySpot.location}
                                </p>
                            </div>
                            <button
                                onClick={() => setGallerySpot(null)}
                                style={{
                                    background: "transparent",
                                    border: "1px solid #475569",
                                    color: "#94a3b8",
                                    borderRadius: "4px",
                                    padding: "4px 8px",
                                    cursor: "pointer",
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="gallery-grid">
                            {getAllSpotImages(gallerySpot).map((imgUrl, i) => (
                                <img
                                    key={i}
                                    src={imgUrl}
                                    alt={`${gallerySpot.name} ${i + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
