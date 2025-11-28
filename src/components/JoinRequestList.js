// src/components/JoinRequestList.js
import React, { useEffect, useState } from 'react';
import { getUserJoinRequests } from '../services/joinRequest';

const JoinRequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const data = await getUserJoinRequests();
      setRequests(data || []);
    } catch (err) {
      console.error('Failed to fetch join requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  if (loading) return <div>Loading your join requests...</div>;
  if (!requests.length) return <div>You have no join requests.</div>;

  return (
    <div>
      <h3>Your Join Requests</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {requests.map((r) => (
          <li key={r._id} style={{ border: '1px solid #eee', padding: 10, marginBottom: 8 }}>
            <div><strong>Chit:</strong> {r.chitId?.name || r.chitId}</div>
            <div><strong>Status:</strong> {r.status}</div>
            <div><strong>Requested:</strong> {new Date(r.createdAt).toLocaleString()}</div>
            {r.status === 'rejected' && r.updatedAt && <div style={{ color: 'red' }}>Rejected on {new Date(r.updatedAt).toLocaleString()}</div>}
            {r.status === 'approved' && r.updatedAt && <div style={{ color: 'green' }}>Approved on {new Date(r.updatedAt).toLocaleString()}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JoinRequestList;
