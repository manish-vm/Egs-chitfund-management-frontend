import api from './api';

export const getCart = async () => {
  const { data } = await api.get('/cart');
  return data;
};

export const addToCart = async (payload) => {
  const { data } = await api.post('/cart', payload);
  return data;
};

export const updateCartItem = async (payload) => {
  const { data } = await api.put('/cart', payload);
  return data;
};

export const clearCart = async () => {
  const { data } = await api.delete('/cart');
  return data;
};

export const createOrder = async (payload) => {
  const { data } = await api.post('/orders', payload);
  return data;
};
export const getMyOrders = async () => {
  const { data } = await api.get('/orders/myorders');
  return data;
};

export const getAllOrders = async () => {
  const { data } = await api.get('/orders');
  return data;
};

export const updateOrderStatus = async (id, payload) => {
  const { data } = await api.put(`/orders/${id}`, payload);
  return data;
};

export const cancelOrder = async (id, reason) => {
  const { data } = await api.put(`/orders/${id}/cancel`, { reason });
  return data;
};

export const deleteMyOrder = async (id) => {
  const { data } = await api.delete(`/orders/my/${id}`);
  return data;
};

export const clearMyOrders = async () => {
  const { data } = await api.delete('/orders/my');
  return data;
};

export const deleteOrder = async (id) => {
  const { data } = await api.delete(`/orders/${id}`);
  return data;
};

export const getOrderByOrderId = async (orderId) => {
  const { data } = await api.get(`/orders/track/${orderId}`);
  return data;
};
