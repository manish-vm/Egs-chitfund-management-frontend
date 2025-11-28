// src/services/documentService.js
import api from './api';

/**
 * User endpoints
 */
export const getMyDocuments = async () => {
  const res = await api.get('/documents/me');
  return res.data; // { success, documents }
};

export const submitMyDocuments = async (formData) => {
  // Let axios set Content-Type (boundary)
  const res = await api.post('/documents/me', formData);
  return res.data; // { success, documents }
};

/**
 * Admin endpoints
 */
export const adminGetUserDocuments = async (userId) => {
  const res = await api.get(`/documents/user/${userId}`);
  return res.data; // { success, user, documents }
};

export const adminUpdateUserDocuments = async (userId, formData) => {
  const res = await api.put(`/documents/user/${userId}`, formData);
  return res.data; // { success, documents }
};

export const adminSetVerificationStatus = async (userId, verificationStatus, note = '') => {
  const res = await api.patch(`/documents/user/${userId}/status`, { verificationStatus, note });
  return res.data; // { success, verificationStatus, documents }
};

export const adminListAllDocuments = async () => {
  const res = await api.get('/documents');
  return res.data; // { success, users }
};
