// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Usage (react-router v6):
// <Route element={<ProtectedRoute />}>
//   <Route path="/dashboard" element={<Dashboard />} />
// </Route>

const ProtectedRoute = ({ adminOnly = false }) => {
  const { user, loading } = useAuth();

  // While loading (validating token), render nothing or a spinner
  if (loading) {
    return <div style={{ padding: 20 }}>Checking authentication...</div>;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    // optionally redirect to unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  // authorized
  return <Outlet />;
};

export default ProtectedRoute;
