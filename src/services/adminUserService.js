// src/services/adminUserService.js
import api from './api';

/**
 * Get chits the given user is a member of (admin)
 * GET /api/admin/users/:id/chits
 */
export const getUserChitsAdmin = async (userId) => {
  if (!userId) throw new Error('userId required');
  const res = await api.get(`/admin/users/${userId}/chits`);
  // Expect { success: true, chits: [...] }
  return res.data;
};

/**
 * Get payments for the given user (admin)
 * GET /api/admin/users/:id/payments
 */
export const getUserPaymentsAdmin = async (userId) => {
  if (!userId) throw new Error('userId required');
  const res = await api.get(`/admin/users/${userId}/payments`);
  // Expect { success: true, payments: [...] }
  return res.data;
};
