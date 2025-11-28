import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaPlusCircle,
  FaHistory,
  FaHome,
  FaAngleRight,
  FaCheckCircle,
  FaClock,
  FaBars,
  FaTimes,
} from 'react-icons/fa';
import '../pages/Side.css';

const Side = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  // Automatically close sidebar on route change (for mobile)
  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={() => {
          if (!isOpen) toggleSidebar(); // only open if closed
        }}
      >
        <FaBars />
      </button>



      <aside className={`sidebar1 ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Menu</h2>
          <button className="close-btn" onClick={closeSidebar}>
            <FaTimes />
          </button>
        </div>
        <nav>
          <Link to="/dashboard"><FaHome /> Dashboard</Link>
          {/* <Link to="/chits"><FaThList /> Chit Schemes</Link> */}
          <Link to="/join-chit/123"><FaPlusCircle /> Join a Chit</Link>
          <Link to="/joined-schemes"><FaCheckCircle /> My Schemes</Link>
          <Link to="/my-chits"><FaHistory /> Contribution</Link>
          <Link to="/contribution-history"><FaClock /> Contribution History</Link>
          <Link to="/"><FaAngleRight /> Home</Link>
        </nav>
      </aside>
    </>
  );
};

export default Side;
