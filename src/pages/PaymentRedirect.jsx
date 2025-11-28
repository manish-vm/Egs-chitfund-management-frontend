// src/pages/PaymentRedirect.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPayment, requestVerification } from '../services/payment';
import './PaymentRedirect.css';

const POLL_INTERVAL = 60000;

const isMobileDevice = () => /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');

const copyToClipboard = async (text) => {
  if (!text) return;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard');
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      alert('Copied to clipboard');
    }
  } catch (err) {
    console.warn('Copy failed', err);
    alert('Copy failed — please copy manually');
  }
};

const buildUpiUri = (upiId, payeeName, amount, note) => {
  if (!upiId) return null;
  const pa = encodeURIComponent(upiId);
  const pn = encodeURIComponent(payeeName || '');
  const am = encodeURIComponent(String(amount || ''));
  const tn = encodeURIComponent(note || '');
  return `upi://pay?pa=${pa}&pn=${pn}${amount ? `&am=${am}` : ''}&cu=INR${note ? `&tn=${tn}` : ''}`;
};

const buildQrImageUrl = (data, size = 250) => {
  if (!data) return null;
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
};

const PaymentRedirect = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [upiFallbackVisible, setUpiFallbackVisible] = useState(false);
  const [upiData, setUpiData] = useState(null);

  const loadPayment = useCallback(async () => {
    if (!id) {
      setError('Payment ID missing');
      setLoading(false);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await getPayment(id);
      const p = res?.payment || res;
      setPayment(p || null);

      const upiFromServer = res?.upi || p?.upi || null;
      const upiId = upiFromServer?.upiId || process.env.REACT_APP_DEFAULT_UPI_ID || 'egschitsambur@okaxis';
      const payeeName = upiFromServer?.payeeName || process.env.REACT_APP_DEFAULT_PAYEE_NAME || 'ChitAdmin';
      const amount = p?.amount || '';
      const note = `Chit:${(p?.chitId?.name || p?.chitName || '')}#pid:${p?._id}`;
      const upiUri = buildUpiUri(upiId, payeeName, amount, note);
      const qrUrl = buildQrImageUrl(upiUri, 300);

      setUpiData({ upiId, payeeName, amount, note, upiUri, qrUrl });
    } catch (err) {
      console.error('getPayment error', err);
      setError(err?.response?.data?.message || 'Failed to load payment');
      setPayment(null);
      setUpiData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPayment();
    const t = setInterval(() => {
      loadPayment().catch(() => {});
    }, POLL_INTERVAL);
    return () => clearInterval(t);
  }, [loadPayment]);

  const handleRequestVerification = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await requestVerification(id);
      await loadPayment();
      alert('Verification requested. Admin will review your payment shortly.');
    } catch (err) {
      console.error('request verification error', err);
      alert(err?.response?.data?.message || 'Failed to request verification');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && upiData && !isMobileDevice()) {
      setUpiFallbackVisible(true);
    }
  }, [loading, upiData]);

  if (loading)
    return (
      <div className="payment-redirect page-container">
        <div className="card">Loading payment information…</div>
      </div>
    );

  if (error)
    return (
      <div className="payment-redirect page-container">
        <div className="card error-card">
          <h3>Error</h3>
          <p>{error}</p>
          <div style={{ marginTop: 12 }}>
            <button className="btn" onClick={() => navigate(-1)}>Back</button>
          </div>
        </div>
      </div>
    );

  if (!payment)
    return (
      <div className="payment-redirect page-container">
        <div className="card">
          <h3>Payment not found</h3>
          <p>The payment record could not be found. It might have been removed.</p>
          <div style={{ marginTop: 12 }}>
            <button className="btn" onClick={() => navigate('/my-chits')}>Back to Payments</button>
          </div>
        </div>
      </div>
    );

  const status = (payment.status || 'pending').toLowerCase();
  const createdAt = payment.createdAt ? new Date(payment.createdAt).toLocaleString() : '-';
  const paidAt = payment.paidAt ? new Date(payment.paidAt).toLocaleString() : null;
  const chitName = payment.chitId?.name || payment.chitName || '-';

  return (
    <div className="redirect">
      <div className="payment-redirect page-container">
        <div className="card payment-card-main">
          <header className="card-header">
            <h2>Payment Details</h2>
            <div className="header-actions">
              <button className="btn ghost" onClick={() => navigate('/my-chits')}>
                Back to Payments
              </button>
            </div>
          </header>

          <div className="card-body">
            <div className="row"><div className="label">Payment ID</div><div className="value">{payment._id}</div></div>
            <div className="row"><div className="label">Chit Scheme</div><div className="value">{chitName}</div></div>
            <div className="row"><div className="label">Amount</div><div className="value">₹{payment.amount}</div></div>
            <div className="row"><div className="label">Created</div><div className="value">{createdAt}</div></div>
            {paidAt && <div className="row"><div className="label">Paid At</div><div className="value">{paidAt}</div></div>}
            <div className="row">
              <div className="label">Status</div>
              <div className="value">
                {status === 'pending' && <span className="status-badge status-pending">Pending</span>}
                {status === 'verification_requested' && <span className="status-badge status-info">Verification Pending</span>}
                {(status === 'paid' || status === 'completed') && <span className="status-badge status-success">Paid</span>}
                {status === 'rejected' && <span className="status-badge status-rejected">Rejected</span>}
              </div>
            </div>

            {payment.rejectionReason && status === 'rejected' && (
              <div className="row"><div className="label">Rejection Reason</div><div className="value">{payment.rejectionReason}</div></div>
            )}

            <div className="spacer" />

            <div className="actions">
              {status === 'pending' && (
                <>
                  <p className="muted">
                    After completing the UPI payment, click the button below to request verification from admin.
                  </p>
                  <div className="btn-group">
                    <button className="btn" onClick={handleRequestVerification} disabled={actionLoading}>
                      {actionLoading ? 'Requesting verification…' : 'I have paid — Request Verification'}
                    </button>
                    <button className="btn ghost" onClick={() => setUpiFallbackVisible(v => !v)}>
                      Need help paying?
                    </button>
                  </div>
                </>
              )}

              {status === 'verification_requested' && (
                <>
                  <button className="btn" disabled>Verification Pending…</button>
                  <p className="muted" style={{ marginTop: 8 }}>Admin will review your payment shortly.</p>
                </>
              )}

              {(status === 'paid' || status === 'completed') && (
                <div className="success-block">
                  <strong>Payment approved ✅</strong>
                  <div style={{ marginTop: 8 }}>
                    <button className="btn" onClick={() => navigate('/payments')}>Back to Payments</button>
                  </div>
                </div>
              )}

              {status === 'rejected' && (
                <div className="error-block">
                  <strong>Payment rejected ✖</strong>
                  <div style={{ marginTop: 8 }}>
                    <button className="btn" onClick={() => navigate('/payments')}>Retry Payment</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ✅ Integrated Manual UPI Section (Responsive) */}
        {upiFallbackVisible && upiData && (
          <div className="manual-payment-card">
            <h3>Pay Manually / Using UPI ID</h3>
            <p className="muted">
              It looks like your device might not have a UPI app installed or your browser couldn't open it.
              Use one of the following manual options to complete the payment.
            </p>

            <div className="manual-grid">
              <div className="field">
                <label>UPI ID</label>
                <div className="input-row">
                  <input readOnly value={upiData.upiId} />
                  <button className="btn" onClick={() => copyToClipboard(upiData.upiId)}>Copy</button>
                </div>
              </div>

              <div className="field">
                <label>Amount</label>
                <div className="input-row">
                  <input readOnly value={upiData.amount} />
                  <button className="btn" onClick={() => copyToClipboard(String(upiData.amount))}>Copy</button>
                </div>
              </div>

              <div className="field">
                <label>Payment Note (important)</label>
                <div className="input-row">
                  <input readOnly value={upiData.note} />
                  <button className="btn" onClick={() => copyToClipboard(upiData.note)}>Copy</button>
                </div>
                <small className="muted">
                  Include this exact note so admin can match your payment (it contains the payment ID).
                </small>
              </div>

              <div className="field">
                <label>UPI URI</label>
                <div className="input-row">
                  <input readOnly value={upiData.upiUri || ''} />
                  <button className="btn" onClick={() => copyToClipboard(upiData.upiUri)}>Copy</button>
                </div>
              </div>

              {upiData.upiUri && (
                <div className="qr-section">
                  <div className="qr-image">
                    <label>Scan QR to pay</label>
                    <img src={upiData.qrUrl} alt="UPI QR" />
                  </div>
                  <p className="muted qr-instructions">
                    Open your UPI app on your phone and scan the QR above, or copy the UPI ID and paste it into the app.
                    After paying, return to this page and click <b>"I have paid — Request Verification"</b>.
                  </p>
                </div>
              )}
            </div>

            <div className="manual-footer">
              <button className="btn ghost" onClick={() => setUpiFallbackVisible(false)}>
                Close
              </button>

              {isMobileDevice() ? (
                <button
                  className="btn"
                  onClick={() => {
                    if (upiData?.upiUri) {
                      window.location.href = upiData.upiUri;
                    } else {
                      alert('UPI link not available.');
                    }
                  }}
                >
                  Pay through GPay / PhonePe / Paytm
                </button>
              ) : (
                <a
                  className="btn"
                  href="https://play.google.com/store/search?q=upi%20app"
                  target="_blank"
                  rel="noreferrer"
                >
                  Install UPI App
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentRedirect;
