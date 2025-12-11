import React from "react";
import { Link } from "react-router-dom";
import "../../css/footer.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFacebookF,
  faInstagram,
  faYoutube,
  faTwitter
 } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* ===== SUPPORT ===== */}
        <div className="footer-section">
          <h3>SUPPORT</h3>
          <Link to="/track-order">Track Order</Link>
          <Link to="/return-policy">Returns & Exchange Policy</Link>
          <Link to="/faqs">FAQ's</Link>
          <Link to="/terms">Term and Conditions</Link>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/shipping-policy">Shipping Policy</Link>
          <Link to="/contact">Contact Us</Link>
        </div>

        {/* ===== COMPANY ===== */}
        <div className="footer-section">
          <h3>COMPANY</h3>
          <Link to="/about">About Us</Link>
          <Link to="/collaboration">Collaboration</Link>
          <Link to="/career">Career</Link>
          <Link to="/media">Media</Link>
          <Link to="/blog">MetroMensWear Blog</Link>
          <Link to="/sitemap">Sitemap</Link>
        </div>

        {/* ===== STORES ===== */}
        <div className="footer-section">
          <h3>STORES NEAR ME</h3>
          <p> Umararkhera</p>
          <p> Orai</p>
          <p>Jalaun </p>
          <p>More</p>
        </div>

        {/* ===== LOCATION ===== */}
        <div className="footer-section">
          <h3>LOCATION</h3>
          <p>support@metromenswear.in</p>
          <p> Nearby Chaudhri Charan Singh College, Umararkhera, Orai, Jalaun,<br></br>Uttar Pradesh, 285001</p>
          <p>Email: <a href="mailto:metromenswear01@gmail.com">metromenswear01@gmail.com</a></p>
          <p>Phone: <a href="tel:9486217297">94862 17297</a></p>

          {/* Social Icons */}
          <div className="footer-social">
            <a href="#" aria-label="facebook">
              <FontAwesomeIcon icon={faFacebookF} /> 
            </a>
            <a href="#" aria-label="instagram">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="#" aria-label="youtube">
              <FontAwesomeIcon icon={faYoutube} />
            </a>
            <a href="#" aria-label="twitter">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
