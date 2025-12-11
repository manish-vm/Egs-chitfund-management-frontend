// src/pages/ContactPage.jsx
import React from 'react';
import '../css/ContactPage.css';

const ContactPage = () => {
    return (
        <div className="contact-page">
            <header className="contact-banner">
                <div className="banner-inner">
                    <div className="banner-text">
                        <h1>Contact Us</h1>
                        <p>We’re here to help you — reach out anytime</p>
                    </div>

                    {/* <img
                        src="https://png.pngtree.com/png-clipart/20231205/original/pngtree-website-social-media-and-internet-cubes-pages-photo-png-image_13775885.png"
                        alt="Contact Us"
                        className="banner-image"
                    /> */}
                </div>
            </header>


            <div className="contact-content">
                <div className="contact-card">
                    <h2>Get in Touch</h2>

                    <div className="contact-item">
                        <strong>Address:</strong>
                        <span>
                            Nearby Chaudhri Charan Singh College, Umararkhera, Orai, District Jalaun,
                            Uttar Pradesh – 285001
                        </span>
                    </div>

                    <div className="contact-item">
                        <strong>Email:</strong>
                        <a href="mailto:metromenswear01@gmail.com">metromenswear01@gmail.com</a>
                    </div>

                    <div className="contact-item">
                        <strong>Phone:</strong>
                        <a href="tel:9486217297">94862 17297</a>
                    </div>

                    <p className="contact-note">
                        For any queries, complaints, or support — feel free to reach out. We will get back to you as soon as possible.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
