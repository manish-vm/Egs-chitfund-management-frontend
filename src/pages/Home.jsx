import React, { useEffect, useState } from "react";
import Page from "../components/Page";
import PublicChitSchemes from "./PublicChitSchemes";
import "./style.css";

const images = [
  "https://www.cashe.co.in/wp-content/uploads/2024/02/Chit_fund.png",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMREMKL0EWkSN1hoZ01-fROE-FiMaKHGqOVw&s",
  "https://kopuramchits.com/wp-content/plugins/phastpress/phast.php/c2VydmljZT1pbWFnZXMmc3JjPWh0dHBzJTNBJTJGJTJGa29wdXJhbWNoaXRzLmNvbSUyRndwLWNvbnRlbnQlMkZ1cGxvYWRzJTJGMjAyNCUyRjA5JTJGaG93LWNoaXQtZnVuZC13b3Jrcy0xLTEwMjR4NDIzLmpwZyZjYWNoZU1hcmtlcj0xNzMxNzU0NDYxLTY2MTg0JnRva2VuPTgwNjA0ODVhNjY3NjMwMTc.q.jpg",
];

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Required CDN Links (Only Once) */}
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
        {/* HERO SECTION */}
        <section
          id="hero"
          className="relative w-full min-h-screen flex items-center justify-center text-white pt-[90px]"
          style={{
            backgroundImage: `
            linear-gradient(135deg, rgba(30, 60, 114, 0.4), rgba(42, 82, 152, 0.4)),
            url(${images[currentSlide]})
          `,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="container text-center">
            <h1 className="display-4 fw-bold mb-3" style={{ color: "white" }}>
              Welcome to <br></br><span style={{ color: "black" }}>EGS Chit Fund</span>
            </h1>

            <h2 className="h5 fw-light mb-4" style={{ color: "#ffffffff" }}>
              Making your investment easy.
            </h2>

            <p
              className="lead mb-4"
              style={{ maxWidth: "600px", margin: "0 auto", color: "#ffffffff" }}
            >
              Secure your future with smart and trusted chit fund investments.
            </p>

            <div className="d-flex justify-content-center">
              <a
                href="/register"
                className="btn btn-light btn-lg px-5 py-2 fw-semibold text-primary shadow"
                style={{ borderRadius: "30px" }}
              >
                Sign Up Today
              </a>
            </div>
          </div>
        </section>

        <main id="main">
          {/* ABOUT SECTION */}
          <section id="about" className="py-5 bg-light">
            <div className="container">
              <div className="text-center mb-5">
                <h2 className="fw-bold text-uppercase">About</h2>
                <h3 className="text-primary fw-semibold">
                  What is <span className="text-dark">EGS Chit Fund?</span>
                </h3>
              </div>

              <div className="row align-items-center mb-5">
                <div className="col-lg-6 mb-4">
                  <img
                    src="static/images/about1.jpg"
                    className="img-fluid rounded shadow"
                    alt="About EGS"
                  />
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
                  <img
                    src="static/images/about2.jpg"
                    className="img-fluid rounded shadow"
                    alt="Working model"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SERVICES SECTION */}
          <section
            id="services"
            className="py-5"
            style={{ background: "linear-gradient(to right, #f5f7fa, #c3cfe2)" }}
          >
            <div className="container">
              <div className="text-center mb-5">
                <h2 className="fw-bold text-dark">Our Services</h2>
                <p className="text-muted fs-5">Explore how EGS Fund works</p>
              </div>

              <div className="row g-4">
                <div className="col-md-6 col-lg-3">
                  <div className="card h-100 border-0 shadow-sm text-center p-4 rounded-4">
                    <div className="mb-3 text-primary fs-1">
                      <i className="bi bi-house-door-fill"></i>
                    </div>
                    <h5 className="fw-semibold mb-2">Join House</h5>
                    <p className="text-secondary small">
                      Join a house by paying the entry amount.
                    </p>
                  </div>
                </div>

                <div className="col-md-6 col-lg-3">
                  <div className="card h-100 border-0 shadow-sm text-center p-4 rounded-4">
                    <div className="mb-3 text-success fs-1">
                      <i className="bi bi-bar-chart-fill"></i>
                    </div>
                    <h5 className="fw-semibold mb-2">Bid House</h5>
                    <p className="text-secondary small">
                      View your house and place bids from the Portfolio section.
                    </p>
                  </div>
                </div>

                <div className="col-md-6 col-lg-3">
                  <div className="card h-100 border-0 shadow-sm text-center p-4 rounded-4">
                    <div className="mb-3 text-warning fs-1">
                      <i className="bi bi-hammer"></i>
                    </div>
                    <h5 className="fw-semibold mb-2">Submit Bid</h5>
                    <p className="text-secondary small">
                      Submit your bid (not more than 50% of pool amount).
                    </p>
                  </div>
                </div>

                <div className="col-md-6 col-lg-3">
                  <div className="card h-100 border-0 shadow-sm text-center p-4 rounded-4">
                    <div className="mb-3 text-danger fs-1">
                      <i className="bi bi-trophy-fill"></i>
                    </div>
                    <h5 className="fw-semibold mb-2">Win Bid</h5>
                    <p className="text-secondary small">
                      Winners receive the fund shortly with email notification.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* PUBLIC CHIT SCHEMES */}
          <PublicChitSchemes />

          {/* FAQ SECTION */}
          <section id="faq" className="py-5" style={{ backgroundColor: "#f0f4f8" }}>
            <div className="container my-5">
              <div className="text-center mb-5">
                <h2 className="fw-bold text-primary">F.A.Q</h2>
                <h3 className="text-secondary">
                  Frequently Asked <span className="text-info">Questions</span>
                </h3>
              </div>

              <div className="faq-list">
                <div className="faq-item shadow-sm mb-3 rounded p-3">
                  <h4 className="fw-semibold mb-2">
                    <i className="bi bi-house-door me-2 text-primary"></i> How to Join a House?
                  </h4>
                  <p>Add money to your wallet and join a house from the Home section.</p>
                </div>

                <div className="faq-item shadow-sm mb-3 rounded p-3">
                  <h4 className="fw-semibold mb-2">
                    <i className="bi bi-wallet2 me-2 text-success"></i> How to Add Money?
                  </h4>
                  <p>Go to Wallet → Add Money and complete payment online.</p>
                </div>

                <div className="faq-item shadow-sm mb-3 rounded p-3">
                  <h4 className="fw-semibold mb-2">
                    <i className="bi bi-cash-coin me-2 text-warning"></i> What is a Bid?
                  </h4>
                  <p>Bids allow members to compete for the pooled amount.</p>
                </div>

                <div className="faq-item shadow-sm mb-3 rounded p-3">
                  <h4 className="fw-semibold mb-2">
                    <i className="bi bi-trophy me-2 text-danger"></i> When Will I Get the Amount?
                  </h4>
                  <p>Winners receive funds in their wallet within a few days.</p>
                </div>

                <div className="faq-item shadow-sm mb-3 rounded p-3">
                  <h4 className="fw-semibold mb-2">
                    <i className="bi bi-person-check-fill me-2 text-info"></i> Is My Investment Safe?
                  </h4>
                  <p>
                    Yes, all transactions are securely recorded with full transparency.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CONTACT SECTION */}
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
                    <p className="text-muted small">
                      132, Bypass Road, Opp Union Bank, Ambur, <br /> Thirupathur Dt-635802
                    </p>
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
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2832.0625263786783!2d78.7093073732997!3d12.783734818972857!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bad09fa87edc7cd%3A0x9a1db6fc6ab2f27e!2sEgschits!5e1!3m2!1sen!2sin!4v1764304267860!5m2!1sen!2sin" width="600" height="450"   allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                  </div>
                </div>

                <div className="col-lg-6">
                  <form className="bg-white p-4 shadow-sm rounded">
                    <input className="form-control mb-3" placeholder="Your Name" required />
                    <input className="form-control mb-3" placeholder="Your Email" required />
                    <input className="form-control mb-3" placeholder="Subject" required />
                    <textarea
                      rows="5"
                      className="form-control mb-3"
                      placeholder="Message"
                      required
                    ></textarea>

                    <button type="submit" className="btn btn-info text-white px-4">
                      Send Message
                    </button>
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
