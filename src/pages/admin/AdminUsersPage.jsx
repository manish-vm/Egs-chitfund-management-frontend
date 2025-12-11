import React, { useEffect, useState } from 'react';
import { AdminSidebar } from './AdminDashboardPage';
import api from '../../services/api';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);

  const load = async () => {
    const { data } = await api.get('/admin/users');
    setUsers(data);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleAdmin = async (u) => {
    await api.put(`/admin/users/${u._id}`, { isAdmin: !u.isAdmin });
    load();
  };

  const handleDelete = async (u) => {
    if (window.confirm('Delete this user?')) {
      await api.delete(`/admin/users/${u._id}`);
      load();
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <h1>Users</h1>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Admin</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.isAdmin ? 'Yes' : 'No'}</td>
                <td>
                  <button
                    className="link-button"
                    onClick={() => toggleAdmin(u)}
                  >
                    Toggle Admin
                  </button>
                  <button
                    className="link-button danger"
                    onClick={() => handleDelete(u)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersPage;
