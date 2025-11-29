// src/pages/PublicChitSchemes.jsx
import React, { useEffect, useState } from "react";
import { getAllChitSchemes } from "../services/chit";
import { useNavigate } from "react-router-dom";
import {
  IndianRupee,
  Clock,
  ShieldCheck,
  Plus,
  CalendarDays
} from "lucide-react";
import "./PublicChitSchemes.css";

const PublicChitSchemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

   const fmtDate = (d) => {
    if (!d) return '—';
    try {
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return '—';
      return dt.toLocaleDateString();
    } catch {
      return '—';
    }
  };

  useEffect(() => {
    const fetchSchemes = async () => {
      setLoading(true);
      try {
        const data = await getAllChitSchemes();
        setSchemes(data || []);
      } catch (err) {
        console.error("Error fetching schemes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, []);

  return (
    <div className="public-scheme-container">
      <header className="public-header">
        <h2>
          <ShieldCheck className="header-icon" /> Available Chit Schemes
        </h2>
        <p>Explore trusted savings plans before registering</p>
      </header>

      {loading ? (
        <div className="loading">Loading chit schemes...</div>
      ) : schemes.length === 0 ? (
        <p className="no-schemes">No schemes available currently.</p>
      ) : (
        <div className="public-scheme-grid">
          {schemes.map((scheme) => {
            const joinedCount = Array.isArray(scheme.joinedUsers)
              ? scheme.joinedUsers.length
              : 0;

            return (
              <div key={scheme._id} className="public-scheme-card">
                <h3 className="scheme-title">{scheme.name}</h3>

                <div className="scheme-details">
                  <div className="detail-item">
                    <IndianRupee className="icon" />
                    <span>Amount:</span>
                    <strong>₹{scheme.amount}</strong>
                  </div>

                  <div className="detail-item">
                    <CalendarDays  className="icon" />
                    <span>Start Date:</span>
                    <strong>
                      {fmtDate(scheme.startDate || scheme.createdAt || scheme.launchDate)}
                    </strong>
                  </div>

                  <div className="detail-item">
                    <Clock className="icon" />
                    <span>Duration:</span>
                    <strong>{scheme.durationInMonths} months</strong>
                  </div>
                </div>

                <div className="public-button-area">
                  <button
                    className="view-btn"
                    onClick={() => navigate("/login")}
                  >
                    View Details
                  </button>

                  <button
                    className="join-btn"
                    onClick={() => navigate("/register")}
                  >
                    <Plus className="btn-icon" /> Register to Join
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PublicChitSchemes;
