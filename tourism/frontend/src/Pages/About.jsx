import { useNavigate, Link } from "react-router-dom";
import Navbar from "../Components/Navbar";
import heroImg from "../assets/hero.png";
import "../styles/About.css";

export default function About() {
    const navigate = useNavigate();

    const services = [
        {
            icon: "🏖️",
            title: "Tourist Destinations",
            description: "Discover beaches, hill stations, waterfalls, temples, wildlife sanctuaries, and cultural landmarks across all 14 districts of Kerala.",
            linkText: "Explore Destinations",
            linkPath: "/destinations"
        },
        {
            icon: "🏨",
            title: "Accommodation & Stays",
            description: "Explore registered hotels, serene resorts, and boutique homestays with verified amenities, room categories, and transparent pricing.",
            linkText: "Browse Hotels",
            linkPath: "/hotels"
        },
        {
            icon: "🍽️",
            title: "Dining & Restaurants",
            description: "Discover curated restaurants, traditional Kerala cuisine, and local culinary spots situated conveniently close to your travel route.",
            linkText: "View Restaurants",
            linkPath: "/restaurants"
        },
        {
            icon: "🚗",
            title: "Transportation",
            description: "Book verified cabs, rental vehicles, and private transit options with seating capacities tailored to solo, couple, or family travel.",
            linkText: "Find Transport",
            linkPath: "/transportation"
        },
        {
            icon: "🚣",
            title: "Activities & Experiences",
            description: "Participate in scenic backwater boating, guided tea garden walks, bamboo rafting, and cultural adventures hosted by verified local providers.",
            linkText: "Explore Activities",
            linkPath: "/activities"
        },
        {
            icon: "🗺️",
            title: "Trip Planning & Booking",
            description: "Add multiple travel services to your unified Trip Cart, confirm bookings together, and receive instant digital booking vouchers.",
            linkText: "Plan Your Trip",
            linkPath: "/plan-your-trip"
        },
        {
            icon: "✨",
            title: "AI-Powered Recommendations",
            description: "Generate smart, optimized itineraries matching your selected destination, budget range, travel duration, and preferred travel pace.",
            linkText: "Get AI Recommendations",
            linkPath: "/recommend-itinerary"
        },
        {
            icon: "🌿",
            title: "Verified Hidden Spots",
            description: "Uncover off-the-beaten-path waterfalls, viewpoints, and secluded nature trails submitted by tourists and approved by administrators.",
            linkText: "Discover Hidden Spots",
            linkPath: "/hidden-spots"
        },
        {
            icon: "📖",
            title: "Shared Community Itineraries",
            description: "Browse detailed travel itineraries shared by experienced travelers, complete with expense breakdowns, hotel reviews, and practical tips.",
            linkText: "Browse Itineraries",
            linkPath: "/itineraries"
        }
    ];

    const steps = [
        {
            stepNum: "01",
            title: "Discover",
            description: "Explore curated Kerala destinations, hotels, activities, dining, and community-verified hidden spots with comprehensive details."
        },
        {
            stepNum: "02",
            title: "Plan",
            description: "Assemble services into your unified trip cart, adjust travel dates, and use AI-assisted recommendations to design your ideal schedule."
        },
        {
            stepNum: "03",
            title: "Experience",
            description: "Confirm bookings securely, receive verification OTPs in your email, download PDF vouchers, and enjoy a seamless travel journey."
        }
    ];

    const benefits = [
        {
            icon: "🌐",
            title: "Centralized Tourism Ecosystem",
            description: "Say goodbye to juggling dozens of disjointed websites. Find destinations, stays, transit, and experiences all in one intuitive portal."
        },
        {
            icon: "📋",
            title: "Unified Booking & Vouchers",
            description: "Book multiple services in a single checkout, manage cancellations easily from your profile, and download comprehensive PDF vouchers."
        },
        {
            icon: "🤖",
            title: "AI-Assisted Planning",
            description: "Receive practical itinerary suggestions tailored specifically to your chosen destination, budget constraints, and vacation duration."
        },
        {
            icon: "🛡️",
            title: "Admin-Verified Hidden Gems",
            description: "Explore secret nature spots, viewpoints, and waterfalls submitted by tourists and verified by platform administrators for safety."
        },
        {
            icon: "🌴",
            title: "Built for Kerala Travelers",
            description: "Designed from the ground up to showcase and support Kerala's local tourism providers, cultural heritage, and natural beauty."
        }
    ];

    return (
        <div className="about-page-wrapper">
            <Navbar />

            {/* SECTION 1: HERO SECTION */}
            <section
                className="about-hero"
                style={{ backgroundImage: `url(${heroImg})` }}
            >
                <div className="about-hero-overlay">
                    <div className="about-hero-container">
                        <span className="about-hero-badge">Smart Tourism Ecosystem</span>
                        <h1 className="about-hero-title">Discover Kerala with Wandera</h1>
                        <p className="about-hero-subtitle">
                            Your journey, your way — explore, plan, and experience the beauty of Kerala with ease.
                        </p>
                        <p className="about-hero-intro">
                            Wandera is a smart tourism and travel ecosystem platform designed to help tourists discover breathtaking destinations and organize their trips all in one place.
                        </p>
                        <div className="about-hero-actions">
                            <button
                                type="button"
                                className="btn-about-hero-primary"
                                onClick={() => navigate("/destinations")}
                            >
                                Explore Destinations
                            </button>
                            <button
                                type="button"
                                className="btn-about-hero-secondary"
                                onClick={() => navigate("/plan-your-trip")}
                            >
                                Plan Your Trip
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 2: ABOUT WANDERA */}
            <section className="about-section about-overview-section">
                <div className="about-container">
                    <div className="about-section-header">
                        <span className="section-label">Our Mission</span>
                        <h2>A Unified Gateway to Kerala Tourism</h2>
                        <div className="section-divider"></div>
                    </div>

                    <div className="about-overview-content">
                        <div className="about-overview-card">
                            <p className="overview-lead-text">
                                Wandera connects tourists directly with authentic tourism services through a single centralized platform, eliminating the hassle of coordinating across multiple disconnected websites.
                            </p>
                            <p className="overview-body-text">
                                Whether you are searching for tranquil backwaters in Alleppey, misty tea plantations in Munnar, or heritage monuments in Fort Kochi, Wandera empowers you to discover places, explore local services, organize comprehensive travel itineraries, and manage bookings effortlessly.
                            </p>
                            <div className="overview-highlights-row">
                                <div className="highlight-item">
                                    <span className="highlight-icon">📍</span>
                                    <div>
                                        <strong>14 Districts</strong>
                                        <small>Curated Destinations</small>
                                    </div>
                                </div>
                                <div className="highlight-item">
                                    <span className="highlight-icon">🤝</span>
                                    <div>
                                        <strong>Local Providers</strong>
                                        <small>Hotels, Rides & Tours</small>
                                    </div>
                                </div>
                                <div className="highlight-item">
                                    <span className="highlight-icon">⚡</span>
                                    <div>
                                        <strong>Instant OTPs</strong>
                                        <small>Digital Check-in</small>
                                    </div>
                                </div>
                                <div className="highlight-item">
                                    <span className="highlight-icon">📑</span>
                                    <div>
                                        <strong>PDF Vouchers</strong>
                                        <small>Complete Invoices</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 3: OUR SERVICES */}
            <section className="about-section about-services-section">
                <div className="about-container">
                    <div className="about-section-header">
                        <span className="section-label">What We Offer</span>
                        <h2>Our Platform Services</h2>
                        <p className="section-subtext">
                            Explore the core tourism modules integrated directly into the Wandera travel ecosystem.
                        </p>
                        <div className="section-divider"></div>
                    </div>

                    <div className="about-services-grid">
                        {services.map((service, index) => (
                            <div key={index} className="about-service-card">
                                <div className="service-card-icon-box">{service.icon}</div>
                                <h3 className="service-card-title">{service.title}</h3>
                                <p className="service-card-description">{service.description}</p>
                                <button
                                    type="button"
                                    className="btn-service-link"
                                    onClick={() => navigate(service.linkPath)}
                                >
                                    <span>{service.linkText}</span>
                                    <span className="service-link-arrow">→</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 4: HOW WANDERA WORKS */}
            <section className="about-section about-how-it-works-section">
                <div className="about-container">
                    <div className="about-section-header">
                        <span className="section-label">Simple & Intuitive</span>
                        <h2>How Wandera Works</h2>
                        <p className="section-subtext">
                            Plan and experience your journey across God’s Own Country in three straightforward steps.
                        </p>
                        <div className="section-divider"></div>
                    </div>

                    <div className="about-steps-grid">
                        {steps.map((s, index) => (
                            <div key={index} className="about-step-card">
                                <div className="step-number-badge">{s.stepNum}</div>
                                <h3 className="step-card-title">{s.title}</h3>
                                <p className="step-card-description">{s.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 5: WHY CHOOSE WANDERA? */}
            <section className="about-section about-benefits-section">
                <div className="about-container">
                    <div className="about-section-header">
                        <span className="section-label">Key Advantages</span>
                        <h2>Why Choose Wandera?</h2>
                        <p className="section-subtext">
                            A thoughtfully designed platform dedicated to convenient, transparent travel planning.
                        </p>
                        <div className="section-divider"></div>
                    </div>

                    <div className="about-benefits-grid">
                        {benefits.map((b, index) => (
                            <div key={index} className="about-benefit-card">
                                <span className="benefit-icon">{b.icon}</span>
                                <div className="benefit-content">
                                    <h3 className="benefit-title">{b.title}</h3>
                                    <p className="benefit-description">{b.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 6: CALL TO ACTION */}
            <section className="about-cta-section">
                <div className="about-container">
                    <div className="about-cta-card">
                        <span className="cta-small-label">Ready to Explore?</span>
                        <h2 className="cta-heading">Your Kerala Adventure Starts Here</h2>
                        <p className="cta-description">
                            Browse picturesque destinations, build your custom itinerary, or discover hidden natural wonders today.
                        </p>
                        <div className="about-cta-actions">
                            <button
                                type="button"
                                className="btn-cta-primary"
                                onClick={() => navigate("/destinations")}
                            >
                                Explore Destinations
                            </button>
                            <button
                                type="button"
                                className="btn-cta-secondary"
                                onClick={() => navigate("/plan-your-trip")}
                            >
                                Plan Your Trip
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="about-footer">
                <div className="about-container">
                    <div className="about-footer-content">
                        <div className="about-footer-brand">
                            <h3>Wandera</h3>
                            <p>Smart Tourism & Travel Ecosystem Platform</p>
                        </div>
                        <div className="about-footer-links">
                            <Link to="/destinations">Destinations</Link>
                            <Link to="/hotels">Hotels</Link>
                            <Link to="/transportation">Transportation</Link>
                            <Link to="/restaurants">Restaurants</Link>
                            <Link to="/activities">Activities</Link>
                            <Link to="/hidden-spots">Hidden Spots</Link>
                            <Link to="/itineraries">Itineraries</Link>
                        </div>
                    </div>
                    <div className="about-footer-bottom">
                        <p>&copy; {new Date().getFullYear()} Wandera. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
