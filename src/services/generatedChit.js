// frontend/src/services/generatedChit.js
// Use paths WITHOUT a leading "/api" because your axios instance already uses baseURL: '/api'
import api from './api'; // your axios instance (assumed baseURL: '/api')

// Fetch generated rows for a chit. Optional monthKey (YYYY-MM) filter.
export const fetchGeneratedRows = async (chitId, monthKey = null) => {
  const params = {};
  if (monthKey) params.month = monthKey;

  // This calls: <api.baseURL>/generateChit/chit/:id/generated
  const res = await api.get(`/generateChit/chit/${chitId}/generated`, { params });
  return (res && res.data && res.data.rows) ? res.data.rows : (res.data || []);
};

// Create a generated chit row. Server computes chitNo and returns created row.
// This calls: <api.baseURL>/generateChit/chit/:id/generated
export const createGeneratedRow = async (chitId, payload) => {
  // payload: { chitName, walletAmount, bidAmount, distributed, date? }
  const res = await api.post(`/generateChit/chit/${chitId}/generated`, payload);
  return res && res.data && res.data.row ? res.data.row : res.data;
};
