import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link, NavLink } from 'react-router-dom';

const AdminSidebar = () => (
  <aside className="admin-sidebar">
    <h2>Admin</h2>
    <nav>
      <NavLink to="/admin">Dashboard</NavLink>
      <NavLink to="/admin/products">Products</NavLink>
      <NavLink to="/admin/orders">Orders</NavLink>
      <NavLink to="/admin/users">Users</NavLink>
    </nav>
  </aside>
);

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalOrders: 0, totalRevenue: 0 });

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    };
    load();
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <h1>Dashboard</h1>
        <div className="admin-grid">
          <div className="admin-card">
            <h3>Total Users</h3>
            <p>{stats.totalUsers}</p>
          </div>
          <div className="admin-card">
            <h3>Total Orders</h3>
            <p>{stats.totalOrders}</p>
          </div>
          <div className="admin-card">
            <h3>Total Revenue</h3>
            <p>₹{stats.totalRevenue}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
export { AdminSidebar };
