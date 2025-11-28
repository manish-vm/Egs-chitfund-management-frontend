import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const NotFound = () => {
  return (
    <>
      <Header title="Page Not Found" />
      <div className="not-found-container">
        <h2>404 - Page Not Found</h2>
        <p>The page you're looking for does not exist.</p>
        <Link to="/">Go back to Home</Link>
      </div>
      <Footer />
    </>
  );
};

export default NotFound;
