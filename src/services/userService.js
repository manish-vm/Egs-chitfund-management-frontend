// services/userService.js
import api from "./api";


export const fetchAllUsers = async () => {
  const { data } = await api.get("/admin/users");
  return data;
};

export const deleteUser = async (userId) => {
  const { data } = await api.delete(`/admin/user/${userId}`);
  return data;
};

export const approveChitForAll = async (userId) => {
  return await api.put(`/admin/approve-chit/${userId}`);
};

export const makeAdmin = (userId) => {
  return api.put(`/admin/make-admin/${userId}`);
};


export async function getUserById(userId) {
  if (!userId) throw new Error('getUserById: userId required');

  // Try admin profile endpoint first (if admin fetching another user)
  const tried = [];

  // helper to attempt a GET and return normalized object or throw
  const attempt = async (url) => {
    tried.push(url);
    const res = await api.get(url);
    // Many endpoints return { success, user } or { user } or { data: user }
    if (res?.data?.user) return res.data.user;
    if (res?.data?.data) return res.data.data;
    if (res?.data) {
      // if data is primitive (like array), return it, else assume object is user
      return typeof res.data === 'object' ? res.data : res.data;
    }
    return res;
  };

  // Try a sequence of possible endpoints your backend may expose
  const endpoints = [
    `/admin/users/${userId}`,   // admin route (we added earlier)
    `/users/${userId}`,         // common REST public route
    `/auth/users/${userId}`,    // less common
    `/auth/me`,                 // returns current user (if userId is current)
    `/users/me`                 // alternate
  ];

  // If userId looks like 'me' use that first
  if (String(userId).toLowerCase() === 'me') {
    endpoints.unshift('/auth/me', '/users/me');
  }

  let lastErr = null;
  for (const ep of endpoints) {
    try {
      const user = await attempt(ep);
      // basic validation
      if (user && (user._id || user.id || user.email)) return user;
    } catch (err) {
      lastErr = err;
      // continue trying other endpoints
    }
  }

  // none succeeded — throw informative error
  const e = new Error(`Failed to fetch user. Tried: ${tried.join(', ')}. Last error: ${lastErr?.message || 'unknown'}`);
  e.cause = lastErr;
  throw e;
}

/**
 * Example getAllImages service.
 * Adjust path to the server route you already have.
 */
export async function getAllImages() {
  try {
    const res = await api.get('/images'); // adjust '/images' if your backend route is different
    // expect res.data to be { images: [...] } or array
    if (res?.data?.images) return res.data.images;
    if (Array.isArray(res?.data)) return res.data;
    return res?.data || [];
  } catch (err) {
    console.error('getAllImages error', err);
    return [];
  }
}

/**
 * Optional: fetch current logged-in user (helps if you store token but not id)
 */
export async function getCurrentUser() {
  try {
    const res = await api.get('/auth/me');
    if (res?.data?.user) return res.data.user;
    if (res?.data) return res.data;
    return null;
  } catch (err) {
    console.error('getCurrentUser error', err);
    throw err;
  }
}