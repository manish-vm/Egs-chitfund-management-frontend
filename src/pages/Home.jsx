// src/pages/Home.jsx
import React, { useEffect, useState, useRef } from "react";
import Page from "../components/Page";
import PublicChitSchemes from "./PublicChitSchemes";
import { getAllImages } from "../services/userService"; // fetch slideshow images (same used by Dashboard)
import "./style.css";

/**
 * Home page
 * - fetches slideshow images from backend via getAllImages()
 * - falls back to local/static images if backend fetch fails or returns empty
 * - mobile-friendly responsive layout (uses existing bootstrap classes + small tweaks)
 */

const FALLBACK_IMAGES = [
  "https://png.pngtree.com/thumb_back/fh260/back_our/20190621/ourmid/pngtree-investment-financial-management-financial-background-image_190950.jpg",
  "https://png.pngtree.com/thumb_back/fh260/background/20221014/pngtree-stack-of-gold-coins-on-dark-background-concept-finance-gold-photo-image_34226222.jpg",
  "https://static.vecteezy.com/system/resources/thumbnails/014/907/576/small/businessman-s-hand-money-coins-in-a-glass-jar-finance-and-banking-fund-growth-and-savings-concept-proportional-money-management-to-spend-effectively-planning-for-savings-for-the-future-photo.jpg",
  "https://png.pngtree.com/thumb_back/fh260/background/20250906/pngtree-3d-rendered-financial-payment-and-consumption-scene-illustration-image_18860635.webp"
];

const pickImageUrl = (img) => {
  if (!img) return null;
  if (typeof img === "string") return img;
  // if API returns base64 data
  if (img.data) {
    const d = img.data;
    // if already has data:<mime>;base64,... return as-is
    if (typeof d === "string" && d.startsWith("data:")) return d;
    // otherwise assume base64 jpeg
    return `data:image/jpeg;base64,${d}`;
  }
  if (img.url) return img.url;
  if (img.path) return img.path;
  if (img.filename && img.host) return `${img.host}/${img.filename}`;
  return null;
};

const Home = () => {
  const [slides, setSlides] = useState(FALLBACK_IMAGES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await getAllImages();
        // accept multiple shapes: array, { data: [...] }, { images: [...] }, { data: { images } }
        const arr =
          Array.isArray(res) ? res :
          Array.isArray(res?.data) ? res.data :
          Array.isArray(res?.images) ? res.images :
          Array.isArray(res?.data?.images) ? res.data.images :
          [];

        const picked = arr
          .map((i) => pickImageUrl(i))
          .filter(Boolean);

        if (mounted && picked.length > 0) {
          setSlides(picked);
          setCurrentSlide(0);
        } else {
          // leave fallback slides
          setSlides(FALLBACK_IMAGES);
        }
      } catch (err) {
        console.warn("Failed to load slideshow images, using fallback", err);
        setSlides(FALLBACK_IMAGES);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  // autoplay slideshow
  useEffect(() => {
    if (!slides || slides.length === 0) return;
    intervalRef.current = setInterval(() => {
      setCurrentSlide((s) => (s + 1) % slides.length);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, [slides]);

  const gotoSlide = (idx) => {
    clearInterval(intervalRef.current);
    setCurrentSlide(Math.max(0, Math.min(idx, slides.length - 1)));
    // restart autoplay
    intervalRef.current = setInterval(() => {
      setCurrentSlide((s) => (s + 1) % slides.length);
    }, 4000);
  };

  const currentBg = slides[currentSlide] || FALLBACK_IMAGES[0];

  return (
    <>
      {/* CDN links (ok to keep once in index.html ideally) */}
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css"
        rel="stylesheet"
      />
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

      <Page title="EGS Chit Fund - Investment Platform">
        {/* HERO */}
        <section
          id="hero"
          className="relative w-full min-h-screen d-flex align-items-center justify-content-center text-white"
          style={{
            paddingTop: 90,
            paddingBottom: 30,
            backgroundImage: `linear-gradient(135deg, rgba(12, 49, 118, 0.35), rgba(22,36,60,0.25)), url(${currentBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            transition: "background-image 450ms ease-in-out"
          }}
        >
          <div className="container text-center">
            <h1 className="welcome-header">
              Welcome to <span className="sp-egs">EGS Chit Fund</span>
            </h1>

            <h2 className="welcome-sub"> Making your investment easy. </h2>
            <center><img src="https://cdn-icons-png.flaticon.com/512/10384/10384161.png" height="80px" width="80px" alt="money_icon"/></center>
           <p className="welcome-sub" > Secure your future with smart and trusted chit fund investments. </p>

            <div className="d-flex justify-content-center mb-3">
              <a
                href="/register"
                className="btn btn-light btn-lg px-5 py-2 fw-semibold text-primary shadow"
                style={{ borderRadius: "30px", fontWeight: 600 }}
              >
                Sign Up Today
              </a>
            </div>

            {/* pager dots */}
            <div className="d-flex justify-content-center mt-2" aria-hidden={slides.length <= 1}>
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={`mx-1 pager-dot ${i === currentSlide ? "active" : ""}`}
                  onClick={() => gotoSlide(i)}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    border: "none",
                    outline: "none",
                    cursor: "pointer",
                    background: i === currentSlide ? "#2563EB" : "rgba(255,255,255,0.6)"
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        <main id="main">
          {/* ABOUT */}
          <section id="about" className="py-5 bg-light">
            <div className="container">
              <div className="text-center mb-5">
                <h2 className="fw-bold text-uppercase">About</h2>
                <h3 className="text-primary fw-semibold">What is <span className="text-dark">EGS Chit Fund?</span></h3>
              </div>

              <div className="row align-items-center mb-5">
                <div className="col-lg-6 mb-4">
                  <img src="/static/images/about1.jpg" className="img-fluid rounded shadow" alt="About EGS" />
                </div>

                <div className="col-lg-6">
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item bg-transparent border-0 d-flex">
                      <i className="bi bi-check-circle-fill text-primary me-3"></i>
                      A group of members contribute monthly into a pool.
                    </li>
                    <li className="list-group-item bg-transparent border-0 d-flex">
                      <i className="bi bi-check-circle-fill text-primary me-3"></i>
                      A reverse auction is conducted for the pool.
                    </li>
                    <li className="list-group-item bg-transparent border-0 d-flex">
                      <i className="bi bi-check-circle-fill text-primary me-3"></i>
                      Members who haven't received the pool are eligible to bid.
                    </li>
                    <li className="list-group-item bg-transparent border-0 d-flex">
                      <i className="bi bi-check-circle-fill text-primary me-3"></i>
                      Members pay every cycle ensuring fund availability.
                    </li>
                  </ul>
                </div>
              </div>

              <hr className="my-4" />

              <div className="row align-items-center">
                <div className="col-lg-6">
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item bg-transparent border-0 d-flex">
                      <i className="bi bi-check-circle-fill text-success me-3"></i>
                      5 members contribute ₹10,000 → Pool of ₹50,000.
                    </li>
                    <li className="list-group-item bg-transparent border-0 d-flex">
                      <i className="bi bi-check-circle-fill text-success me-3"></i>
                      A member bids ₹4,000 → receives ₹46,000.
                    </li>
                    <li className="list-group-item bg-transparent border-0 d-flex">
                      <i className="bi bi-check-circle-fill text-success me-3"></i>
                      Remaining ₹4,000 is split among others.
                    </li>
                    <li className="list-group-item bg-transparent border-0 d-flex">
                      <i className="bi bi-check-circle-fill text-success me-3"></i>
                      Non-winners pay ₹9,000 next round.
                    </li>
                    <li className="list-group-item bg-transparent border-0 d-flex">
                      <i className="bi bi-check-circle-fill text-success me-3"></i>
                      Winner repays ₹10,000 next cycle.
                    </li>
                  </ul>
                </div>

                <div className="col-lg-6 mb-4">
                  <img src="/static/images/about2.jpg" className="img-fluid rounded shadow" alt="Working model" />
                </div>
              </div>
            </div>
          </section>

          {/* SERVICES */}
          <section id="services" className="py-5" style={{ background: "linear-gradient(to right, #f5f7fa, #c3cfe2)" }}>
            <div className="container">
              <div className="text-center mb-5">
                <h2 className="fw-bold text-dark">Our Services</h2>
                <p className="text-muted fs-5">Explore how EGS Fund works</p>
              </div>

              <div className="row g-4">
                <div className="col-md-6 col-lg-3">
                  <div className="card h-100 border-0 shadow-sm text-center p-4 rounded-4">
                    <div className="mb-3 text-primary fs-1"><i className="bi bi-house-door-fill"></i></div>
                    <h5 className="fw-semibold mb-2">Join House</h5>
                    <p className="text-secondary small">Join a house by paying the entry amount.</p>
                  </div>
                </div>

                <div className="col-md-6 col-lg-3">
                  <div className="card h-100 border-0 shadow-sm text-center p-4 rounded-4">
                    <div className="mb-3 text-success fs-1"><i className="bi bi-bar-chart-fill"></i></div>
                    <h5 className="fw-semibold mb-2">Bid House</h5>
                    <p className="text-secondary small">View your house and place bids from the Portfolio section.</p>
                  </div>
                </div>

                <div className="col-md-6 col-lg-3">
                  <div className="card h-100 border-0 shadow-sm text-center p-4 rounded-4">
                    <div className="mb-3 text-warning fs-1"><i className="bi bi-hammer"></i></div>
                    <h5 className="fw-semibold mb-2">Submit Bid</h5>
                    <p className="text-secondary small">Submit your bid (not more than 50% of pool amount).</p>
                  </div>
                </div>

                <div className="col-md-6 col-lg-3">
                  <div className="card h-100 border-0 shadow-sm text-center p-4 rounded-4">
                    <div className="mb-3 text-danger fs-1"><i className="bi bi-trophy-fill"></i></div>
                    <h5 className="fw-semibold mb-2">Win Bid</h5>
                    <p className="text-secondary small">Winners receive funds with email notification.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* PUBLIC CHIT SCHEMES */}
          <PublicChitSchemes />

          {/* FAQ */}
          <section id="faq" className="py-5" style={{ backgroundColor: "#f0f4f8" }}>
            <div className="container my-5">
              <div className="text-center mb-5">
                <h2 className="fw-bold text-primary">F.A.Q</h2>
                <h3 className="text-secondary">Frequently Asked <span className="text-info">Questions</span></h3>
              </div>

              <div className="faq-list">
                <div className="faq-item shadow-sm mb-3 rounded p-3">
                  <h4 className="fw-semibold mb-2"><i className="bi bi-house-door me-2 text-primary"></i> How to Join a House?</h4>
                  <p>Add money to your wallet and join a house from the Home section.</p>
                </div>

                <div className="faq-item shadow-sm mb-3 rounded p-3">
                  <h4 className="fw-semibold mb-2"><i className="bi bi-wallet2 me-2 text-success"></i> How to Add Money?</h4>
                  <p>Go to Wallet → Add Money and complete payment online.</p>
                </div>

                <div className="faq-item shadow-sm mb-3 rounded p-3">
                  <h4 className="fw-semibold mb-2"><i className="bi bi-cash-coin me-2 text-warning"></i> What is a Bid?</h4>
                  <p>Bids allow members to compete for the pooled amount.</p>
                </div>

                <div className="faq-item shadow-sm mb-3 rounded p-3">
                  <h4 className="fw-semibold mb-2"><i className="bi bi-trophy me-2 text-danger"></i> When Will I Get the Amount?</h4>
                  <p>Winners receive funds in their wallet within a few days.</p>
                </div>

                <div className="faq-item shadow-sm mb-3 rounded p-3">
                  <h4 className="fw-semibold mb-2"><i className="bi bi-person-check-fill me-2 text-info"></i> Is My Investment Safe?</h4>
                  <p>Yes, all transactions are securely recorded with full transparency.</p>
                </div>
              </div>
            </div>
          </section>

          {/* CONTACT */}
          <section id="contact" className="py-5" style={{ backgroundColor: "#f9f9f9" }}>
            <div className="container">
              <div className="text-center mb-5">
                <h2 className="fw-bold text-primary">Contact</h2>
              </div>

              <div className="row text-center mb-4">
                <div className="col-lg-4 col-md-6 mb-4">
                  <div className="p-4 shadow-sm bg-white rounded">
                    <i className="bi bi-geo-alt-fill text-danger fs-3 mb-2"></i>
                    <h5 className="fw-bold">Our Address</h5>
                    <p className="text-muted small">132, Bypass Road, Opp Union Bank, Ambur, Thirupathur Dt-635802</p>
                  </div>
                </div>

                <div className="col-lg-4 col-md-6 mb-4">
                  <div className="p-4 shadow-sm bg-white rounded">
                    <i className="bi bi-envelope-fill text-success fs-3 mb-2"></i>
                    <h5 className="fw-bold">Email Us</h5>
                    <p className="text-muted small">admin@egschitfund.com</p>
                  </div>
                </div>

                <div className="col-lg-4 col-md-12 mb-4">
                  <div className="p-4 shadow-sm bg-white rounded">
                    <i className="bi bi-telephone-fill text-primary fs-3 mb-2"></i>
                    <h5 className="fw-bold">Call Us</h5>
                    <p className="text-muted small">+91 91599 00094</p>
                  </div>
                </div>
              </div>

              <div className="row g-4">
                <div className="col-lg-6">
                  <div className="rounded shadow-sm overflow-hidden">
                    <iframe
                      title="EGS Chit Fund Location Map"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2832.0625263786783!2d78.7093073732997!3d12.783734818972857!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bad09fa87edc7cd%3A0x9a1db6fc6ab2f27e!2sEgschits!5e1!3m2!1sen!2sin!4v1764304267860!5m2!1sen!2sin"
                      width="100%"
                      height="384"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>

                <div className="col-lg-6">
                  <form className="bg-white p-4 shadow-sm rounded">
                    <input className="form-control mb-3" placeholder="Your Name" required />
                    <input className="form-control mb-3" placeholder="Your Email" required />
                    <input className="form-control mb-3" placeholder="Subject" required />
                    <textarea rows="5" className="form-control mb-3" placeholder="Message" required></textarea>
                    <button type="submit" className="btn btn-info text-white px-4">Send Message</button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </main>
      </Page>
      
    </>
  );
};

export default Home;
