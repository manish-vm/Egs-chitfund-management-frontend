// src/pages/AdminJoinRequests.js

import React, { useEffect, useState } from 'react';
import {
  getPendingJoinRequests,
  approveJoinRequest,
  rejectJoinRequest
} from '../services/joinRequest';
import './AdminJoinRequests.css';
import Sidebar from '../components/Sidebar';

const AdminJoinRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actioningId, setActioningId] = useState(null);
  const [error, setError] = useState('');

  // Search
  const [search, setSearch] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetch = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPendingJoinRequests();
      setRequests(res || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleApprove = async (id) => {
    try {
      setActioningId(id);
      await approveJoinRequest(id);
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Approve failed');
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setActioningId(id);
      await rejectJoinRequest(id);
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Reject failed');
    } finally {
      setActioningId(null);
    }
  };

  // FILTER DATA
  const filtered = requests.filter((r) => {
    const t = search.toLowerCase();
    return (
      r.userId?.name?.toLowerCase().includes(t) ||
      r.userId?.email?.toLowerCase().includes(t) ||
      r.chitId?.name?.toLowerCase().includes(t) ||
      new Date(r.createdAt).toLocaleString().toLowerCase().includes(t)
    );
  });

  // PAGINATION LOGIC
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) return <div className="loading">Loading pending join requests...</div>;

  return (
    <div className="admin-requests-layout">
      <Sidebar />

      <div className="admin-requests-content">
        <h2>Pending Join Requests</h2>

        {/* Global Search */}
        <input
          type="text"
          className="global-search-input"
          placeholder="Search name, email, chit, date..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

        {error && <div className="error-msg">{error}</div>}
        {filtered.length === 0 && <div className="empty-msg">No pending requests.</div>}

        <ul className="requests-list" style={{ listStyle: 'none', padding: 0 }}>
          {paginated.map((r) => (
            <li key={r._id} className="request-card">
              <div className="request-avatar">
                {r.userId?.name
                  ? r.userId.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                  : 'U'}
              </div>

              <div className="request-content">
                <div className="request-user">
                  <div className="request-user__name">{r.userId?.name}</div>
                  <div className="request-user__email">{r.userId?.email}</div>
                </div>

                <div className="request-meta">
                  <div><strong>Chit:</strong> {r.chitId?.name}</div>
                  <div><strong>Requested:</strong> {new Date(r.createdAt).toLocaleString()}</div>
                </div>
              </div>

              <div className="request-actions">
                <div
                  className={`status-pill ${
                    r.status === 'pending'
                      ? 'status-pending'
                      : r.status === 'approved'
                      ? 'status-approved'
                      : 'status-rejected'
                  }`}
                >
                  {r.status.toUpperCase()}
                </div>

                <div className="action-buttons">
                  <button
                    className="btn btn-approve"
                    onClick={() => handleApprove(r._id)}
                    disabled={actioningId === r._id}
                  >
                    Approve
                  </button>

                  <button
                    className="btn btn-reject"
                    onClick={() => handleReject(r._id)}
                    disabled={actioningId === r._id}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="pagination">
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => changePage(currentPage - 1)}
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`page-number ${currentPage === i + 1 ? "active" : ""}`}
                onClick={() => changePage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="page-btn"
              disabled={currentPage === totalPages}
              onClick={() => changePage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJoinRequests;
