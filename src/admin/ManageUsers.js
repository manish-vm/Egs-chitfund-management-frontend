// src/pages/ManageUsers.js
import React, { useEffect, useRef, useState } from 'react';
import { fetchAllUsers, deleteUser, approveChitForAll, makeAdmin } from '../services/userService';
import Sidebar from '../components/Sidebar';
import { FaEllipsisV } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './ManageUsers.css';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  // close dropdown when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetchAllUsers();
      setUsers(response?.data || response?.users || response || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setUsers([]);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleMakeAdmin = async (e, userId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to make this user an admin?')) return;
    try {
      await makeAdmin(userId);
      await fetchUsers();
      alert('User promoted to admin successfully.');
    } catch (error) {
      console.error('Error making user admin:', error);
      alert('Failed to promote user to admin.');
    }
  };

  const handleApproveChit = async (e, userId) => {
    e.stopPropagation();
    if (!window.confirm('Approve chit for this user?')) return;
    try {
      await approveChitForAll(userId);
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, isApproved: true } : u)));
      alert('User approved successfully.');
    } catch (error) {
      console.error('Error approving chit:', error);
      alert('Failed to approve chit.');
    }
  };

  const toggleDropdown = (e, index) => {
    e.stopPropagation();
    setOpenDropdown((prev) => (prev === index ? null : index));
  };

  const goToUserDetail = (userId) => {
    if (!userId) return;
    navigate(`/pages/AdminUserDetails/${userId}`);
  };

  // Filter users using search
  const filteredUsers = users.filter((user) => {
    const q = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q) ||
      user.phone?.toLowerCase().includes(q) ||
      user.location?.toLowerCase().includes(q)
    );
  });

  // Pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };


  return (
    <div className="manage-users-container" ref={wrapperRef}>
      <Sidebar />
      <div className="manage-users-content">
        <h2 className="page-title">User Management</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search users by name, email, phone or location..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // reset to page 1 on search
            }}
            className="search-box"
          />
        </div>
        <div className="table-wrapper">
          <table className="user-table" role="grid" aria-label="User management table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Location</th>
                <th>Role</th>
                {/* <th>Approved</th> */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(users) && users.length > 0 ? (
                currentUsers.map((user, index) => (
                  <tr key={user._id} onClick={() => navigate(`/admin/users/${user._id}`)} className="user-row clickable">
                    {/* Clickable cells: clicking any of these navigates to details */}
                    <td
                      className="clickable-cell"
                      onClick={() => goToUserDetail(user._id)}
                      onKeyDown={(e) => e.key === 'Enter' && goToUserDetail(user._id)}
                    >
                      {user.name}
                    </td>
                    <td
                      className="clickable-cell"
                      onClick={() => goToUserDetail(user._id)}
                      onKeyDown={(e) => e.key === 'Enter' && goToUserDetail(user._id)}
                    >
                      {user.email}
                    </td>
                    <td
                      className="clickable-cell"
                      onClick={() => goToUserDetail(user._id)}
                      onKeyDown={(e) => e.key === 'Enter' && goToUserDetail(user._id)}
                    >
                      {user.phone}
                    </td>
                    <td
                      className="clickable-cell"
                      onClick={() => goToUserDetail(user._id)}
                      onKeyDown={(e) => e.key === 'Enter' && goToUserDetail(user._id)}
                    >
                      {user.address}
                    </td>
                    <td
                      className="clickable-cell"
                      onClick={() => goToUserDetail(user._id)}
                      onKeyDown={(e) => e.key === 'Enter' && goToUserDetail(user._id)}
                    >
                      {user.location}
                    </td>
                    <td
                      className="clickable-cell capitalize"
                      onClick={() => goToUserDetail(user._id)}
                      onKeyDown={(e) => e.key === 'Enter' && goToUserDetail(user._id)}
                    >
                      {user.role}
                    </td>
                    {/* <td
                      className={`clickable-cell ${user.isApproved ? 'approved' : 'not-approved'}`}
                      onClick={() => goToUserDetail(user._id)}
                      onKeyDown={(e) => e.key === 'Enter' && goToUserDetail(user._id)}
                    >
                      {user.isApproved ? 'Yes' : 'No'}
                    </td> */}

                    {/* Actions cell: buttons should not trigger row navigation */}
                    <td
                      className="actions-cell"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="dropdown-btn"
                        onClick={(e) => toggleDropdown(e, index)}
                        aria-expanded={openDropdown === index}
                        aria-haspopup="menu"
                        title="Actions"
                      >
                        <FaEllipsisV />
                      </button>

                      {openDropdown === index && (
                        <div className="dropdown-menu" role="menu" onClick={(e) => e.stopPropagation()}>
                          <button onClick={(e) => handleDelete(e, user._id)}>Delete User</button>

                          {!user.isApproved && (
                            <button onClick={(e) => handleApproveChit(e, user._id)}>Approve Chit</button>
                          )}

                          {user.role !== 'admin' && (
                            <button onClick={(e) => handleMakeAdmin(e, user._id)}>Make Admin</button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/users/${user._id}`);
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-data">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="pagination-container">
            <button
              className="pagination-btn"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>

            {/* Page numbers */}
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`pagination-number ${currentPage === i + 1 ? "active" : ""
                  }`}
                onClick={() => goToPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="pagination-btn"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
