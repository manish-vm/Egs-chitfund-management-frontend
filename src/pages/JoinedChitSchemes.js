// src/pages/JoinedChitSchemes.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getJoinedSchemes } from '../services/chit';
import { getContributionsByUser } from '../services/contributionService';
import { useAuth } from '../context/AuthContext';
import {
  LuClock3,
  LuIndianRupee,
  LuUsers,
  LuCalendarDays,
  LuBadgeCheck,
} from 'react-icons/lu';

import '../pages/JoinedChitSchemes.css';

const POLL_INTERVAL = 30000; // 30s

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// duration inference
const deriveMonthsTotal = (entry = {}) => {
  const candidates = [
    entry.durationInMonths,
    entry.duration,
    entry.totalMonths,
    entry.months,
  ];
  for (const c of candidates) {
    if (typeof c !== 'undefined' && c !== null && !Number.isNaN(Number(c))) {
      return Math.max(0, Number(c));
    }
  }
  return null;
};

// count paid contributions
const deriveMonthsPaidFromContributions = (contributions = [], schemeId) => {
  if (!Array.isArray(contributions)) return 0;

  return contributions.filter((p) => {
    if (!p) return false;
    const pid =
      (p.chitId && (p.chitId._id || p.chitId)) || p.chit || p.chitId;
    const matches =
      String(pid || '') === String(schemeId);

    if (!matches) return false;

    if (typeof p.status === 'string') {
      const s = p.status.toLowerCase();
      return ['success', 'completed', 'paid'].includes(s);
    }
    if (typeof p.success !== 'undefined') return Boolean(p.success);
    if (typeof p.paid !== 'undefined') return Boolean(p.paid);
    if (toNum(p.amount) > 0 && (p.paidDate || p.createdAt || p.updatedAt))
      return true;

    return false;
  }).length;
};

// sum paid amount
const sumContributionsAmountForChit = (contributions = [], schemeId) => {
  if (!Array.isArray(contributions)) return 0;

  return contributions.reduce((acc, p) => {
    if (!p) return acc;

    const pid =
      (p.chitId && (p.chitId._id || p.chitId)) || p.chit || p.chitId;
    if (String(pid || '') !== String(schemeId)) return acc;

    const amt = toNum(
      p.amount ?? p.paidAmount ?? p.value ?? p.totalPaid ?? 0
    );
    return acc + amt;
  }, 0);
};

const JoinedChitSchemes = () => {
  const { user } = useAuth();
  const [joined, setJoined] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  // load joined chits
  const loadJoined = useCallback(async () => {
    try {
      const res = await getJoinedSchemes();
      const arr = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : res?.joined || res?.schemes || [];
      setJoined(arr);
    } catch (err) {
      console.error('Error fetching joined schemes:', err);
      setJoined([]);
    }
  }, []);

  // load contributions
  const loadContributions = useCallback(async () => {
    try {
      if (!user || !user._id) {
        setContributions([]);
        return;
      }
      const res = await getContributionsByUser(user._id);
      const arr = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : res?.contributions || [];
      setContributions(arr);
    } catch (err) {
      console.error('Failed to fetch contributions:', err);
      setContributions([]);
    }
  }, [user?._id]);

  // first time + polling
  useEffect(() => {
    let mounted = true;
    let pollId = null;

    const init = async () => {
      setLoading(true);
      await Promise.all([loadJoined(), loadContributions()]);
      if (mounted) setLoading(false);
    };

    init();

    pollId = setInterval(async () => {
      await loadContributions();
      await loadJoined();
    }, POLL_INTERVAL);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadContributions();
        loadJoined();
      }
    };
    const onFocus = () => {
      loadContributions();
      loadJoined();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);

    return () => {
      mounted = false;
      clearInterval(pollId);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
    };
  }, [loadJoined, loadContributions]);

  // enrich entries with computed values
  const enriched = useMemo(() => {
    return joined.map((entry) => {
      const id = entry._id || entry.id || '';
      const monthsTotal = deriveMonthsTotal(entry);
      const monthsPaid = deriveMonthsPaidFromContributions(
        contributions,
        id
      );
      const monthsPending =
        typeof monthsTotal === 'number' && monthsTotal >= 0
          ? Math.max(0, monthsTotal - monthsPaid)
          : null;

      const amountPerMonth = toNum(
        entry.amount ??
          entry.monthlyAmount ??
          entry.installmentAmount ??
          entry.contributionAmount ??
          0
      );

      const amountPaid = sumContributionsAmountForChit(
        contributions,
        id
      );

      const totalPayable =
        typeof monthsTotal === 'number' && monthsTotal > 0
          ? amountPerMonth
          : null;

      const amountRemaining =
        totalPayable !== null
          ? Math.max(0, totalPayable - amountPaid)
          : null;

      let isClosed = false;
      if (totalPayable !== null) {
        isClosed = amountPaid >= totalPayable;
      } else {
        const fallbackTotal = toNum(entry.totalAmount ?? entry.amount ?? 0);
        if (fallbackTotal > 0)
          isClosed = amountPaid >= fallbackTotal;
      }

      return {
        ...entry,
        monthsTotal,
        monthsPaid,
        monthsPending,
        amountPerMonth,
        amountPaid,
        totalPayable,
        amountRemaining,
        isClosed,
      };
    });
  }, [joined, contributions]);

  // ⭐ GLOBAL SEARCH STATE ⭐
  const [globalSearch, setGlobalSearch] = useState("");

  // ⭐ GLOBAL SEARCH FILTER ⭐
  const filtered = useMemo(() => {
    const term = globalSearch.trim().toLowerCase();
    if (!term) return enriched;

    return enriched.filter((entry) => {
      const name = (entry.name || entry.chitName || "")
        .toLowerCase();
      const amount = String(
        entry.amountPerMonth || entry.amount || ""
      ).toLowerCase();
      const members = String(
        entry.totalMembers || (entry.members?.length ?? "")
      ).toLowerCase();
      const duration = String(
        entry.durationInMonths || entry.duration || ""
      ).toLowerCase();

      const startDate = entry.startDate
        ? new Date(entry.startDate)
            .toLocaleDateString()
            .toLowerCase()
        : "";

      return (
        name.includes(term) ||
        amount.includes(term) ||
        members.includes(term) ||
        duration.includes(term) ||
        startDate.includes(term)
      );
    });
  }, [enriched, globalSearch]);

  return (
    <div className="joined-container">
      <div className="joined-header">
        <LuBadgeCheck className="joined-header-icon" />
        <h2>Your Joined Chit Schemes</h2>
      </div>

      {/* 🔎 GLOBAL SEARCH BAR */}
        <div className="global-search-1123">
          <input
            type="text"
            placeholder="Search chits by name, duration, starting date..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
        </div>

      {/* RESULTS */}
      {loading ? (
        <div className="joined-empty">Loading your schemes…</div>
      ) : enriched.length === 0 ? (
        <div className="joined-empty">
          You haven’t joined any chit schemes yet.
        </div>
      ) : filtered.length === 0 ? (
        <div className="joined-empty">
          No chit schemes match your search.
        </div>
      ) : (
        filtered.map((entry) => {
          const id = entry._id || entry.id || "unknown";
          const name =
            entry.name || entry.chitName || "Unnamed Scheme";
          const members =
            entry.totalMembers ??
            (entry.members ? entry.members.length : "N/A");
          const duration =
            entry.durationInMonths ??
            entry.duration ??
            entry.totalMonths ??
            "N/A";

          const startDate = entry.startDate
            ? new Date(entry.startDate).toLocaleDateString()
            : entry.createdAt
            ? new Date(entry.createdAt).toLocaleDateString()
            : "—";

          return (
            <div key={id} className="joined-card">
              <div className="joined-card-head">
                <h3 className="joined-title">{name}</h3>
                <span
                  className={`chit-badge ${
                    entry.isClosed ? "badge-closed" : "badge-active"
                  }`}
                >
                  {entry.isClosed ? "Closed" : "Active"}
                </span>
              </div>

              <div className="joined-details">
                <div className="joined-item">
                  <LuIndianRupee className="joined-icon green" />
                  <span className="joined-label">
                    Chit Amount :
                  </span>{" "}
                  ₹
                  {entry.amountPerMonth ??
                    entry.amount ??
                    entry.totalAmount ??
                    "N/A"}
                </div>

                <div className="joined-item">
                  <LuUsers className="joined-icon indigo" />
                  <span className="joined-label">Members:</span>{" "}
                  {members}
                </div>

                <div className="joined-item">
                  <LuClock3 className="joined-icon yellow" />
                  <span className="joined-label">Duration:</span>{" "}
                  {duration} months
                </div>

                <div className="joined-item">
                  <LuCalendarDays className="joined-icon pink" />
                  <span className="joined-label">
                    Start Date:
                  </span>{" "}
                  {startDate}
                </div>

                <div className="joined-item">
                  <LuBadgeCheck className="joined-icon teal" />
                  <span className="joined-label">Dues Paid:</span>{" "}
                  {entry.monthsPaid ?? 0}
                </div>

                <div className="joined-item">
                  <LuBadgeCheck className="joined-icon red" />
                  <span className="joined-label">
                    Dues Pending:
                  </span>{" "}
                  {entry.monthsTotal
                    ? entry.monthsPending ?? "—"
                    : "—"}
                </div>

                <div className="joined-item">
                  <LuIndianRupee className="joined-icon green" />
                  <span className="joined-label">
                    Amount Paid:
                  </span>{" "}
                  ₹
                  {Number(entry.amountPaid || 0).toLocaleString(
                    "en-IN"
                  )}
                </div>

                <div className="joined-item">
                  <LuIndianRupee className="joined-icon red" />
                  <span className="joined-label">
                    Amount Remaining:
                  </span>{" "}
                  {entry.totalPayable !== null
                    ? `₹${Number(
                        entry.amountRemaining || 0
                      ).toLocaleString("en-IN")}`
                    : "—"}
                </div>
              </div>

              <div className="joined-id">
                Scheme ID:{" "}
                <span>
                  {String(id).slice(-6).toUpperCase()}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default JoinedChitSchemes;
