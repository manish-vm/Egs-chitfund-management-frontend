// src/components/ContributionHistory.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getContributionsByUser } from '../services/contributionService';
import { useAuth } from '../context/AuthContext';
import './ContributionHistory.css';

const POLL_INTERVAL = 30000;

const ContributionHistory = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  
  // PAGINATION: Determine records for current page
const indexOfLast = currentPage * rowsPerPage;
const indexOfFirst = indexOfLast - rowsPerPage;
const currentRows = filtered.slice(indexOfFirst, indexOfLast);

const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const [loading, setLoading] = useState(false);
  const pollRef = useRef(null);

  const load = useCallback(async () => {
    if (!user || !user._id) return;

    setLoading(true);
    try {
      const res = await getContributionsByUser(user._id);
      const items = res.contributions || res;

      setRecords(items);
      setFiltered(items); // initial load
    } catch (err) {
      console.error("Failed to fetch contributions:", err);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (!user || !user._id) return;

    load();

    pollRef.current = setInterval(() => load(), POLL_INTERVAL);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(pollRef.current);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [user, load]);

  // 🔍 GLOBAL SEARCH FILTER
  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    setCurrentPage(1);

    if (!q) {
      setFiltered(records);
      return;
    }

    const f = records.filter((r) => {
      const chitName = r.chitId?.name || "";
      const month = r.month || "";
      const year = r.year || "";
      const amount = r.amount ? r.amount.toString() : "";
      const paid = r.paidDate ? new Date(r.paidDate).toLocaleString() : "";

      const combined =
        `${chitName} ${month} ${year} ${amount} ${paid}`.toLowerCase();

      return combined.includes(q);
    });

    setFiltered(f);
  }, [searchQuery, records]);

  return (
    <div className="contribution-container-1123">
      <div className="contribution-card-1123">

        <h2 className="contribution-title-1123">
          <span className="icon-1123">📜</span>
          Contribution History
        </h2>

        {/* 🔎 GLOBAL SEARCH BAR */}
        <div className="global-search-1123">
          <input
            type="text"
            placeholder="Search contributions (name, month, year, amount...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading && <div className="contribution-loading">Loading contributions…</div>}

        {!loading && filtered.length === 0 ? (
          <div className="contribution-empty-1123">
            <div className="empty-icon-1123">🕊️</div>
            No matching contributions.
          </div>
        ) : (
          <div className="table-wrapper-1123">
            <table className="contribution-table-1123">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Chit Name</th>
                  <th>Month & Year</th>
                  <th>Amount</th>
                  <th>Paid Date</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((rec, index) =>  (
                  <tr key={rec._id}>
                    <td>{indexOfFirst + index + 1}</td>
                    <td>{rec.chitId?.name || "N/A"}</td>
                    <td>{rec.month || ""} {rec.year || ""}</td>
                    <td className="text-green">₹{rec.amount}</td>
                    <td>{rec.paidDate ? new Date(rec.paidDate).toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      <div className="pagination-1123">
  <button
    disabled={currentPage === 1}
    onClick={() => setCurrentPage(prev => prev - 1)}
  >
    ◀ Prev
  </button>

  {[...Array(totalPages).keys()].map((num) => (
    <button
      key={num}
      className={currentPage === num + 1 ? "active-page-1123" : ""}
      onClick={() => setCurrentPage(num + 1)}
    >
      {num + 1}
    </button>
  ))}

  <button
    disabled={currentPage === totalPages || totalPages === 0}
    onClick={() => setCurrentPage(prev => prev + 1)}
  >
    Next ▶
  </button>
</div>


    </div>
  );
};

export default ContributionHistory;
