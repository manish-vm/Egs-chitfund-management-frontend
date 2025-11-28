// src/services/api.js
import axios from 'axios';

const baseURL = ='https://egs-chitfund-management-backend.onrender.com/api' ;

const api = axios.create({
  baseURL,
  withCredentials: false,
});

// Request interceptor: attach token if available
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: if 401, clear token and let AuthContext handle redirect
api.interceptors.response.use(
  (res) => res,
  (error) => {
    // If backend returns 401, we do not automatically navigate here.
    // Let AuthContext handle automatic logouts/redirects by observing 401 responses.
    return Promise.reject(error);
  }
);

export default api;


