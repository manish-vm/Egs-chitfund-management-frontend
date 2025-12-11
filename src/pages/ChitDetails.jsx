// src/pages/ChitDetails.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api'; // your axios instance
import { getChitById } from '../services/chit';
import { fetchGeneratedRows, createGeneratedRow } from '../services/generatedChit';
import './ChitDetails.css';

const money = (v) => Number(v || 0).toLocaleString('en-IN');
const COMMISSION_PERCENT = 0.05;

/* helpers (computeFromTCVandBid, monthKeyFromDate, toNum, deriveMonthsTotal) omitted for brevity — keep your existing functions */
const computeFromTCVandBid = (tcv = 0, bid = 0) => {
  const TCV = Number(tcv || 0);
  const RCA = Number(bid || 0);
  const commission = Number((COMMISSION_PERCENT * TCV).toFixed(2));
  const GWB = Math.max(0, TCV - RCA);
  const walletFromBid = Number(Math.max(0, RCA - commission).toFixed(2));
  const distributed = Number(GWB.toFixed(2));
  return { TCV, RCA, commission, GWB, walletFromBid, distributed };
};

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const deriveMonthsTotal = (chit = {}) => {
  const candidates = [
    chit.durationInMonths,
    chit.duration,
    chit.totalMonths,
    chit.months,
  ];
  for (const c of candidates) {
    if (typeof c !== 'undefined' && c !== null && !Number.isNaN(Number(c))) {
      return Math.max(0, Number(c));
    }
  }
  return null;
};

// robust contributor helpers (same improved logic suggested earlier)
const normIdStr = (v) => {
  if (v === null || typeof v === 'undefined') return '';
  if (typeof v === 'object') {
    try { return String(v._id || v.id || v.toString()).trim(); } catch (e) { return String(v).trim(); }
  }
  return String(v).trim();
};
const pickFirst = (obj, paths = []) => {
  if (!obj) return undefined;
  for (const p of paths) {
    const parts = p.split('.');
    let cur = obj;
    let ok = true;
    for (const part of parts) {
      if (cur && (typeof cur === 'object') && (part in cur)) {
        cur = cur[part];
      } else {
        ok = false;
        break;
      }
    }
    if (ok && typeof cur !== 'undefined' && cur !== null && String(cur).trim() !== '') return cur;
  }
  return undefined;
};
const contributionContributorId = (p) => {
  if (!p) return null;
  const candidatePaths = [
    'user._id', 'user', 'userId', 'payer._id', 'payer', 'member', 'memberId',
    'contributor', 'createdBy', 'createdBy._id', 'payerId'
  ];
  for (const path of candidatePaths) {
    const v = pickFirst(p, [path]);
    if (typeof v !== 'undefined' && v !== null && String(v).trim() !== '') {
      return normIdStr(v);
    }
  }
  if (p.user && typeof p.user === 'object') {
    if (p.user._id) return normIdStr(p.user._id);
    if (p.user.id) return normIdStr(p.user.id);
    if (p.user.email) return normIdStr(p.user.email);
  }
  const email = pickFirst(p, ['user.email', 'payerEmail', 'email', 'payer.email']);
  if (email) return normIdStr(email);
  return null;
};
const isContributionPaid = (c) => {
  if (!c) return false;
  if (typeof c.status === 'string') {
    const s = c.status.toLowerCase();
    if (['success', 'completed', 'paid', 'ok'].includes(s)) return true;
  }
  if (typeof c.success !== 'undefined') return Boolean(c.success);
  if (typeof c.paid !== 'undefined') return Boolean(c.paid);
  if (typeof c.isPaid !== 'undefined') return Boolean(c.isPaid);
  const amount = toNum(c.amount ?? c.paidAmount ?? c.value ?? c.paymentAmount ?? 0);
  if (amount > 0 && (c.paidDate || c.createdAt || c.updatedAt || c.paymentDate)) return true;
  return false;
};
const contributionChitId = (p) => {
  if (!p) return null;
  const candidate = pickFirst(p, ['chitId._id', 'chitId', 'chit', 'chit._id', 'chitId.id']);
  return candidate ? normIdStr(candidate) : null;
};

// count months paid for a specific member on a chit (memberId optional)
const countMemberMonthsPaid = (contributions = [], schemeId, memberId, memberEmail) => {
  if (!Array.isArray(contributions) || (!memberId && !memberEmail)) return 0;
  const schemeIdStr = normIdStr(schemeId);
  let matched = 0;
  for (const p of contributions) {
    if (!p) continue;
    const pChit = contributionChitId(p);
    if (!pChit) continue;
    if (schemeIdStr && normIdStr(pChit) !== schemeIdStr) continue;
    const cid = contributionContributorId(p);
    let contributorMatches = false;
    if (cid) {
      if (memberId && normIdStr(cid) === normIdStr(memberId)) contributorMatches = true;
      else if (memberEmail && cid.toLowerCase() === memberEmail.toLowerCase()) contributorMatches = true;
    }
    if (!contributorMatches && memberEmail) {
      const contribEmail = pickFirst(p, ['user.email', 'payerEmail', 'email', 'payer.email']);
      if (contribEmail && String(contribEmail).toLowerCase() === String(memberEmail).toLowerCase()) contributorMatches = true;
    }
    if (!contributorMatches) continue;
    if (!isContributionPaid(p)) continue;
    matched += 1;
  }
  return matched;
};

/* -------------------- Member resolver -------------------- */
const resolveMemberData = (u) => {
  if (!u) return { id: null, name: null, email: null };
  if (typeof u === 'object' && u.user) {
    const user = typeof u.user === 'object' ? u.user : null;
    return {
      id: user?._id || String(u.user),
      name: user?.name || `Member`,
      email: user?.email || ''
    };
  }
  if (typeof u === 'object' && (u._id || u.name || u.email)) {
    return { id: u._id || u.id || null, name: u.name || 'Member', email: u.email || '' };
  }
  if (typeof u === 'string') {
    return { id: u, name: 'Member', email: '' };
  }
  return { id: null, name: String(u), email: '' };
};

/* -------------------- Component -------------------- */
const ChitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  // memberId passed from AdminUserDetail link: /admin/chits/:chitId?memberId=<userId>
  const memberIdFromQuery = search.get('memberId') || null;

  const [chit, setChit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rowsLoading, setRowsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [serverDebug, setServerDebug] = useState(null);

  const [bidAmount, setBidAmount] = useState('');
  const [walletAmount, setWalletAmount] = useState('');

  const [generatedRows, setGeneratedRows] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editValues, setEditValues] = useState({ bidAmount: '', walletAmount: '', distributed: '' });
  const [rowActionLoading, setRowActionLoading] = useState(false);

  const [contributionsForChit, setContributionsForChit] = useState([]);
  const [contribsLoading, setContribsLoading] = useState(false);
  const [bidRequestsForChit, setBidRequestsForChit] = useState([]);
  const [bidRequestsLoading, setBidRequestsLoading] = useState(false);

  const handleMemberClick = (memberObj) => {
    const { id: memberId } = resolveMemberData(memberObj);
    if (!memberId) return;
    navigate(`/admin/users/${memberId}`);
  };

  const getReleasedAmountFromRow = (r) => {
    if (!r) return 0;
    if (typeof r.releasedAmount !== 'undefined' && r.releasedAmount !== null) return Number(r.releasedAmount || 0);
    if (typeof r.released !== 'undefined' && r.released !== null && !isNaN(Number(r.released))) return Number(r.released || 0);
    if (r.isRelease || r.isReleased) return Number(r.distributed || 0);
    return 0;
  };

  const loadGeneratedRows = useCallback(async (chitId, tcv = 0) => {
    if (!chitId) {
      setGeneratedRows([]);
      return;
    }
    setRowsLoading(true);
    setError('');
    setServerDebug(null);
    try {
      const rows = await fetchGeneratedRows(chitId, null);
      if (!Array.isArray(rows) || rows.length === 0) {
        setGeneratedRows([]);
        return;
      }

      const norm = rows.map(r => ({
        ...r,
        parsedDate: r.date ? new Date(r.date) : new Date(),
        walletAmountNum: Number(r.walletAmount || 0),
        bidAmountNum: Number(r.bidAmount || 0),
        distributedNum: Number(r.distributed || 0),
        releasedAmountNum: Number(getReleasedAmountFromRow(r) || 0),
      }));

       norm.sort((a, b) => {
        const da = a.parsedDate ? a.parsedDate.getTime() : 0;
        const db = b.parsedDate ? b.parsedDate.getTime() : 0;
        if (da !== db) return da - db;
        return (a.chitNo || 0) - (b.chitNo || 0);
      });

      let runningWallet = 0;
      let runningReleased = 0;
      let totalAutoPayouts = 0;

      // norm is already sorted oldest → newest, so index gives us
      // "1st generated chit", "2nd", "3rd", etc.
      const withCum = norm.map((r, index) => {
        runningWallet += Number(r.walletAmountNum || 0);
        runningReleased += Number(r.releasedAmountNum || 0);

        const availableAfterExplicitReleases = Math.max(0, runningWallet - runningReleased);

        let autoPayoutsThisRow = 0;
        let autoPayoutTotalAmount = 0;
        if (tcv > 0) {
          autoPayoutsThisRow = Math.floor(availableAfterExplicitReleases / tcv);
          if (autoPayoutsThisRow > 0) {
            autoPayoutTotalAmount = autoPayoutsThisRow * tcv;
            runningReleased += autoPayoutTotalAmount;
            totalAutoPayouts += autoPayoutsThisRow;
          }
        }

        const cumBefore = runningWallet;
        const remainingAfterReleases = Math.max(0, runningWallet - runningReleased);

        return {
          ...r,
          // sequential chit number from first ever generated chit
          chitNoSeq: index + 1,
          cumWalletBeforeReleases: cumBefore,
          cumWalletRemainingAfterReleases: remainingAfterReleases,
          autoPayoutsThisRow,
          autoPayoutTotalAmount,
          totalAutoPayoutsSoFar: totalAutoPayouts,
          totalExplicitReleasedSoFar: Math.max(0, runningReleased - (totalAutoPayouts * tcv)),
          dateDisplay: r.parsedDate.toLocaleDateString(),
        };
      });


      withCum.sort((a, b) => {
        const da = a.parsedDate ? a.parsedDate.getTime() : 0;
        const db = b.parsedDate ? b.parsedDate.getTime() : 0;
        if (da !== db) return db - da;
        return (b.chitNo || 0) - (a.chitNo || 0);
      });

      setGeneratedRows(withCum);
    } catch (err) {
      console.error('loadGeneratedRows error', err);
      setError(err?.message || 'Failed to load generated rows');
      setServerDebug(err?.serverData || err);
      setGeneratedRows([]);
    } finally {
      setRowsLoading(false);
    }
  }, []);

  const loadContributionsForChit = useCallback(async (chitId) => {
    if (!chitId) {
      setContributionsForChit([]);
      return;
    }
    setContribsLoading(true);
    try {
      let resp = null;
      try {
        resp = await api.get(`/contributions/chit/${chitId}`);
      } catch (err) {
        try {
          resp = await api.get('/contributions', { params: { chitId } });
        } catch (err2) {
          resp = null;
        }
      }
      const list = resp?.data?.contributions ?? resp?.data ?? resp ?? [];
      const arr = Array.isArray(list) ? list : (Array.isArray(list?.data) ? list.data : []);
      setContributionsForChit(arr);
    } catch (err) {
      console.error('Failed to load contributions for chit', err);
      setContributionsForChit([]);
    } finally {
      setContribsLoading(false);
    }
  }, []);

  const loadBidRequestsForChit = useCallback(async (chitId) => {
    if (!chitId) {
      setBidRequestsForChit([]);
      return;
    }
    setBidRequestsLoading(true);
    try {
      const resp = await api.get('/bid-requests');
      const allRequests = resp?.data ?? [];
      const chitRequests = allRequests.filter(req => req.chitId?._id === chitId || req.chitId === chitId);
      setBidRequestsForChit(chitRequests);
    } catch (err) {
      console.error('Failed to load bid requests for chit', err);
      setBidRequestsForChit([]);
    } finally {
      setBidRequestsLoading(false);
    }
  }, []);

  const hasApprovedBid = (memberId, bidRequests) => {
    return bidRequests.some(req => req.userId === memberId && req.status === 'approved');
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      setServerDebug(null);
      try {
        let res;
        try {
          res = await getChitById(id);
        } catch (e) {
          const resp = await api.get(`/chit/${id}`);
          res = resp.data || resp;
        }
        const data = res?.chit || res;
        if (!data) {
          setError('Chit not found');
          setChit(null);
          setLoading(false);
          return;
        }
        setChit(data);

        const incomingBid = Number(
          data.released?.bidAmount ??
          data.lastBid?.bidAmount ??
          data.bidAmount ??
          data.currentBid ??
          0
        );

        const tcv = Number(data.totalAmount ?? data.amount ?? 0);
        const { walletFromBid } = computeFromTCVandBid(tcv, incomingBid);

        setBidAmount(String(Math.round(incomingBid)));
        setWalletAmount(String(Math.round(walletFromBid)));

        await loadGeneratedRows(data._id || id, tcv);
        await loadContributionsForChit(data._id || id);
        await loadBidRequestsForChit(data._id || id);
      } catch (err) {
        console.error('Failed to load chit:', err);
        setError(err?.response?.data?.message || 'Failed to load chit details');
        setServerDebug(err?.response?.data || null);
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, loadGeneratedRows, loadContributionsForChit]);

  useEffect(() => {
    const onFocus = () => {
      const cid = chit?._id || id;
      const tcv = Number(chit?.totalAmount ?? chit?.amount ?? 0);
      if (cid) {
        loadGeneratedRows(cid, tcv);
        loadContributionsForChit(cid);
        loadBidRequestsForChit(cid);
      }
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [chit, id, loadGeneratedRows, loadContributionsForChit, loadBidRequestsForChit]);

  const handleBidChange = (val) => {
    setBidAmount(val);
    const numericBid = Number(val || 0);
    const tcv = Number(chit?.totalAmount ?? chit?.amount ?? 0);
    const { walletFromBid } = computeFromTCVandBid(tcv, numericBid);
    setWalletAmount(String(Math.round(walletFromBid)));
  };

  const handleWalletChange = (val) => {
    setWalletAmount(val);
    const walletNum = Number(val || 0);
    const tcv = Number(chit?.totalAmount ?? chit?.amount ?? 0);
    const commission = Number((COMMISSION_PERCENT * tcv).toFixed(2));
    const newBid = Math.max(0, walletNum + commission);
    setBidAmount(String(Math.round(newBid)));
  };

  const handleGenerate = async () => {
    if (!chit) {
      setError('No chit loaded');
      return;
    }

    const tcv = Number(chit.totalAmount ?? chit.amount ?? 0);
    const bidNum = Number(bidAmount || 0);
    const walletNum = Number(walletAmount || 0);

    if (isNaN(bidNum) || isNaN(walletNum)) {
      setError('Enter valid numeric values for Bid and Wallet.');
      return;
    }
    if (bidNum < 0 || walletNum < 0) {
      setError('Values cannot be negative.');
      return;
    }

    const computed = computeFromTCVandBid(tcv, bidNum);
    const payloadForChit = { bidAmount: bidNum, walletAmount: walletNum, computed };

    setSaving(true);
    setError('');
    setServerDebug(null);

    try {
      let resp = null;
      try {
        resp = await api.patch(`/chit/${id}/release`, payloadForChit);
      } catch (err) {
        try {
          resp = await api.patch(`/chit/${id}`, payloadForChit);
        } catch (err2) {
          resp = await api.put(`/chit/${id}`, payloadForChit);
        }
      }
      const data = resp?.data || resp;
      const updatedChit = (data && data.chit) ? data.chit : (data && data.updated ? data.updated : null);
      if (updatedChit) setChit(updatedChit);

      const createPayload = {
        chitName: chit.name || chit.chitName || '',
        walletAmount: computed.walletFromBid,
        bidAmount: bidNum,
        distributed: computed.distributed,
      };

      await createGeneratedRow(chit._id || id, createPayload);
      await loadGeneratedRows(chit._id || id, tcv);
      await loadContributionsForChit(chit._id || id);

      alert('Chit generated !!!');
    } catch (err) {
      console.error('Generate error', err);
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message || err?.message || 'Server error';
      const friendly = status ? `Server returned ${status}: ${serverMsg}` : `Error: ${serverMsg}`;
      setError(friendly);
      setServerDebug(err?.response?.data || err);
      alert(`Failed to generate chit:\n\n${friendly}`);
    } finally {
      setSaving(false);
    }
  };

  const updateGeneratedRow = async (row) => {
    if (!row || !row._id) {
      alert('Row id missing');
      return;
    }
    setRowActionLoading(true);
    try {
      const payload = {
        chitName: editValues.chitName ?? row.chitName,
        walletAmount: Number(editValues.walletAmount || row.walletAmount || 0),
        bidAmount: Number(editValues.bidAmount || row.bidAmount || 0),
        distributed: Number(editValues.distributed || row.distributed || 0),
      };

      const url = `/generateChit/chit/${row.chitId || row.chit || id}/generated/${row._id}`;
      const resp = await api.put(url, payload);

      if (resp?.data?.success || resp?.status === 200) {
        const tcv = Number(chit?.totalAmount ?? chit?.amount ?? 0);
        await loadGeneratedRows(chit._id || id, tcv);
        setEditingRowId(null);
        alert('Row updated');
      } else {
        const msg = (resp?.data?.message) || 'Update failed';
        alert(msg);
      }
    } catch (err) {
      console.error('updateGeneratedRow error', err);
      const msg = err?.response?.data?.message || err?.message || 'Server error';
      alert(`Failed to update row:\n${msg}`);
    } finally {
      setRowActionLoading(false);
    }
  };

  const deleteGeneratedRow = async (row) => {
    if (!row || !row._id) {
      alert('Row id missing');
      return;
    }
   if (!window.confirm(`Delete generated chit #${row.chitNoSeq ?? row.chitNo ?? ''} (${row.dateDisplay || ''})? This cannot be undone.`)) return;

    setRowActionLoading(true);
    try {
      const url = `/generateChit/chit/${row.chitId || row.chit || id}/generated/${row._id}`;
      const resp = await api.delete(url);

      if (resp?.data?.success || resp?.status === 200 || resp?.status === 204) {
        const tcv = Number(chit?.totalAmount ?? chit?.amount ?? 0);
        await loadGeneratedRows(chit._id || id, tcv);
        await loadContributionsForChit(chit._id || id);
        alert('Row deleted');
      } else {
        const msg = (resp?.data?.message) || 'Delete failed';
        alert(msg);
      }
    } catch (err) {
      console.error('deleteGeneratedRow error', err);
      const msg = err?.response?.data?.message || err?.message || 'Server error';
      alert(`Failed to delete row:\n${msg}`);
    } finally {
      setRowActionLoading(false);
    }
  };

  const startEditRow = (row) => {
    setEditingRowId(row._id);
    setEditValues({
      chitName: row.chitName || '',
      bidAmount: row.bidAmountNum ?? row.bidAmount ?? 0,
      walletAmount: row.walletAmountNum ?? row.walletAmount ?? 0,
      distributed: row.distributedNum ?? row.distributed ?? 0,
    });
  };

  const cancelEdit = () => {
    setEditingRowId(null);
    setEditValues({ bidAmount: '', walletAmount: '', distributed: '' });
  };

  if (loading) return <div className="chit-loading">Loading...</div>;
  if (error && !chit) return (
    <div className="chit-error">
      <Sidebar />
      <main className="chit-details-main"><div style={{ padding: 20 }}>Error: {error}</div></main>
    </div>
  );
  if (!chit) return <div className="chit-empty">Chit not found</div>;

  const tcv = Number(chit.totalAmount ?? chit.amount ?? 0);
  const bidNum = Number(bidAmount || 0);
  const { commission, GWB, distributed } = computeFromTCVandBid(tcv, bidNum);

  const totalMembers =
    typeof chit.totalMembers === 'number'
      ? chit.totalMembers
      : chit.members
      ? chit.members.length
      : chit.joinedUsers
      ? chit.joinedUsers.length
      : chit.currentMembers
      ? chit.currentMembers.length
      : 0;

  const collected = Number(chit.collectedAmount ?? chit.collected ?? 0);
  const pendingAmount = Math.max(0, tcv - collected);

  return (
    <div className="chit-details-container">
      <Sidebar />
      <main className="chit-details-main">
        <header className="chit-header">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
          <h1 className="chit-title">{chit.name || chit.chitName}</h1>
          <div className="chit-meta">
            <div>Created: {chit.createdAt ? new Date(chit.createdAt).toLocaleDateString() : '-'}</div>
            <div>Start Date: {chit.startDate ? new Date(chit.startDate).toLocaleDateString() : '-'}</div>
          </div>
        </header>

        <section className="chit-summary">
          <div className="summary-card">
            <h3>Overview</h3>
            <div className="grid">
              <div><strong>Total Members</strong><div>{totalMembers}</div></div>
              <div><strong>Chit Amount (tcv)</strong><div>₹{money(tcv)}</div></div>
              <div><strong>Collected</strong><div className="collected">₹{money(collected)}</div></div>
              <div><strong>Pending</strong><div className="pending">₹{money(pendingAmount)}</div></div>
            </div>
          </div>

          <div className="members-card">
            <h3>Members ({totalMembers})</h3>

            {/* If admin navigated here for a particular member, show that member highlighted */}
            <ul className="members-list">
              {(Array.isArray(chit.joinedUsers) && chit.joinedUsers.length > 0) ? (
                chit.joinedUsers.map((u, idx) => {
                  const member = resolveMemberData(u);
                  const key = member.id || `${member.name}-${idx}`;
                  const clickable = !!member.id;

                  // compute monthsPaid & monthsPending using contributionsForChit
                  // important: use memberIdFromQuery as fallback to focus on specific user
                  const targetMemberId = memberIdFromQuery || member.id;
                  const monthsPaid = targetMemberId ? countMemberMonthsPaid(contributionsForChit, chit._id || id, targetMemberId, member.email) : 0;
                  const monthsTotal = deriveMonthsTotal(chit);
                  const monthsPending = (typeof monthsTotal === 'number' && monthsTotal >= 0)
                    ? Math.max(0, monthsTotal - monthsPaid)
                    : '—';

                  const isTarget = memberIdFromQuery && normIdStr(memberIdFromQuery) === normIdStr(member.id);

                  return (
                    <li
                      key={key}
                      className={`member-row ${isTarget ? 'member-highlight' : ''}`}
                      role={clickable ? 'button' : 'listitem'}
                      tabIndex={clickable ? 0 : -1}
                      onClick={() => clickable && handleMemberClick(u)}
                      onKeyDown={(e) => { if (clickable && (e.key === 'Enter' || e.key === ' ')) handleMemberClick(u); }}
                      style={{ cursor: clickable ? 'pointer' : 'default', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div className="member-name">{member.name || 'Member'} {hasApprovedBid(member.id, bidRequestsForChit) ? '(chit taken)' : ''}</div>
                        {isTarget && <div className="muted" style={{ fontSize: 12 }}> (Filtered user)</div>}
                      </div>

                      <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
                        <div className="member-meta-sucess"><strong>Dues Paid:</strong> {monthsPaid}</div>
                        <div className="member-meta-danger"><strong>Dues Pending:</strong> {monthsPending}</div>
                      </div>
                    </li>
                  );
                })
              ) : (Array.isArray(chit.currentMembers) && chit.currentMembers.length > 0) ? (
                chit.currentMembers.map((m, idx) => {
                  const member = resolveMemberData(m);
                  const key = member.id || `${member.name}-${idx}`;
                  const clickable = !!member.id;
                  const targetMemberId = memberIdFromQuery || member.id;
                  const monthsPaid = targetMemberId ? countMemberMonthsPaid(contributionsForChit, chit._id || id, targetMemberId, member.email) : 0;
                  const monthsTotal = deriveMonthsTotal(chit);
                  const monthsPending = (typeof monthsTotal === 'number' && monthsTotal >= 0)
                    ? Math.max(0, monthsTotal - monthsPaid)
                    : '—';
                  const isTarget = memberIdFromQuery && normIdStr(memberIdFromQuery) === normIdStr(member.id);

                  return (
                    <li
                      key={key}
                      className={`member-row ${isTarget ? 'member-highlight' : ''}`}
                      role={clickable ? 'button' : 'listitem'}
                      tabIndex={clickable ? 0 : -1}
                      onClick={() => clickable && handleMemberClick(m)}
                      onKeyDown={(e) => { if (clickable && (e.key === 'Enter' || e.key === ' ')) handleMemberClick(m); }}
                      style={{ cursor: clickable ? 'pointer' : 'default', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div className="member-name">{member.name || 'Member'} {hasApprovedBid(member.id, bidRequestsForChit) ? '(chit taken)' : ''}</div>
                        {isTarget && <div className="muted" style={{ fontSize: 12 }}> (Filtered user)</div>}
                      </div>

                      <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
                        <div className="member-meta"><strong>Months Paid:</strong> {monthsPaid}</div>
                        <div className="member-meta"><strong>Months Pending:</strong> {monthsPending}</div>
                      </div>
                    </li>
                  );
                })
              ) : (
                <li>No members yet</li>
              )}
            </ul>

            {contribsLoading && <div style={{ padding: 8, color: '#666' }}>Loading payments data…</div>}
          </div>
        </section>

        {/* rest of ChitDetails unchanged (auction/wallet, generated rows etc.) */}
        <section className="chit-breakdown">
          <h3>Auction / Wallet (Admin editable)</h3>
          <div className="breakdown-grid">
            <div className="breakdown-item">
              <div className="label">Total Chit Amount (TCV) — fixed</div>
              <div className="value">
                <input type="number" value={tcv} readOnly />
              </div>
            </div>

            <div className="breakdown-item edit">
              <div className="label">Bid Amount (RCA)</div>
              <div className="value">
                <input type="number" min="0" value={bidAmount} onChange={(e) => handleBidChange(e.target.value)} />
              </div>
            </div>

            <div className="breakdown-item">
              <div className="label">Commission ({Math.round(COMMISSION_PERCENT * 100)}% of TCV)</div>
              <div className="value">₹{money(commission)}</div>
            </div>

            <div className="breakdown-item edit">
              <div className="label">Wallet Amount (bid − commission)</div>
              <div className="value">
                <input type="number" min="0" value={walletAmount} onChange={(e) => handleWalletChange(e.target.value)} />
              </div>
            </div>

            <div className="breakdown-item">
              <div className="label">Gross Wallet Balance (GWB) — amount to be distributed</div>
              <div className="value">₹{money(GWB)}</div>
            </div>

            <div className="breakdown-item">
              <div className="label">Distributed Amount (to member)</div>
              <div className="value">₹{money(distributed)}</div>
            </div>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button className="btn" onClick={handleGenerate} disabled={saving}>
              {saving ? 'Generating...' : 'Generate Chit'}
            </button>
            <button className="btn ghost" onClick={() => {
              const incomingBid = Number(chit.released?.bidAmount ?? chit.lastBid?.bidAmount ?? chit.bidAmount ?? 0);
              const tcvLocal = Number(chit.totalAmount ?? chit.amount ?? 0);
              const incomingWallet = Number(chit.walletAmount ?? computeFromTCVandBid(tcvLocal, incomingBid).walletFromBid);
              setBidAmount(String(Math.round(incomingBid)));
              setWalletAmount(String(Math.round(incomingWallet)));
              setError('');
              setServerDebug(null);
            }}>Reset</button>
          </div>

          {error && <div style={{ marginTop: 12, color: 'crimson' }}>{error}</div>}
          {serverDebug && <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{JSON.stringify(serverDebug, null, 2)}</pre>}
        </section>

        <section className="chit-table-container" style={{ marginTop: 24 }}>
          <h3 className="chit-table-title">Generated Chit Rows (persisted)</h3>

          {rowsLoading ? (
            <div className="empty-chit">Loading rows...</div>
          ) : (generatedRows.length === 0 ? (
            <div className="empty-chit">No persisted generated chits found.</div>
          ) : (
            <div className="chit-table-wrapper">
              <table className="chit-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Chit No</th>
                    <th>Chit Name</th>
                    <th>Wallet Balance</th>
                    <th>Bid Amount (₹)</th>
                    <th>Distributed (₹)</th>
                    <th>Auto Payouts</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedRows.map((r, i) => (
                    <tr key={`${r._id || r.chitId}-${i}`}>
                      <td>{r.dateDisplay}</td>
                      <td>{r.chitNoSeq ?? r.chitNo}</td>
                      <td>{r.chitName}</td>
                      <td>{Number(r.cumWalletRemainingAfterReleases).toLocaleString('en-IN')}</td>
                      <td>{Number(r.bidAmountNum).toLocaleString('en-IN')}</td>
                      <td>{Number(r.distributedNum).toLocaleString('en-IN')}</td>
                      <td>
                        {r.autoPayoutsThisRow
                          ? `${r.autoPayoutsThisRow} (${Number(r.autoPayoutTotalAmount).toLocaleString('en-IN')})`
                          : '-'}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {editingRowId === r._id ? (
                          <>
                            <input
                              style={{ width: 80, marginRight: 6 }}
                              value={editValues.bidAmount}
                              onChange={(e) => setEditValues(prev => ({ ...prev, bidAmount: e.target.value }))}
                              placeholder="Bid"
                            />
                            <input
                              style={{ width: 80, marginRight: 6 }}
                              value={editValues.walletAmount}
                              onChange={(e) => setEditValues(prev => ({ ...prev, walletAmount: e.target.value }))}
                              placeholder="Wallet"
                            />
                            <input
                              style={{ width: 80, marginRight: 6 }}
                              value={editValues.distributed}
                              onChange={(e) => setEditValues(prev => ({ ...prev, distributed: e.target.value }))}
                              placeholder="Distrib"
                            />
                            <button
                              className="btn btn-sm"
                              onClick={() => updateGeneratedRow(r)}
                              disabled={rowActionLoading}
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-sm ghost"
                              onClick={cancelEdit}
                              disabled={rowActionLoading}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="btn btn-sm" onClick={() => startEditRow(r)}>Edit</button>
                            <button className="btn-delete" onClick={() => deleteGeneratedRow(r)} disabled={rowActionLoading}>Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default ChitDetails;

