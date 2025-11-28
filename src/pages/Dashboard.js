// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { getUserById, getAllImages, getCurrentUser } from "../services/userService";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
} from "react-icons/fa";
import "../pages/Dashboard.css";
import UserDocumentProofs from '../components/UserDocumentProofs';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [error, setError] = useState("");
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoadingUser(true);
      setError('');
      try {
        // Prefer token based fetch of current user
        try {
          // If you stored userId in localStorage, try that first
          const storedId = localStorage.getItem("userId");
          let u;
          if (storedId) {
            try {
              u = await getUserById(storedId);
            } catch (innerErr) {
              // Try current user fallback
              console.warn('getUserById with storedId failed, trying current user endpoint', innerErr);
              u = await getCurrentUser();
            }
          } else {
            u = await getCurrentUser();
          }

          if (!u) throw new Error('User not found from server');

          if (!mounted) return;
          setUser(u);
        } catch (userErr) {
          console.error('Failed to fetch user via getUserById/getCurrentUser:', userErr);
          throw userErr;
        }

        try {
          const imgs = await getAllImages();
          if (mounted) setImages(imgs || []);
        } catch (imgErr) {
          console.warn('Failed to fetch images:', imgErr);
          // keep images empty but continue
          if (mounted) setImages([]);
        }
      } catch (err) {
        console.error('Dashboard fetchData error:', err);
        if (mounted) setError('Failed to load user data or images. See console for details.');
      } finally {
        if (mounted) setLoadingUser(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, []);

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

  // slideshow effect
  useEffect(() => {
    if (!images || images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images]);

  return (
    <div className="dashboard-wrapper">
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>Welcome Back!</h1>
          <p className="dashboard-subtext">Here’s your account overview</p>
        </div>

        {error && <div className="dashboard-error">{error}</div>}

        {loadingUser ? (
          <div className="dashboard-loading">Loading user data...</div>
        ) : !user ? (
          <div className="dashboard-error">User not available. Please login again.</div>
        ) : (
          <>
            <div className="dashboard-profile-container">
              {/* LEFT PROFILE SECTION */}
              <div className="dashboard-profile-left">
                {user.image && (
                  <div className="dashboard-image-wrapper">
                    <img
                      src={`data:image/jpeg;base64,${userImage}`}
                      alt="User"
                      className="dashboard-profile-picture"
                    />
                  </div>
                )}

                <h2 className="dashboard-username">{user.name}</h2>
                <p className="dashboard-user-role">{user.role}</p>

                {images.length > 0 && images[currentIndex] && (
                  <div className="slideshow-wrapper">
                    <img
                      src={images[currentIndex].data || images[currentIndex].url}
                      alt={images[currentIndex].name || 'slide'}
                      className="slideshow-image"
                    />
                  </div>
                )}
              </div>

              {/* RIGHT PROFILE INFO */}
              <div className="dashboard-profile-right">
                <div className="dashboard-info-grid">
                  <InfoField icon={<FaEnvelope />} label="Email" value={user.email} />
                  <InfoField icon={<FaPhone />} label="Phone" value={user.phone} />
                  <InfoField icon={<FaMapMarkerAlt />} label="Address" value={user.address} />
                  <InfoField icon={<FaBuilding />} label="Location" value={user.location} />
                </div>
              </div>
            </div>

            <UserDocumentProofs />
          </>
        )}
      </main>
    </div>
  );
};

const InfoField = ({ icon, label, value }) => (
  <div className="dashboard-field">
    <span className="dashboard-icon">{icon}</span>
    <div>
      <strong className="field-label">{label}</strong>
      <div className="field-value">{value || '-'}</div>
    </div>
  </div>
);

export default Dashboard;
