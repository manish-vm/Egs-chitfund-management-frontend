import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaEnvelope, 
  FaPhoneAlt, 
  FaMapMarkerAlt 
} from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Company Info */}
        <div className="footer-section company-info">
          <h3>EGS Chit Fund</h3>
          <p>
            EGS Chit Fund is committed to providing transparent and reliable financial services 
            to our customers. We believe in fostering trust and long-term relationships by 
            offering tailored chit fund schemes that meet the diverse needs of individuals and 
            businesses alike. Our mission is to empower our members with flexible savings and 
            borrowing options, enabling them to achieve their financial goals with ease and confidence.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section quick-links">
          <h3>Quick Links</h3>
          <ul>
            <li>
              <Link to="/"><span>➔</span> Home</Link>
            </li>
            <li>
              <Link to="/login"><span>➔</span> Login</Link>
            </li>
            <li>
              <Link to="/register"><span>➔</span> Register</Link>
            </li>
            <li>
              <Link to="/chits"><span>➔</span> Scheme</Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section contact-info">
          <h3>Contact Us</h3>
          <ul>
            <li><FaMapMarkerAlt /> 132, Bypass Road, Opp to Union Bank, Ambur, Thirupathur Dt-635802</li>
            <li><FaPhoneAlt /> +91 98765 43210</li>
            <li><FaEnvelope /> support@egschit.com</li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="footer-divider">
        <p>&copy; {new Date().getFullYear()} EGS Chit Fund. All rights reserved.</p>
        <div className="social-icons">
          <a href="#" aria-label="Facebook"><FaFacebookF /></a>
          <a href="#" aria-label="Twitter"><FaTwitter /></a>
          <a href="#" aria-label="Instagram"><FaInstagram /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
