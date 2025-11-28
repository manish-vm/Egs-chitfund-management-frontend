// src/pages/AdminPaymentApprovals.jsx
import React, { useEffect, useState } from 'react';
import { adminGetVerificationRequests, adminApprovePayment, adminRejectPayment } from '../services/payment';
import './AdminPaymentApprovals.css';
import Sidebar from '../components/Sidebar';

const AdminPaymentApprovals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actioningId, setActioningId] = useState(null);

  // Search
  const [search, setSearch] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminGetVerificationRequests();
      setRequests(res.payments || []);
    } catch (err) {
      console.error('Failed to load verification requests', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this payment?')) return;
    setActioningId(id);
    try {
      await adminApprovePayment(id);
      setRequests((prev) => prev.filter((r) => r._id !== id));
      alert('Payment approved');
    } catch (err) {
      console.error('Approve failed', err);
      alert(err?.response?.data?.message || 'Approve failed');
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason (optional):', '');
    if (reason === null) return;
    setActioningId(id);
    try {
      await adminRejectPayment(id, reason);
      setRequests((prev) => prev.filter((r) => r._id !== id));
      alert('Payment rejected');
    } catch (err) {
      console.error('Reject failed', err);
      alert(err?.response?.data?.message || 'Reject failed');
    } finally {
      setActioningId(null);
    }
  };

  // FILTERED DATA
  const filtered = requests.filter((r) => {
    const searchText = search.toLowerCase();
    return (
      r.userId?.name?.toLowerCase().includes(searchText) ||
      r.userId?.email?.toLowerCase().includes(searchText) ||
      r.chitId?.name?.toLowerCase().includes(searchText) ||
      r.amount?.toString().includes(searchText) ||
      new Date(r.createdAt).toLocaleString().toLowerCase().includes(searchText)
    );
  });

  // PAGINATION LOGIC
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="admin-approvals-container">
      <Sidebar />
      <div className="admin-payments-page">
        <h2>Payment Verification Requests</h2>

        {/* Search Box */}
        <input
          type="text"
          className="global-search-input"
          placeholder="Search by user, email, chit, amount, date..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);  
          }}
        />

        {loading && <div>Loading...</div>}
        {!loading && filtered.length === 0 && <div>No verification requests found.</div>}

        {!loading && filtered.length > 0 && (
          <>
            <div className="table-container">
              <table className="requests-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>User</th>
                    <th>Chit</th>
                    <th>Amount</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((r, index) => (
                    <tr key={r._id}>
                      <td className="serial-number">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td>
                        {r.userId?.name}
                        <br />
                        <small>({r.userId?.email})</small>
                      </td>
                      <td>{r.chitId?.name}</td>
                      <td>₹{r.amount}</td>
                      <td>{new Date(r.createdAt).toLocaleString()}</td>
                      <td className="actions">
                        <button
                          className="approve-btn"
                          disabled={actioningId === r._id}
                          onClick={() => handleApprove(r._id)}
                        >
                          Approve
                        </button>
                        <button
                          className="reject-btn"
                          disabled={actioningId === r._id}
                          onClick={() => handleReject(r._id)}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
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
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPaymentApprovals;
