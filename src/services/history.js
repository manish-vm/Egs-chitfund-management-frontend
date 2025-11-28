import API from './api';

export const getChitHistory = async (userId) => {
  const { data } = await API.get(`/history/user/${userId}`);
  return data;
};

export const getAllChitHistory = async () => {
  const { data } = await API.get('/history');
  return data;
};

export const addChitHistory = async (historyData) => {
  const { data } = await API.post('/history/add', historyData);
  return data;
};
