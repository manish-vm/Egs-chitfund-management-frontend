import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import './AdminBidRequests.css';

const AdminBidRequests = () => {
  const [bidRequests, setBidRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBidRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bid-requests');
      setBidRequests(response.data);
    } catch (err) {
      console.error('Error fetching bid requests:', err);
      setError('Failed to load bid requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBidRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/bid-requests/${id}/approve`);
      alert('Bid request approved successfully!');
      loadBidRequests(); // Refresh the list
    } catch (err) {
      console.error('Error approving bid request:', err);
      alert('Failed to approve bid request');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/bid-requests/${id}/reject`);
      alert('Bid request rejected successfully!');
      loadBidRequests(); // Refresh the list
    } catch (err) {
      console.error('Error rejecting bid request:', err);
      alert('Failed to reject bid request');
    }
  };

  const handleEdit = async (id, currentStatus) => {
    const newStatus = prompt(`Current status: ${currentStatus}. Enter new status (pending, approved, rejected):`, currentStatus);
    if (!newStatus || !['pending', 'approved', 'rejected'].includes(newStatus)) {
      alert('Invalid status. Please enter pending, approved, or rejected.');
      return;
    }
    try {
      await api.put(`/bid-requests/${id}`, { status: newStatus });
      alert('Bid request updated successfully!');
      loadBidRequests(); // Refresh the list
    } catch (err) {
      console.error('Error updating bid request:', err);
      alert('Failed to update bid request');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bid request?')) return;
    try {
      await api.delete(`/bid-requests/${id}`);
      alert('Bid request deleted successfully!');
      loadBidRequests(); // Refresh the list
    } catch (err) {
      console.error('Error deleting bid request:', err);
      alert('Failed to delete bid request');
    }
  };

  return (
    <div className="admin-bid-requests">
      <Sidebar />
      <div className="admin-main">
        <h2 className='Bidrequest-h2'>Bid Requests</h2>

        {loading && <p>Loading bid requests...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!loading && !error && bidRequests.length === 0 && (
          <p>No pending bid requests found.</p>
        )}

        {!loading && !error && bidRequests.length > 0 && (
          <table className="bid-requests-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Chit Scheme</th>
                <th>Status</th>
                <th>Requested At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bidRequests.map((request) => (
                <tr key={request._id}>
                  <td>{request.userId?.name || 'Unknown User'}</td>
                  <td>{request.chitId?.name || 'Unknown Chit'}</td>
                  <td>{request.status}</td>
                  <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEdit(request._id, request.status)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(request._id)}
                    >
                      Delete
                    </button>
                    {request.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-success"
                          onClick={() => handleApprove(request._id)}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleReject(request._id)}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminBidRequests;
