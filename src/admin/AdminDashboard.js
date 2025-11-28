// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import {
  FaUser,
  FaMoneyCheckAlt,
  FaUsers,
  FaFileInvoice,
} from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    chits: 0,
    contributions: 0,
    members: 0,
  });

  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        const data = res.data.data;

        setStats(prev => ({
          ...prev,
          users: data.totalUsers,
          chits: data.totalSchemes,
          contributions: 0,
          members: 0,
        }));
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };

    const fetchRecentUsers = async () => {
      try {
        const res = await api.get('/admin/recent-users');
        setRecentUsers(res.data.users);
      } catch (err) {
        console.error('Error fetching recent users:', err);
      }
    };

    fetchStats();
    fetchRecentUsers();
  }, []);

  const cards = [
    { title: 'Total Users', value: stats.users, icon: <FaUser /> },
    { title: 'Chit Schemes', value: stats.chits, icon: <FaFileInvoice /> },
    { title: 'Contributions', value: stats.contributions, icon: <FaMoneyCheckAlt /> },
    { title: 'Members', value: stats.members, icon: <FaUsers /> },
  ];

  return (
    <div className="admin-dashboard">
      <Sidebar />
      <main className="admin-main">
        <h1 className="admin-title">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="stats-grid">
          {cards.map((card, index) => (
            <div key={index} className="stats-card">
              <div className="stats-card-text">
                <h2>{card.title}</h2>
                <p>{card.value}</p>
              </div>
              <div className="stats-card-icon">{card.icon}</div>
            </div>
          ))}
        </div>

        {/* Recent Users */}
        <div className="recent-users">
          <h2>Recent Users</h2>
          {recentUsers.length === 0 ? (
            <p className="no-users">No recent users found.</p>
          ) : (
            <div className="table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td className="capitalize">{user.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
