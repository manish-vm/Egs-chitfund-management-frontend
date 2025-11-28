// src/pages/Payments.js
import React, { useEffect, useMemo, useState } from 'react';
import { getUserPayments, createPayment, getPayment } from '../services/payment';
import './Payments.css';

const POLL_INTERVAL = 10000; // 10s

const StatusBadge = ({ status }) => {
  const map = {
    pending: { text: 'Pending', cls: 'badge-pending' },
    completed: { text: 'Completed', cls: 'badge-completed' },
    failed: { text: 'Failed', cls: 'badge-failed' },
    cancelled: { text: 'Cancelled', cls: 'badge-cancelled' }
  };
  const s = map[status] || { text: status, cls: '' };
  return <span className={`status-badge ${s.cls}`}>{s.text}</span>;
};

const PaymentCard = ({ payment, onRefresh, onDownload }) => {
  return (
    <div className="payment-card">
      <div className="payment-left">
        <div className="payment-chit">{payment.chitId?.name || '—'}</div>
        <div className="payment-amount">₹{payment.amount}</div>
        <div className="payment-meta">
          <small>Created: {new Date(payment.createdAt).toLocaleString()}</small>
        </div>
        <div style={{ marginTop: 8 }}>
          <StatusBadge status={payment.status} />
        </div>
      </div>

      <div className="payment-right">
        {payment.qrDataUrl ? (
          <div className="qr-wrap">
            <img src={payment.qrDataUrl} alt="payment-qr" className="qr-image" />
            <div className="qr-actions">
              <button onClick={() => onDownload(payment)} className="btn small">Download QR</button>
              <button onClick={() => onRefresh(payment._id)} className="btn small ghost">Refresh</button>
            </div>
          </div>
        ) : (
          <div className="no-qr">
            <small>No QR available</small>
          </div>
        )}
      </div>
    </div>
  );
};

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // load user payments
  const load = async () => {
    setLoading(true);
    try {
      const res = await getUserPayments();
      const items = res?.payments || res;
      setPayments(items);
    } catch (err) {
      console.error('Failed to load payments', err);
      setError('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // polling: refresh statuses periodically
    const t = setInterval(async () => {
      try {
        // Refresh each payment status by fetching each payment (or call a batch API)
        const updated = await Promise.all(payments.map((p) => getPayment(p._id).then(r => r.payment).catch(() => null)));
        // Merge updates
        setPayments((prev) => prev.map((p) => {
          const u = updated.find(x => x && x._id === p._id);
          return u ? { ...p, status: u.status, qrDataUrl: u.qrDataUrl, updatedAt: u.updatedAt } : p;
        }));
      } catch (pollErr) {
        // ignore poll errors
      }
    }, POLL_INTERVAL);

    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only start once

  const handleCreatePayment = async (chitId) => {
    setCreating(true);
    try {
      // create payment -> returns payment with qrDataUrl
      const res = await createPayment(chitId, {}); // optional payload
      const p = res.payment || res;
      setPayments((prev) => [p, ...prev]);
    } catch (err) {
      console.error('Create payment failed', err);
      alert('Failed to create payment');
    } finally {
      setCreating(false);
    }
  };

  const handleRefreshPayment = async (id) => {
    try {
      const res = await getPayment(id);
      const p = res.payment || res;
      setPayments((prev) => prev.map((x) => (x._id === p._id ? p : x)));
    } catch (err) {
      console.error('Refresh failed', err);
      alert('Failed to refresh payment');
    }
  };

  const handleDownload = (payment) => {
    if (!payment.qrDataUrl) return;
    // create a link and click
    const link = document.createElement('a');
    link.href = payment.qrDataUrl;
    link.download = `payment_${payment._id}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="payments-page">
      <h2>Payments</h2>
      <p>Scan QR to pay, then refresh status or wait for automatic update.</p>

      <div style={{ marginBottom: 12 }}>
        <button className="btn" onClick={load} disabled={loading}>Refresh List</button>
        {/* Example quick-create: for convenience, provide "Create default payment" for each chit (in real UI you'd have per-chit create) */}
      </div>

      {loading && <div>Loading payments...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <div className="payments-list">
        {payments.length === 0 && <div>No payments yet. Create one from a chit page.</div>}
        {payments.map((p) => (
          <PaymentCard
            key={p._id}
            payment={p}
            onRefresh={handleRefreshPayment}
            onDownload={handleDownload}
          />
        ))}
      </div>
    </div>
  );
};

export default Payments;
