// frontend/src/services/authService.js
import api from './api';

// 🔐 Email/password register
export const register = async (data) => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

// 🔐 Email/password login
export const login = async (data) => {
  const res = await api.post('/auth/login', data);
  return res.data;
};

// 🔐 Google login
export const googleLogin = async (data) => {
  const res = await api.post('/auth/google', data);
  return res.data;
};

// 🔐 Phone OTP: request
export const requestOtp = async (data) => {
  const res = await api.post('/auth/request-otp', data);
  return res.data;
};

// 🔐 Phone OTP: verify
export const verifyOtp = async (data) => {
  const res = await api.post('/auth/verify-otp', data);
  return res.data;
};

// 🔐 Logout
export const logout = async () => {
  const res = await api.post('/auth/logout');
  return res.data;
};

/* ✅✅ NEW: PROFILE ENDPOINTS */

// GET /api/auth/profile  (authController.getProfile)
export const getProfile = async () => {
  const res = await api.get('/auth/profile');
  return res.data;
};

// PUT /api/auth/profile  (authController.updateProfile)
export const updateProfile = async (payload) => {
  const res = await api.put('/auth/profile', payload);
  return res.data;
};
