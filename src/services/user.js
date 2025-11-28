// src/services/user.js
import api from './api';

// Admin: get full user profile
export const adminGetUserProfile = async (userId) => {
  const res = await api.get(`/admin/users/${userId}`);
  return res.data;
};