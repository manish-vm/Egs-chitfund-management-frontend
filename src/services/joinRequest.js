// src/services/joinRequest.js
import api from './api';

// Create a join request for a chit
export const createJoinRequest = async (chitId) => {
  const res = await api.post(`/join-requests/${chitId}`);
  return res.data;
};

// Get current user's join requests
export const getUserJoinRequests = async () => {
  const res = await api.get('/join-requests/user/requests');
  return res.data;
};

// Get pending join requests (admin)
export const getPendingJoinRequests = async () => {
  const res = await api.get('/join-requests/pending');
  return res.data;
};

// Approve a join request (admin)
export const approveJoinRequest = async (requestId) => {
  const res = await api.put(`/join-requests/${requestId}/approve`);
  return res.data;
};

// Reject a join request (admin)
export const rejectJoinRequest = async (requestId) => {
  const res = await api.put(`/join-requests/${requestId}/reject`);
  return res.data;
};
