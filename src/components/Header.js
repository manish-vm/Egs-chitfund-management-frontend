import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Logo from '../components/Logo';
import { getUserById } from '../services/userService';
import NotificationBell from './NotificationBell';
import './Header.css';


const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const [userImage, setUserImage] = useState(null);
  const navigate = useNavigate();

  const handleDashboardRedirect = () => {
  if (user?.role === 'admin') {
    navigate('/admin/reports');
  } else {
    navigate('/dashboard');
  }
};

  useEffect(() => {
    const fetchUserImage = async () => {
      if (user && user._id) {
        try {
          const response = await getUserById(user._id);
          if (response?.image) {
            setUserImage(response.image);
          }
        } catch (error) {
          console.error('Error fetching user image:', error);
        }
      }
    };
    fetchUserImage();
  }, [user]);

  return (
    <header className="header-container">
      <div className="header-wrapper">
        <Link to="/" className="header-logo">
          <Logo className="logo-icon" />
          <span className="logo-text">EGS Chits</span>
        </Link>

        <nav className="nav-menu">
          {user ? (
            <div className="user-section">
              <NotificationBell />
              <div onClick={handleDashboardRedirect} className="user-profile">
                {userImage ? (
                  <img
                    src={`data:image/jpeg;base64,${userImage}`}
                    alt="User"
                    className="user-image"
                  />
                ) : (
                  <div className="user-placeholder">
                    <span>{user.name?.[0] || 'U'}</span>
                  </div>
                )}
                <span className="user-name">Hello, {user.name}</span>
              </div>
              
              <button onClick={logout} className="logout-button1">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-button1">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
