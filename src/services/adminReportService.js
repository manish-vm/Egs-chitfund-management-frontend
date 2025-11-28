// src/services/adminReportService.js
import api from './api';

/**
 * payload may contain: q, status, from, to, sortBy, sortDir, page, pageSize
 */
export const fetchAdminReports = async (payload = {}) => {
  const res = await api.get('/api/adminReport', { params: payload });
  return res.data;
};
