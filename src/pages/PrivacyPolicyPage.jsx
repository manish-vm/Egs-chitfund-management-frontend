// src/pages/PrivacyPolicyPage.jsx
import React from "react";
import "../css/PrivacyPolicyPage.css";

const PrivacyPolicyPage = () => {
  return (
    <div className="policy-container">
      <h1 className="policy-title">Privacy Policy</h1>
      <p className="policy-updated">
        This Privacy Policy describes how Metro Menswear (“we”, “us”, “our”) collects,
        uses, stores, and protects your personal information when you visit or make a
        purchase on our website www.metromenswear.com.
      </p>

      <p>
        By using our website, you agree to the practices described in this Privacy Policy.
      </p>

      <h2>1. Information We Collect</h2>

      <h3>a. Personal Information</h3>
      <ul>
        <li>Name</li>
        <li>Email address</li>
        <li>Phone number</li>
        <li>Billing and shipping address</li>
        <li>Payment-related details (handled by secure payment gateways)</li>
      </ul>

      <h3>b. Non-Personal Information</h3>
      <ul>
        <li>IP address</li>
        <li>Browser information</li>
        <li>Device type</li>
        <li>Usage data (pages visited, time spent, etc.)</li>
      </ul>

      <h3>c. Cookies & Tracking</h3>
      <p>We use cookies and similar technologies to:</p>
      <ul>
        <li>Improve user experience</li>
        <li>Track browsing behavior</li>
        <li>Show relevant offers</li>
      </ul>
      <p>You can disable cookies in your browser settings.</p>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>Process and deliver orders</li>
        <li>Provide customer support</li>
        <li>Improve website functionality</li>
        <li>Personalize user experience</li>
        <li>Send order updates, promotional offers, or newsletters</li>
        <li>Prevent fraud or illegal activities</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>3. Sharing of Information</h2>
      <p>We may share your information with third parties only in the following cases:</p>
      <ul>
        <li>Service providers (courier partners, payment gateways, analytics tools)</li>
        <li>Legal authorities (if required by law)</li>
        <li>Business transfers (merger, acquisition, sale)</li>
      </ul>
      <p><strong>We do not sell or rent personal information to third parties.</strong></p>

      <h2>4. Payment Information</h2>
      <p>
        Payments are processed using secure third-party gateways.
        We <strong>do not</strong> store card details, UPI PINs, or sensitive payment data.
      </p>

      <h2>5. Data Security</h2>
      <p>
        We implement security measures, but no online system is 100% secure.
        You use our website at your own risk.
      </p>

      <h2>6. Data Retention</h2>
      <p>We retain personal data as long as necessary to provide services and comply with laws.</p>
      <p>You may request deletion of your data by contacting us.</p>

      <h2>7. Your Rights</h2>
      <ul>
        <li>Access your personal data</li>
        <li>Correct inaccurate information</li>
        <li>Request deletion where applicable</li>
        <li>Withdraw consent for marketing</li>
      </ul>

      <h2>8. Cookies Policy</h2>
      <p>You may reject cookies, but some website features may not function properly.</p>

      <h2>9. Third-Party Links</h2>
      <p>
        We are not responsible for the privacy practices, terms, or content of third-party
        websites linked on our platform.
      </p>

      <h2>10. Children’s Privacy</h2>
      <p>Our services are not intended for individuals under 18.</p>

      <h2>11. Updates to Privacy Policy</h2>
      <p>
        We may update this policy from time to time. Continued use of the website means you
        accept the updated policy.
      </p>

      <h2>12. Contact Us</h2>
      <p><strong>Metro Menswear</strong></p>
      <p>
        Address: Nearby Chaudhri Charan Singh College, Umararkhera, Orai, Jalaun, Uttar Pradesh, 285001
      </p>
      <p>Email: <a href="mailto:metromenswear01@gmail.com">metromenswear01@gmail.com</a></p>
      <p>Phone: <a href="tel:9486217297">94862 17297</a></p>

      <h2>Consent</h2>
      <p>
        By using our website, you consent to the collection and use of your data as
        described in this Privacy Policy.
      </p>
    </div>
  );
};

export default PrivacyPolicyPage;
