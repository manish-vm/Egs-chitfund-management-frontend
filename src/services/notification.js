// src/services/notification.js
import api from './api';

export const fetchNotifications = async (opts = {}) => {
  // opts: { limit, unreadOnly }
  const params = {};
  if (opts.limit) params.limit = opts.limit;
  if (opts.unreadOnly) params.unreadOnly = true;
  const res = await api.get('/notifications', { params });
  return res.data;
};

export const markNotificationRead = async (id) => {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data;
};

export const markAllNotificationsRead = async () => {
  const res = await api.patch(`/notifications/read-all`);
  return res.data;
};

// New: delete a single notification
export const deleteNotification = async (id) => {
  const res = await api.delete(`/notifications/${id}`);
  return res.data;
};

// New: delete all notifications for current user
export const deleteAllNotifications = async () => {
  const res = await api.delete(`/notifications`);
  return res.data;
};