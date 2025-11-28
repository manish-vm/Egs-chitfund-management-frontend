import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaRegListAlt,
  FaPlusSquare,
  FaChartBar,
  FaUsers,
  FaImages,
  FaUserPlus,
  FaMoneyCheckAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import '../components/Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const menuItems = [
    { name: 'Create Chit', path: '/admin/create-chit', icon: <FaPlusSquare /> },
    { name: 'Manage Chits', path: '/admin/manage-chits', icon: <FaRegListAlt /> },
    { name: 'Manage Users', path: '/admin/manage-users', icon: <FaUsers /> },
    { name: 'Reports', path: '/admin/reports', icon: <FaChartBar /> },
    { name: 'Manage Images', path: '/admin/manage-images', icon: <FaImages /> },
    { name: 'Pending User Join Request', path: '/admin/AdminJoinRequests', icon: <FaUserPlus /> },
    { name: 'Pending User Payment Request', path: '/admin/paymentsApprovals', icon: <FaMoneyCheckAlt /> },
  ];

  // close on route change (useful when clicking a link on mobile)
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // close on ESC key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {/* MOBILE HAMBURGER */}
      <button
  className={`mobile-hamburger ${open ? "open" : ""}`}
  aria-label={open ? "Close menu" : "Open menu"}
  aria-expanded={open}
  onClick={() => setOpen((s) => !s)}
>
  {open ? <FaTimes /> : <FaBars />}
</button>

      {/* Overlay (mobile) */}
      <div
        className={`mobile-overlay ${open ? 'visible' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      {/* Drawer (mobile) */}
      <nav className={`mobile-drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="mobile-drawer-inner">
          <div className="sidebar-title-mobile">
            Admin
          </div>
          <ul className="sidebar-menu-mobile">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.name} onClick={() => setOpen(false)}>
                  <Link to={item.path} className={`sidebar-link ${isActive ? 'active' : ''}`}>
                    <span className={`sidebar-icon ${isActive ? 'icon-active' : ''}`}>{item.icon}</span>
                    <span className={`sidebar-text ${isActive ? 'text-active' : ''}`}>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Desktop sidebar (keeps your original markup & classes) */}
      <aside className="sidebar desktop-sidebar">
        <div className="sidebar-title">Admin</div>
        <ul className="sidebar-menu">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.name}>
                <Link to={item.path} className={`sidebar-link ${isActive ? 'active' : ''}`}>
                  <span className={`sidebar-icon ${isActive ? 'icon-active' : ''}`}>{item.icon}</span>
                  <span className={`sidebar-text ${isActive ? 'text-active' : ''}`}>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>
    </>
  );
};

export default Sidebar;
