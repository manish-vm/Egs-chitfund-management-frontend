import api from './api'; // Assumes api is already set up with baseURL

const API_BASE = '/contributions';

export const payContribution = async (payload) => {
  const { data } = await api.post(`${API_BASE}`, payload);
  return data;
};

export const getContributionsByUser = async (userId) => {
  // call backend route; if you pass userId as query param, backend will accept it
  const res = await api.get(`/contributions?userId=${userId}`);
  return res.data; // { contributions: [...] }
};
// Get all contributions for a chit
export const getContributionsByChit = async (chitId) => {
  const { data } = await api.get(`${API_BASE}/chit/${chitId}`);
  return data;
};

// Get unpaid months for a user in a chit
export const getUnpaidMonths = async (chitId, userId) => {
  const { data } = await api.get(`${API_BASE}/status/${chitId}/${userId}`);
  return data;
};
