// src/services/auth.js
import api from './api';

// Register (if needed)
export const register = async (formData) => {
  const res = await api.post('/auth/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// Login: store token and optionally user id
export const login = async (credentials) => {
  const res = await api.post('/auth/login', credentials);
  const data = res.data;
  if (data && data.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
};

// Logout: clear token
export const logout = async () => {
  try {
    // If you have a server-side logout endpoint, call it here.
    // await api.post('/auth/logout');
  } catch (err) {
    // ignore
  } finally {
    localStorage.removeItem('token');
  }
};

// Get current user by calling backend protected endpoint
export const getCurrentUser = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};
