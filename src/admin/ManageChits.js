// src/pages/ManageChits.jsx
import React, { useEffect, useState } from 'react';
import { getAllChitSchemes, deleteChitScheme, updateChitScheme } from '../services/chit';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import './ManageChits.css';

const ManageChits = () => {
  const [chits, setChits] = useState([]);
  const [error, setError] = useState('');
  const [selectedChit, setSelectedChit] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Search + Pagination
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7; // You can change this

  const [editData, setEditData] = useState({
    name: '',
    amount: '',
    duration: '',
    members: '',
    startDate: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchChits = async () => {
      try {
        const res = await getAllChitSchemes();
        const list = Array.isArray(res) ? res : (res.chits || res.data || res);
        setChits(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Error fetching chit schemes:', err);
        setError('Failed to load chit schemes.');
      }
    };
    fetchChits();
  }, []);

  /* -------------------------
        DELETE
  --------------------------*/
  const handleDelete = async (id, e) => {
    try {
      if (!window.confirm('Are you sure you want to delete this chit scheme?')) return;
      await deleteChitScheme(id);
      setChits((prevChits) => prevChits.filter((chit) => chit._id !== id));
    } catch (err) {
      console.error('Error deleting chit scheme:', err);
      setError('Failed to delete chit scheme.');
    }
  };

  /* -------------------------
        EDIT
  --------------------------*/
  const handleEdit = (chit, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setSelectedChit(chit);
    setEditData({
      name: chit.name ?? '',
      amount: chit.amount ?? '',
      duration: chit.durationInMonths ?? chit.duration ?? '',
      members: chit.totalMembers ?? '',
      startDate: chit.startDate ? String(chit.startDate).split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedChit) return;
    try {
      const payload = {
        name: editData.name,
        amount: editData.amount,
        durationInMonths: editData.duration,
        totalMembers: editData.members,
        startDate: editData.startDate
      };

      await updateChitScheme(selectedChit._id, payload);

      setChits((prev) =>
        prev.map((ch) => (ch._id === selectedChit._id ? { ...ch, ...payload } : ch))
      );
      setShowModal(false);
      setSelectedChit(null);
    } catch (err) {
      console.error('Error updating chit scheme:', err);
      setError('Failed to update chit scheme.');
    }
  };

  const handleRowClick = (chit) => {
    const id = chit._id || chit.id;
    if (!id) return;
    navigate(`/admin/chits/${id}`);
  };

  /* -------------------------
        SEARCH FILTER
  --------------------------*/
  const filteredChits = chits.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      String(c.amount).includes(q) ||
      String(c.durationInMonths ?? c.duration).includes(q) ||
      String(c.totalMembers).includes(q) ||
      (c.startDate && new Date(c.startDate).toLocaleDateString().includes(q))
    );
  });

  /* -------------------------
        PAGINATION
  --------------------------*/
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentChits = filteredChits.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredChits.length / rowsPerPage);

  const changePage = (num) => setCurrentPage(num);

  return (
    <div className="manage-container">
      <Sidebar />
      <main className="manage-main">
        <h1 className="manage-title">Manage Chit Schemes</h1>

        {error && <p className="error-text">{error}</p>}

        {/* 🔍 Search Box */}
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, amount, duration, members..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // reset page on search
            }}
          />
        </div>

        <div className="table-container">
          <table className="chit-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Amount</th>
                <th>Duration</th>
                <th>Members</th>
                <th>Start Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentChits.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">No chit schemes found.</td>
                </tr>
              ) : (
                currentChits.map((chit) => {
                  const id = chit._id || chit.id;
                  const start = chit.startDate ? new Date(chit.startDate).toLocaleDateString() : 'N/A';
                  const duration = chit.durationInMonths ?? chit.duration ?? 'N/A';
                  const joinedCount = Array.isArray(chit.joinedUsers)
                    ? chit.joinedUsers.length
                    : (chit.currentMembers ? chit.currentMembers.length : 0);
                  const totalMembers = chit.totalMembers ?? chit.members ?? 'N/A';

                  return (
                    <tr
                      key={id}
                      className="chit-row"
                      onClick={() => handleRowClick(chit)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{chit.name}</td>
                      <td>₹{chit.amount}</td>
                      <td>{duration} months</td>
                      <td>{joinedCount}/{totalMembers}</td>
                      <td>{start}</td>

                      {/* ACTIONS */}
                      <td onClick={(e) => e.stopPropagation()}>
                        <select
                          onChange={(e) => {
                            const val = e.target.value;
                            e.stopPropagation();
                            e.target.value = '';
                            if (val === 'edit') handleEdit(chit, e);
                            if (val === 'delete') handleDelete(id, e);
                          }}
                          defaultValue=""
                        >
                          <option value="" disabled>Action</option>
                          <option value="edit">Edit</option>
                          <option value="delete">Delete</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 📌 Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <button
              disabled={currentPage === 1}
              onClick={() => changePage(currentPage - 1)}
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={currentPage === i + 1 ? 'active-page' : ''}
                onClick={() => changePage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => changePage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        )}

        {/* ------ MODAL ------ */}
        {showModal && selectedChit && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Edit Chit Scheme</h2>

              <input type="text" placeholder="Name" value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })} />

              <input type="number" placeholder="Amount" value={editData.amount}
                onChange={(e) => setEditData({ ...editData, amount: e.target.value })} />

              <input type="number" placeholder="Duration (months)" value={editData.duration}
                onChange={(e) => setEditData({ ...editData, duration: e.target.value })} />

              <input type="number" placeholder="Members" value={editData.members}
                onChange={(e) => setEditData({ ...editData, members: e.target.value })} />

              <input type="date" value={editData.startDate}
                onChange={(e) => setEditData({ ...editData, startDate: e.target.value })} />

              <div className="modal-buttons">
                <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="update-btn" onClick={handleUpdate}>Update</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageChits;
