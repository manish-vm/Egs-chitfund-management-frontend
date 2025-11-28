import api from './api';

export const createChitScheme = async (chitData) => {
  const { data } = await api.post('/chit/createscheme', chitData);
  return data;
};


export const getAllChitSchemes = async () => {
  const { data } = await api.get('/chit');
  return data;
};

export const joinChitScheme = async (schemeId) => {
  const { data } = await api.post(`/chit/join/${schemeId}`); 
  return data;
};

export const getUserChitSchemes = async (userId) => {
  const { data } = await api.get(`/chit/user/${userId}`);
  return data;
};

export const getJoinedSchemes = async () => {
  const { data } = await api.get('/chit/joined');
  return data;
};
// Update Chit Scheme by ID
export const updateChitScheme = async (id, updatedData) => {
  const { data } = await api.put(`/chit/${id}`, updatedData);
  return data;
};

// Delete Chit Scheme by ID
export const deleteChitScheme = async (id) => {
  const { data } = await api.delete(`/chit/${id}`);
  return data;
};

export const getChitById = async (id) => {
  const res = await api.get(`/chit/${id}`);
  return res.data;
};

export const updateChitDetails = async (data) => {
  const res = await api.put(`/chits/${data.chitId}`, data);
  return res.data;
};