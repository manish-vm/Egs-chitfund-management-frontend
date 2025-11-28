// src/pages/Reports.jsx
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import './Reports.css';

const Reports = () => {
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const navigate = useNavigate();

  const filteredData = reportData.filter((item) =>
    item.chitName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- PAGINATION ---
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // helper: safe number
  const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  // compute wallet-after-commission for one chit
  const computeWalletAfterCommission = (tcv = 0, rca = 0) => {
    const TCV = toNum(tcv);
    const RCA = Math.max(0, toNum(rca));
    const GWB = Math.max(0, TCV - RCA); // Gross Wallet Balance
    const commission = 0.05 * GWB; // 5% commission
    const FWA = Math.max(0, GWB - commission); // final wallet amount after commission
    return { TCV, RCA, GWB, commission, FWA };
  };

  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const listRes = await api.get('/chit');
        const rawList = Array.isArray(listRes.data)
          ? listRes.data
          : (listRes.data.chits || listRes.data || []);

        if (!rawList || rawList.length === 0) {
          if (mounted) {
            setReportData([]);
            setSummary({ totalChits: 0, totalMembers: 0, totalCollected: 0, totalPending: 0, totalWallet: 0 });
          }
          return;
        }

        const items = [];
        for (const s of rawList) {
          const id = s._id || s.id;
          try {
            const detailRes = await api.get(`/chit/${id}`);
            const c = detailRes.data.chit || detailRes.data || {};

            const totalAmount = toNum(c.totalAmount ?? c.amount ?? 0);
            const // determine RCA (bid/release) -- robust against different field names
              rca = toNum(
                c.released?.bidAmount ??
                c.lastBid?.bidAmount ??
                c.bidAmount ??
                c.currentBid ??
                c.walletAmount ?? // sometimes walletAmount used
                0
              );

            // compute wallet breakdown
            const { GWB, commission, FWA } = computeWalletAfterCommission(totalAmount, rca);

            const collectedAmount = toNum(c.collectedAmount ?? c.collected ?? 0);
            const pendingAmount = Math.max(0, totalAmount - collectedAmount);
            const totalMembers = toNum(c.totalMembers ?? c.joinedUsers?.length ?? 0);

            items.push({
              chitId: id,
              chitName: c.name || '—',
              totalAmount,
              rca, // bid/released amount
              GWB,
              commission,
              finalWallet: FWA,
              collectedAmount,
              pendingAmount,
              totalMembers,
              startDate: c.startDate,
              createdAt: c.createdAt,
            });
          } catch (err) {
            console.warn('Failed to fetch chit detail for', id, err?.message || err);
          }
        }

        const totalChits = items.length;
        const totalMembers = items.reduce((a, r) => a + (r.totalMembers || 0), 0);
        const totalCollected = items.reduce((a, r) => a + (r.collectedAmount || 0), 0);
        const totalAmountSum = items.reduce((a, r) => a + (r.totalAmount || 0), 0);
        const totalPending = totalAmountSum - totalCollected;
        const totalWallet = items.reduce((a, r) => a + (r.finalWallet || 0), 0);

        if (mounted) {
          setReportData(items);
          setSummary({ totalChits, totalMembers, totalCollected, totalPending, totalWallet });
        }
      } catch (err) {
        if (mounted) setError('Failed to load reports.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();
    return () => { mounted = false; };
  }, []);

  const openChit = (chitId) => {
    if (chitId) navigate(`/admin/chits/${chitId}`);
  };

  const formatCurrency = (n) => Number(n || 0).toLocaleString('en-IN');

  // Colors for pie chart
  const COLORS = ['#2E93fA', '#66DA26', '#E91E63', '#FF9800'];

  return (
    <div className="reports-container">
      <Sidebar />
      <main className="reports-main">
        <h1 className="reports-title">Reports Dashboard</h1>

        {loading && <div className="reports-loading">Loading reports...</div>}
        {error && <p className="reports-error">{error}</p>}

        {summary && !loading && (
          <div className="reports-summary">
            <div className="summary-card">
              <h3>Total Chits</h3>
              <p>{summary.totalChits}</p>
            </div>
            <div className="summary-card">
              <h3>Total Duration(in months)</h3>
              <p>{summary.totalMembers}</p>
            </div>
            <div className="summary-card">
              <h3>Total Chit Amount Distribution</h3>
              <p>₹{formatCurrency(summary.totalPending + summary.totalCollected)}</p>
            </div>
            <div className="summary-card">
              <h3>Total Collected</h3>
              <p>₹{formatCurrency(summary.totalCollected)}</p>
            </div>
            <div className="summary-card">
              <h3>Total Pending</h3>
              <p>₹{formatCurrency(summary.totalPending)}</p>
            </div>
            <div className="summary-card">
              <h3>Wallet Amount (after 5% commission)</h3>
              <p>₹{formatCurrency(summary.totalWallet)}</p>
            </div>
            <div className="summary-card">
              <h3>Total Commission Amount</h3>
              <p>₹{formatCurrency((summary.totalPending + summary.totalCollected) - summary.totalWallet)}</p>
            </div>
          </div>
        )}

        {!loading && reportData.length > 0 && (
          <>
            <div className="reports-charts">
              {/* Bar Chart: Collected vs Pending per chit */}
              <div className="chart-container">
                <h2>Collected vs Pending per Chit</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData}>
                    <XAxis dataKey="chitName" />
                    <YAxis />
                    <Tooltip formatter={(v) => `₹${formatCurrency(v)}`} />
                    <Legend />
                    <Bar dataKey="collectedAmount" fill="#2E93fA" name="Collected" />
                    <Bar dataKey="pendingAmount" fill="#E91E63" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart: Total Amount Distribution */}
              <div className="chart-container">
                <h2>Total Amount Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Collected', value: summary.totalCollected },
                        { name: 'Pending', value: summary.totalPending },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `₹${formatCurrency(v)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Search Filter */}
            <div className="reports-search-wrap">
              <input
                type="text"
                placeholder="Search chits by name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // reset to page 1 when searching
                }}
                className="reports-search-input"
              />
            </div>

            {/* Table below charts */}
            <div className="reports-table-wrap">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Chit Name</th>
                    <th>Members</th>
                    <th>Total Amount</th>
                    <th>Collected</th>
                    <th>Pending</th>
                    <th>Wallet (after commission)</th>
                    <th>Start Date</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item) => (
                    <tr
                      key={item.chitId}
                      className="report-row"
                      onClick={() => openChit(item.chitId)}
                    >
                      <td>{item.chitName}</td>
                      <td>{item.totalMembers}</td>
                      <td>₹{formatCurrency(item.totalAmount)}</td>
                      <td>₹{formatCurrency(item.collectedAmount)}</td>
                      <td>₹{formatCurrency(item.pendingAmount)}</td>
                      <td>₹{formatCurrency(item.finalWallet)}</td>
                      <td>
                        {item.startDate
                          ? new Date(item.startDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* PAGINATION */}
              <div className="pagination-container">
                <button
                  disabled={currentPage === 1}
                  onClick={() => goToPage(currentPage - 1)}
                >
                  Prev
                </button>

                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    className={currentPage === idx + 1 ? "active-page" : ""}
                    onClick={() => goToPage(idx + 1)}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Reports;
