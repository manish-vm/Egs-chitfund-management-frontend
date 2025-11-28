// src/components/PayContribution.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';
import { createPayment } from '../services/payment';

/**
 * PayContribution
 *
 * - Creates a pending payment on backend
 * - Attempts to open UPI app via intent/upi://
 * - If no handler, shows a friendly fallback modal with copyable UPI details & note
 * - Navigates to /payments/redirect/:id where user can request verification
 *
 * Drop-in replacement for your previous component.
 */

const UPIFallbackModal = ({ open, onClose, upiId, payeeName, amount, note }) => {
  if (!open) return null;

  const copyToClipboard = (text) => {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard'));
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      alert('Copied to clipboard');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      left: 0, top: 0, right: 0, bottom: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.45)', zIndex: 9999
    }}>
      <div style={{ width: 560, maxWidth: '94%', background: '#fff', padding: 20, borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
        <h3 style={{ marginTop: 0 }}>Open Payment App — Manual Option</h3>
        <p style={{ marginTop: 6, color: '#444' }}>
          Your browser couldn't open a UPI app. You can either open your UPI app manually and pay,
          or copy the details below and paste them into your UPI app.
        </p>

        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 13, color: '#666' }}>UPI ID</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <input readOnly value={upiId || ''} style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd' }} />
            <button className="btn" onClick={() => copyToClipboard(upiId)}>Copy</button>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 13, color: '#666' }}>Amount</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <input readOnly value={amount || ''} style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd' }} />
            <button className="btn" onClick={() => copyToClipboard(String(amount))}>Copy</button>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 13, color: '#666' }}>Payment Note (important)</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <input readOnly value={note || ''} style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd' }} />
            <button className="btn" onClick={() => copyToClipboard(note)}>Copy</button>
          </div>
          <small style={{ color: '#666', display: 'block', marginTop: 6 }}>
            Include the full note in your payment so the admin can identify it (it contains the payment id).
          </small>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
          <button className="btn ghost" onClick={onClose}>Close</button>
          <a
            className="btn"
            style={{ textDecoration: 'none' }}
            href="https://play.google.com/store/search?q=upi%20app"
            target="_blank"
            rel="noreferrer"
          >
            Install UPI App
          </a>
        </div>
      </div>
    </div>
  );
};

const PayContribution = ({ userId, chit }) => {
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  // fallback modal states
  const [showFallback, setShowFallback] = useState(false);
  const [fallbackData, setFallbackData] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const now = new Date();
    const currentMonth = now.toLocaleString('default', { month: 'long' });
    setMonth(currentMonth);

    if (chit) {
      const baseMonthly = (chit.amount || 0) / (chit.durationInMonths || 1);
      const monthlyTotal = baseMonthly ; // change if needed
      setAmount(Math.round(monthlyTotal));
    }
  }, [chit]);

  const buildUpiUrls = (upiId, payeeName, amt, note) => {
    const pa = encodeURIComponent(upiId);
    const pn = encodeURIComponent(payeeName);
    const am = encodeURIComponent(String(amt));
    const tn = encodeURIComponent(note || '');
    const upiUrl = `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}`;
    // Intent URL for Android Chrome (uses Google Pay package as example)
    const intentUrl = `intent://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;
    return { upiUrl, intentUrl };
  };

  // Try to open UPI; if not handled, show fallback modal after short timeout
  const tryOpenUpi = (upiId, payeeName, amt, note, paymentId) => {
    const { upiUrl, intentUrl } = buildUpiUrls(upiId, payeeName, amt, note);
    const ua = navigator.userAgent || '';
    const isAndroid = /Android/i.test(ua);
    const isChrome = /Chrome/i.test(ua) && !/Edge/i.test(ua);

    const start = Date.now();
    let handled = false;

    const openAndDetect = (urlToOpen) => {
      try {
        // attempt navigation
        window.location.href = urlToOpen;
      } catch (err) {
        console.warn('open url failed', err);
      }

      // heuristic: if user didn't leave within 1.5s, show fallback
      setTimeout(() => {
        const elapsed = Date.now() - start;
        if (!handled && elapsed < 2500) {
          setFallbackData({ upiId, payeeName, amt, note, paymentId, upiUrl });
          setShowFallback(true);
        }
      }, 1500);
    };

    if (isAndroid && isChrome) {
      openAndDetect(intentUrl);
    } else {
      openAndDetect(upiUrl);
    }
  };

  const handlePay = async () => {
    if (!chit) {
      alert('Chit info missing');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        amount,
        note: `ChitPayment:${chit._id}`,
        month,
        year
      };

      const res = await createPayment(chit._id, payload);
      // createPayment should return { success, payment, upi }
      const payment = res?.payment || res;
      if (!payment || !payment._id) {
        console.error('createPayment returned no payment id:', res);
        alert('Payment created but server response missing id. Check console.');
        setLoading(false);
        return;
      }

      const upi = res.upi || {
        upiId: process.env.REACT_APP_DEFAULT_UPI_ID || 'example@upi',
        payeeName: process.env.REACT_APP_DEFAULT_PAYEE_NAME || 'ChitAdmin'
      };

      const note = `Chit:${chit.name}#pid:${payment._id}`;

      // attempt to open UPI app; if it fails, show fallback modal
      tryOpenUpi(upi.upiId, upi.payeeName, amount, note, payment._id);

      // navigate to redirect page where user can request verification
      navigate(`/payments/redirect/${payment._id}`);
    } catch (err) {
      console.error('Payment create failed', err);
      alert(err?.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 shadow-lg rounded-2xl p-6 max-w-md mx-auto mt-8">
      <h3 className="text-2xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
        <FaMoneyBillWave className="text-green-600" /> Pay Contribution
      </h3>

      <div className="space-y-2 text-gray-700">
        <p className="flex items-center gap-2">
          <FaCalendarAlt className="text-blue-500" />
          <span className="font-medium">Month:</span> {month} {year}
        </p>
        <p className="text-lg font-semibold text-green-700">
          ₹ {amount}
        </p>
      </div>

      <button
        onClick={handlePay}
        className="mt-5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 px-4 rounded transition duration-200"
        disabled={loading}
      >
        {loading ? 'Preparing payment...' : 'Pay Now'}
      </button>

      <UPIFallbackModal
        open={showFallback}
        onClose={() => setShowFallback(false)}
        upiId={fallbackData?.upiId}
        payeeName={fallbackData?.payeeName}
        amount={fallbackData?.amt}
        note={fallbackData?.note}
      />
    </div>
  );
};

export default PayContribution;
