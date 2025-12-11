import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import './ChitDetails.css';

const money = (v) => Number(v || 0).toLocaleString('en-IN');

const GeneratedChitDetails = () => {
  // helpers from ChitDetails
  const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

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
  const { chitId, generatedId } = useParams();
  const navigate = useNavigate();
  const [chit, setChit] = useState(null);
  const [generatedRow, setGeneratedRow] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getUserName = (contrib) => {
    const userId = contributionContributorId(contrib);
    if (userId && chit?.joinedUsers) {
      const user = chit.joinedUsers.find(u => {
        if (typeof u === 'string') return u === userId;
        return normIdStr(u._id || u.id) === userId;
      });
      if (user) {
        if (typeof user === 'string') return 'Unknown User';
        return user.name || user.user?.name || 'Unknown User';
      }
    }
    // Fallback to direct name from contribution
    return contrib.user?.name || contrib.payer?.name || 'Unknown User';
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Load chit details
      const chitRes = await api.get(`/chit/${chitId}`);
      const chitData = chitRes.data?.chit || chitRes.data;
      setChit(chitData);

      // Load specific generated row
      const generatedRes = await api.get(`/generateChit/chit/${chitId}/generated/${generatedId}`);
      const generatedData = generatedRes.data.row;
      setGeneratedRow(generatedData);

      // Load contributions for this chit (we'll filter by date later)
      const contribRes = await api.get(`/contributions/chit/${chitId}`);
      const contribData = contribRes.data?.contributions || contribRes.data || [];
      setContributions(Array.isArray(contribData) ? contribData : []);

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load generated chit details');
    } finally {
      setLoading(false);
    }
  }, [chitId, generatedId]);

  useEffect(() => {
    if (chitId && generatedId) {
      loadData();
    }
  }, [chitId, generatedId, loadData]);

  // Filter contributions for this generated chit (by date)
  const relevantContributions = contributions.filter(contrib => {
    if (!generatedRow?.date) return false;
    const contribDate = new Date(contrib.createdAt || contrib.date);
    const generatedDate = new Date(generatedRow.date);
    // Match contributions from the same month/year as the generated chit
    return contribDate.getMonth() === generatedDate.getMonth() &&
           contribDate.getFullYear() === generatedDate.getFullYear();
  });

  const totalCollected = relevantContributions.reduce((sum, contrib) =>
    sum + Number(contrib.amount || 0), 0
  );

  const totalMembers = chit?.joinedUsers?.length || chit?.totalMembers || 0;
  const expectedAmount =  Number(chit?.amount || chit?.monthlyAmount || 0);
  const pendingAmount = Math.max(0, expectedAmount - totalCollected);

  if (loading) return <div className="chit-loading">Loading...</div>;
  if (error) return (
    <div className="chit-error">
      <Sidebar />
      <main className="chit-details-main"><div style={{ padding: 20 }}>Error: {error}</div></main>
    </div>
  );
  if (!chit || !generatedRow) return <div className="chit-empty">Generated chit not found</div>;

  return (
    <div className="chit-details-container">
      <Sidebar />
      <main className="chit-details-main">
        <header className="chit-header">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
          <h1 className="chit-title">{generatedRow.chitName || `Generated Chit #${generatedRow.chitNo || generatedRow.chitNoSeq}`}</h1>
          <div className="chit-meta">
            <div>Generated: {new Date(generatedRow.date).toLocaleDateString()}</div>
            <div>Parent Chit: {chit.name || chit.chitName}</div>
          </div>
        </header>

        <section className="chit-summary">
          <div className="summary-card">
            <h3>Monthly Overview</h3>
            <div className="grid">
              <div><strong>Total Members</strong><div>{totalMembers}</div></div>
              <div><strong>Monthly Amount</strong><div>₹{money(chit.amount || chit.monthlyAmount)}</div></div>
              <div><strong>Collected</strong><div className="collected">₹{money(totalCollected)}</div></div>
              <div><strong>Pending</strong><div className="pending">₹{money(pendingAmount)}</div></div>
            </div>
          </div>

          <div className="members-card">
            <h3>Member Contributions ({relevantContributions.length})</h3>
            <ul className="members-list">
              {relevantContributions.length > 0 ? (
                relevantContributions.map((contrib, idx) => {
                  const userName = getUserName(contrib);
                  const amount = Number(contrib.amount || 0);
                  const date = new Date(contrib.createdAt || contrib.date).toLocaleDateString();

                  return (
                    <li key={contrib._id || idx} className="member-row">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div className="member-name">{userName}</div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <div className="member-meta-sucess">₹{money(amount)}</div>
                          <div className="muted" style={{ fontSize: 12 }}>{date}</div>
                        </div>
                      </div>
                    </li>
                  );
                })
              ) : (
                <li>No contributions found for this month</li>
              )}
            </ul>
          </div>
        </section>

        <section className="chit-breakdown">
          <h3>Generated Chit Details</h3>
          <div className="breakdown-grid">
            <div className="breakdown-item">
              <div className="label">Chit Number</div>
              <div className="value">{generatedRow.chitNo || generatedRow.chitNoSeq}</div>
            </div>

            <div className="breakdown-item">
              <div className="label">Wallet Balance</div>
              <div className="value">₹{money(generatedRow.walletAmount)}</div>
            </div>

            <div className="breakdown-item">
              <div className="label">Bid Amount</div>
              <div className="value">₹{money(generatedRow.bidAmount)}</div>
            </div>

            <div className="breakdown-item">
              <div className="label">Distributed Amount</div>
              <div className="value">₹{money(generatedRow.distributed)}</div>
            </div>

            <div className="breakdown-item">
              <div className="label">Generation Date</div>
              <div className="value">{new Date(generatedRow.date).toLocaleDateString()}</div>
            </div>

            <div className="breakdown-item">
              <div className="label">Status</div>
              <div className="value">Active</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default GeneratedChitDetails;
