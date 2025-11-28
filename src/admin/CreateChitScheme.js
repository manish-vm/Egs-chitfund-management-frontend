import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { createChitScheme } from '../services/chit';
import {
  FaRegCalendarAlt,
  FaMoneyBillWave,
  FaUsers,
  FaClock,
  FaFileSignature,
  FaLink
} from 'react-icons/fa';
import './CreateChitScheme.css';

const toPositiveIntOrEmpty = (val) => {
  if (val === '' || val === null || val === undefined) return '';
  // ensure it's a number-like string or number
  const n = Number(String(val).replace(/[^\d-]/g, ''));
  if (!Number.isFinite(n)) return '';
  const int = Math.floor(Math.abs(n));
  return int === 0 ? '' : String(int); // treat 0 as empty (require >=1)
};

const CreateChitScheme = () => {
  const [schemeData, setSchemeData] = useState({
    name: '',
    amount: '',
    durationInMonths: '',
    totalMembers: '',
    startDate: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Generic change handler for text/amount/startDate
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSchemeData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Months -> Members sync
  const handleDurationChange = (e) => {
    const raw = e.target.value;
    const cleaned = toPositiveIntOrEmpty(raw);
    setSchemeData((prev) => ({
      ...prev,
      durationInMonths: cleaned,
      totalMembers: cleaned
    }));
    setFieldErrors((prev) => ({ ...prev, durationInMonths: undefined, totalMembers: undefined }));
  };

  // Members -> Months sync
  const handleMembersChange = (e) => {
    const raw = e.target.value;
    const cleaned = toPositiveIntOrEmpty(raw);
    setSchemeData((prev) => ({
      ...prev,
      totalMembers: cleaned,
      durationInMonths: cleaned
    }));
    setFieldErrors((prev) => ({ ...prev, durationInMonths: undefined, totalMembers: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!schemeData.name || !schemeData.name.trim()) errs.name = 'Scheme name is required.';
    const amt = Number(schemeData.amount);
    if (!schemeData.amount || Number.isNaN(amt) || amt <= 0) errs.amount = 'Amount must be a positive number.';
    const months = Number(schemeData.durationInMonths);
    if (!schemeData.durationInMonths || Number.isNaN(months) || !Number.isInteger(months) || months <= 0) {
      errs.durationInMonths = 'Duration must be a positive integer (≥ 1).';
    }
    const members = Number(schemeData.totalMembers);
    if (!schemeData.totalMembers || Number.isNaN(members) || !Number.isInteger(members) || members <= 0) {
      errs.totalMembers = 'Total members must be a positive integer (≥ 1).';
    }
    if (!schemeData.startDate) errs.startDate = 'Start date is required.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!validate()) return;

    // prepare payload with numeric fields
    const payload = {
      name: schemeData.name.trim(),
      amount: Number(schemeData.amount),
      durationInMonths: Number(schemeData.durationInMonths),
      totalMembers: Number(schemeData.totalMembers),
      startDate: schemeData.startDate
    };

    try {
      await createChitScheme(payload);
      setMessage('✅ Chit scheme created successfully!');
      setSchemeData({
        name: '',
        amount: '',
        durationInMonths: '',
        totalMembers: '',
        startDate: ''
      });
      setFieldErrors({});
    } catch (err) {
      console.error('Error creating chit scheme:', err);
      const msg = err?.response?.data?.message || '❌ Failed to create chit scheme.';
      setError(msg);
    }
  };

  return (
    <div className="create-scheme-wrapper">
      <Sidebar />
      <main className="create-scheme-main">
        <div className="form-container">
          <h2 className="form-title">📝 Create New Chit Scheme</h2>
          <p className="form-subtitle">
            Fill in the details below to start a new chit scheme.
          </p>

          <form onSubmit={handleSubmit} className="scheme-form-horizontal" noValidate>
            <div className="form-row">
              <div className="form-group">
                <FaFileSignature className="form-icon text-blue" />
                <input
                  type="text"
                  name="name"
                  placeholder="Scheme Name"
                  value={schemeData.name}
                  onChange={handleChange}
                  required
                  aria-invalid={!!fieldErrors.name}
                />
                {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
              </div>

              <div className="form-group">
                <FaMoneyBillWave className="form-icon text-green" />
                <input
                  type="number"
                  name="amount"
                  placeholder="Chit Amount"
                  value={schemeData.amount}
                  onChange={handleChange}
                  required
                  min="1"
                  aria-invalid={!!fieldErrors.amount}
                />
                {fieldErrors.amount && <div className="field-error">{fieldErrors.amount}</div>}
              </div>
            </div>

            <div className="form-row synced-row">
              <div className="form-group synced-field">
                <FaClock className="form-icon text-yellow" />
                <input
                  type="number"
                  name="durationInMonths"
                  placeholder="Duration (in months)"
                  value={schemeData.durationInMonths}
                  onChange={handleDurationChange}
                  required
                  min="1"
                  aria-label="Duration in months (linked to total members)"
                  aria-invalid={!!fieldErrors.durationInMonths}
                />
                {fieldErrors.durationInMonths && <div className="field-error">{fieldErrors.durationInMonths}</div>}
              </div>

              <div className="synced-link">
                <FaLink />
                <div className="synced-text">Linked</div>
              </div>

              <div className="form-group synced-field">
                <FaUsers className="form-icon text-purple" />
                <input
                  type="number"
                  name="totalMembers"
                  placeholder="Total Members"
                  value={schemeData.totalMembers}
                  onChange={handleMembersChange}
                  required
                  min="1"
                  aria-label="Total members (linked to duration)"
                  aria-invalid={!!fieldErrors.totalMembers}
                />
                {fieldErrors.totalMembers && <div className="field-error">{fieldErrors.totalMembers}</div>}
              </div>
            </div>
            <h6>Chit Starting Date</h6>
            <div className="form-row">
              <div className="form-group">
                <FaRegCalendarAlt className="form-icon text-pink" />
                <input
                  type="date"
                  name="startDate"
                  value={schemeData.startDate}
                  onChange={handleChange}
                  required
                  aria-invalid={!!fieldErrors.startDate}
                />
                {fieldErrors.startDate && <div className="field-error">{fieldErrors.startDate}</div>}
              </div>
            </div>

            <div className="button-row">
              <button type="submit" className="submit-btn">
                Create Scheme
              </button>
            </div>

            {message && <p className="success-msg">{message}</p>}
            {error && <p className="error-msg">{error}</p>}
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateChitScheme;
