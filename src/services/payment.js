// src/services/payment.js
import api from './api'; // axios instance configured with baseURL /api

export const createPayment = async (chitId, payload) => {
  const res = await api.post(`/payments/${chitId}`, payload);
  return res.data;
};

export const getPayment = async (id) => {
  const res = await api.get(`/payments/${id}`);
  return res.data;
};

export const getUserPayments = async () => {
  const res = await api.get(`/payments/user`); // backend route you'll create below
  return res.data;
};

export const requestVerification = async (id) => {
  const res = await api.patch(`/payments/${id}/request-verification`);
  return res.data;
};

// Admin APIs
export const adminGetVerificationRequests = async () => {
  const res = await api.get(`/payments/admin/verification-requests`);
  return res.data;
};

export const adminApprovePayment = async (id) => {
  const res = await api.patch(`/payments/admin/${id}/approve`);
  return res.data;
};

export const adminRejectPayment = async (id, reason) => {
  const res = await api.patch(`/payments/admin/${id}/reject`, { reason });
  return res.data;
};
