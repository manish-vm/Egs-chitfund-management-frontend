import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout as logoutService } from '../services/auth';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

    useEffect(() => {
    const fetchUser = async () => {
      const storedUserInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = storedUserInfo?.token;

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data);
      } catch (error) {
        console.error('❌ AuthContext fetch error:', error.response?.data || error.message);
        // Optional: clear invalid token
        localStorage.removeItem('userInfo');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []); // ✅ empty dependency array → runs only once


 const login = (userData) => {
  setUser(userData);
  setIsAdmin(userData.role === 'admin');
  if (userData.role === 'admin') {
    navigate('/admin');
  } else {
    navigate('/dashboard');
  }
};

  const logout = async () => {
    await logoutService(); // import as logoutService from services/auth
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('token');
    navigate('/login');
  };



  return (
<AuthContext.Provider value={{ user, isAdmin, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Add this custom hook
export const useAuth = () => useContext(AuthContext);
