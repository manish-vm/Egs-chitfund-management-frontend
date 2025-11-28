import React from 'react';
import { FaRupeeSign, FaClock, FaUsers } from 'react-icons/fa';
import './ChitSchemeCard.css';

const ChitSchemeCard = ({ scheme }) => {
  return (
    <div className="chit-card">
      <div className="chit-badge">
        <span>
          {scheme.durationInMonths || '0'} Months
        </span>
      </div>

      <h3 className="chit-title">
        {scheme.name || 'Unnamed Scheme'}
      </h3>

      <div className="chit-details">
        <p className="chit-info">
          <FaRupeeSign className="chit-icon" />
          <span className="chit-label">Amount:</span>
          <span className="chit-value">₹{scheme.amount || 'N/A'}</span>
        </p>

        <p className="chit-info">
          <FaClock className="chit-icon" />
          <span className="chit-label">Duration:</span>
          <span className="chit-value">{scheme.durationInMonths || 'N/A'} months</span>
        </p>

        <p className="chit-info">
          <FaUsers className="chit-icon" />
          <span className="chit-label">Members:</span>
          <span className="chit-value">{scheme.totalMembers || 'N/A'}</span>
        </p>
      </div>
    </div>
  );
};

export default ChitSchemeCard;
