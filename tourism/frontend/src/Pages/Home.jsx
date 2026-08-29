import Navbar from "../components/Navbar";
import hero from "../assets/hero.png";
import "../styles/Home.css";

export default function Home() {
  return (
    <>
      <Navbar />

      <section
        className="hero"
        style={{ backgroundImage: `url(${hero})` }}
      >
        <div className="overlay">

          <div className="hero-content">

            <p className="subtitle">
              Every journey begins with curiosity.
            </p>

            <h1>
              Discover Places <br />
              That Stay With You.
            </h1>

            <p className="description">
              Discover breathtaking destinations, uncover hidden gems,
              craft unforgettable itineraries, and create travel stories
              worth remembering—all from one inspiring place.
            </p>

            <button>
              Explore Destinations
            </button>

          </div>

        </div>
      </section>
    </>
  );
}