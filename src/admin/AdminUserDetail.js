// src/pages/AdminUserDetail.js
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminGetUserProfile } from '../services/user';
import {
  adminGetUserDocuments,
  adminUpdateUserDocuments,
  adminSetVerificationStatus
} from '../services/documentService';
import { getUserChitsAdmin, getUserPaymentsAdmin } from '../services/adminUserService';
import api from '../services/api';
import './AdminUserDetail.css';

/* buildAbsolute and FileActions omitted here for brevity in this header comment.
   The full definitions remain the same as in your original file (unchanged).
   See the FileActions + buildAbsolute functions in your current file above. */

const buildAbsolute = (pathOrObj) => {
  try {
    if (!pathOrObj) return null;
    if (typeof pathOrObj === 'object' && pathOrObj.documents) {
      const docKeys = ['aadharDoc','aadharFile','aadhar','panDoc','panFile','additionalProofFile'];
      for (const k of docKeys) {
        if (pathOrObj.documents[k]) return buildAbsolute(pathOrObj.documents[k]);
      }
    }
    if (typeof pathOrObj === 'object') {
      if (pathOrObj.url && typeof pathOrObj.url === 'string' && pathOrObj.url.trim()) return pathOrObj.url;
      const p = (pathOrObj.path || pathOrObj.pathname || pathOrObj.file || pathOrObj.filename || null);
      if (p && typeof p === 'string' && p.trim()) {
        if (p.startsWith('http')) return p;
        const base = process.env.REACT_APP_API_URL
          ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '')
          : (api?.defaults?.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, '') : window.location.origin);
        const finalPath = p.startsWith('/') ? p : `/${p}`;
        return `${base}${finalPath}`;
      }
      return null;
    }
    if (typeof pathOrObj === 'string') {
      const s = pathOrObj.trim();
      if (!s) return null;
      if (s.startsWith('http')) return s;
      const base = process.env.REACT_APP_API_URL
        ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '')
        : (api?.defaults?.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, '') : window.location.origin);
      const finalPath = s.startsWith('/') ? s : `/${s}`;
      return `${base}${finalPath}`;
    }
    return null;
  } catch (err) {
    console.error('buildAbsolute error', err, pathOrObj);
    return null;
  }
};

const FileActions = ({ fileRef, label = 'View file' }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);

  const original = (fileRef && typeof fileRef === 'object') ? fileRef : null;
  const url = buildAbsolute(fileRef);

  const detectType = (u, fileObj) => {
    if (!u && fileObj && fileObj.mimetype) {
      if (fileObj.mimetype.startsWith('image/')) return 'image';
      if (fileObj.mimetype === 'application/pdf') return 'pdf';
    }
    if (!u) return null;
    const low = u.toLowerCase();
    if (low.endsWith('.png') || low.endsWith('.jpg') || low.endsWith('.jpeg') || low.endsWith('.webp') || low.endsWith('.gif')) return 'image';
    if (low.endsWith('.pdf')) return 'pdf';
    return null;
  };

  const handlePreview = (ev) => {
    ev?.preventDefault();
    if (!url) {
      console.warn('No URL for preview, fileRef:', fileRef);
      return alert('File not available for preview');
    }
    setPreviewType(detectType(url, original));
    setPreviewUrl(url);
    setPreviewOpen(true);
  };

  const handleDownload = (ev) => {
    ev?.preventDefault();
    if (!url) {
      console.warn('No URL for download, fileRef:', fileRef);
      return alert('File not available for download');
    }
    const a = document.createElement('a');
    a.href = url;
    if (original && original.filename) a.download = original.filename;
    else {
      try {
        const parts = url.split('/');
        a.download = parts[parts.length - 1] || 'file';
      } catch { a.download = 'file'; }
    }
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleCopy = async (ev) => {
    ev?.preventDefault();
    if (!url) return alert('No URL to copy');
    try {
      await navigator.clipboard.writeText(url);
      alert('File URL copied to clipboard');
    } catch {
      window.prompt('Copy the URL:', url);
    }
  };

  return (
    <>
      <div className="file-actions">
        {url ? (
          <>
            <a className="doc-link" href={url} target="_blank" rel="noreferrer">{label}</a>
            <button type="button" className="btn small" onClick={handlePreview}>Preview</button>
            <button type="button" className="btn small" onClick={handleDownload}>Download</button>
            <button type="button" className="btn small ghost" onClick={handleCopy}>Copy URL</button>
          </>
        ) : (
          <div className="muted">Not provided</div>
        )}
      </div>

      {previewOpen && previewUrl && (
        <div className="preview-modal" onClick={() => setPreviewOpen(false)}>
          <div className="preview-inner" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <strong>Preview</strong>
              <div>
                <button className="btn ghost" onClick={() => setPreviewOpen(false)}>Close</button>
                <a className="btn" href={previewUrl} target="_blank" rel="noreferrer" style={{ marginLeft: 8 }}>Open in new tab</a>
              </div>
            </div>

            <div style={{ width: '100%', textAlign: 'center' }}>
              {previewType === 'image' ? (
                <img src={previewUrl} alt="preview" style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8 }} />
              ) : previewType === 'pdf' ? (
                <iframe title="pdf-preview" src={previewUrl} style={{ width: '100%', height: '70vh', border: 'none' }} />
              ) : (
                <div style={{ padding: 24 }}>
                  <p>Preview not available for this file type.</p>
                  <a className="btn" href={previewUrl} target="_blank" rel="noreferrer">Open / Download</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [docs, setDocs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);
  const [form, setForm] = useState({
    aadharNumber: '',
    panNumber: '',
    additionalProofText: ''
  });
  const [files, setFiles] = useState({ aadharFile: null, panFile: null, additionalProofFile: null });

  const [userChits, setUserChits] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reportLoading, setReportLoading] = useState(true);
  const [reportError, setReportError] = useState('');

  const [globalSearch, setGlobalSearch] = useState('');

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const profileRes = await adminGetUserProfile(id);
        const profile = profileRes?.user || profileRes || null;
        setUser(profile);

        const docsRes = await adminGetUserDocuments(id);
        const receivedDocs = docsRes?.documents || {};
        setDocs(receivedDocs);

        setForm({
          aadharNumber: receivedDocs?.aadharNumber || '',
          panNumber: receivedDocs?.panNumber || '',
          additionalProofText: receivedDocs?.additionalProofText || ''
        });
      } catch (err) {
        console.error('Failed to load user detail', err);
        alert('Failed to load user data');
      } finally {
        setLoading(false);
      }

      loadUserReport();
    };

    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadUserReport = async () => {
    setReportLoading(true);
    setReportError('');
    try {
      const chitsResp = await getUserChitsAdmin(id);
      const paymentsResp = await getUserPaymentsAdmin(id);

      const chits = chitsResp?.chits || [];
      const pays = paymentsResp?.payments || [];

      const normalizedChits = (chits || []).map((c) => ({
        _id: c._id,
        name: c.name || c.title,
        amount: c.amount || c.totalAmount || 0,
        durationInMonths: c.durationInMonths || c.duration || 0,
        joinedAt: c.joinedAt || null,
        totalMembers: c.totalMembers || null
      }));

      const normalizedPayments = (pays || []).map((p) => ({
        _id: p._id,
        amount: p.amount || p.paymentAmount || 0,
        status: (p.status || p.paymentStatus || 'pending').toLowerCase(),
        createdAt: p.createdAt,
        chitId: p.chitId || p.chit || null,
        chitName: p.chitName || (p.chit && p.chit.name) || null
      }));

      setUserChits(normalizedChits);
      setPayments(normalizedPayments);
    } catch (err) {
      console.error('Failed to load report data', err);
      setReportError('Failed to load user report');
      setUserChits([]);
      setPayments([]);
    } finally {
      setReportLoading(false);
    }
  };

  const handleFileChange = (key, e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setFiles((p) => ({ ...p, [key]: file }));
  };

  const handleInput = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('aadharNumber', form.aadharNumber || '');
      fd.append('panNumber', form.panNumber || '');
      fd.append('additionalProofText', form.additionalProofText || '');
      if (files.aadharFile) fd.append('aadharDoc', files.aadharFile);
      if (files.panFile) fd.append('panDoc', files.panFile);
      if (files.additionalProofFile) fd.append('additionalProofFile', files.additionalProofFile);

      const res = await adminUpdateUserDocuments(id, fd);
      const updated = res?.documents || {};
      setDocs(updated);
      setForm({
        aadharNumber: updated?.aadharNumber || '',
        panNumber: updated?.panNumber || '',
        additionalProofText: updated?.additionalProofText || ''
      });
      setFiles({ aadharFile: null, panFile: null, additionalProofFile: null });
      alert('User documents updated.');
      loadUserReport();
    } catch (err) {
      console.error('Save error', err);
      alert(err?.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeStatus = async (newStatus) => {
    if (!window.confirm(`Change verification status to "${newStatus.toUpperCase()}"?`)) return;
    try {
      setStatusChanging(true);
      const res = await adminSetVerificationStatus(id, newStatus);
      const updatedStatus = res?.verificationStatus || newStatus;
      setDocs((p) => ({ ...(p || {}), verificationStatus: updatedStatus }));
      alert(`Status updated to ${updatedStatus.toUpperCase()}`);
      loadUserReport();
    } catch (err) {
      console.error('Status change error', err);
      alert(err?.response?.data?.message || 'Failed to change status');
    } finally {
      setStatusChanging(false);
    }
  };

  const totalSchemesCount = userChits.length;
  const totalPaymentsCount = payments.length;
  const totalPaymentsAmount = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);

  const normalizedQuery = (globalSearch || '').trim().toLowerCase();
  const filteredChits = useMemo(() => {
    if (!normalizedQuery) return userChits;
    return userChits.filter((c) => {
      if (!c) return false;
      const name = String(c.name || '').toLowerCase();
      const amt = String(c.amount || '').toLowerCase();
      const duration = String(c.durationInMonths || '').toLowerCase();
      const joined = c.joinedAt ? new Date(c.joinedAt).toLocaleDateString() : '';
      return name.includes(normalizedQuery)
        || amt.includes(normalizedQuery)
        || duration.includes(normalizedQuery)
        || joined.toLowerCase().includes(normalizedQuery);
    });
  }, [userChits, normalizedQuery]);

  const filteredPayments = useMemo(() => {
    if (!normalizedQuery) return payments;
    return payments.filter((p) => {
      if (!p) return false;
      const chitName = String(p.chitName || '').toLowerCase();
      const amt = String(p.amount || '').toLowerCase();
      const date = p.createdAt ? new Date(p.createdAt).toLocaleString() : '';
      return chitName.includes(normalizedQuery)
        || amt.includes(normalizedQuery)
        || date.toLowerCase().includes(normalizedQuery)
        || (p.chitId && String(p.chitId).toLowerCase().includes(normalizedQuery));
    });
  }, [payments, normalizedQuery]);

  if (loading) return <div className="admin-user-detail">Loading...</div>;

  return (
    <div className="admin-user-detail">
      <header className="aud-header">
        <div className="aud-title">
          <div>
            <h2>{user?.name || 'User Detail'}</h2>
            <div className="aud-sub">User ID: {user?._id}</div>
          </div>
        </div>
        <div className="aud-actions">
          <Link to="/admin/manage-users" className="btn ghost" >User List</Link>
        </div>
      </header>

      <div className="aud-grid">
        <section className="card user-info">
          <h3>Profile</h3>
          <div className="row"><span className="label">Name</span><span>{user?.name || '-'}</span></div>
          <div className="row"><span className="label">Email</span><span>{user?.email || '-'}</span></div>
          <div className="row"><span className="label">Phone</span><span>{user?.phone || '-'}</span></div>
          <div className="row"><span className="label">Address</span><span>{user?.address || '-'}</span></div>
        </section>

        <section className="card docs-card">
          <h3>Document Proofs</h3>

          <div className="row">
            <span className="label">Aadhar Number</span>
            <div className="value">
              <input value={form.aadharNumber} onChange={(e) => handleInput('aadharNumber', e.target.value)} />
            </div>
          </div>

          <div className="row">
            <span className="label">Aadhar Document</span>
            <div className="value file-block">
              <FileActions fileRef={docs?.aadharDoc || docs?.aadharFile || docs?.aadharFileUrl || null} label="Aadhar Document" />
              <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange('aadharFile', e)} />
            </div>
          </div>

          <div className="row">
            <span className="label">PAN Number</span>
            <div className="value">
              <input value={form.panNumber} onChange={(e) => handleInput('panNumber', e.target.value)} />
            </div>
          </div>

          <div className="row">
            <span className="label">PAN Document</span>
            <div className="value file-block">
              <FileActions fileRef={docs?.panDoc || docs?.panFile || docs?.panFileUrl || null} label="PAN Document" />
              <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange('panFile', e)} />
            </div>
          </div>

          <div className="row">
            <span className="label">Additional Proof</span>
            <div className="value file-block">
              <input value={form.additionalProofText} onChange={(e) => handleInput('additionalProofText', e)} placeholder="Description" />
              <FileActions fileRef={docs?.additionalProofFile || docs?.additionalProofFileUrl || null} label="Additional Proof" />
              <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange('additionalProofFile', e)} />
            </div>
          </div>

          <div className="row">
            <span className="label">Verification Status</span>
            <div className="value status-row">
              <div className={`status-pill ${docs?.verificationStatus || 'pending'}`}>{(docs?.verificationStatus || 'pending').toUpperCase()}</div>
              <div className="status-actions">
                <button
                  className="btn approve"
                  onClick={() => handleChangeStatus('verified')}
                  disabled={statusChanging || docs?.verificationStatus === 'verified'}
                >
                  Approve
                </button>
                <button
                  className="btn reject"
                  onClick={() => handleChangeStatus('rejected')}
                  disabled={statusChanging || docs?.verificationStatus === 'rejected'}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>

          <div className="card-actions">
            <button className="btn" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </section>
      </div>

      <section className="card user-report">
        <h3>User Report</h3>

        <div className="global-search-row" style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="search"
            placeholder="Search joined schemes & payments (by scheme name, amount, date)..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd' }}
          />
          <button
            className="btn ghost"
            onClick={() => setGlobalSearch('')}
            title="Clear search"
          >
            Clear
          </button>
        </div>

        {reportLoading ? (
          <div style={{ padding: 12 }}>Loading report...</div>
        ) : reportError ? (
          <div style={{ padding: 12, color: 'crimson' }}>{reportError}</div>
        ) : (
          <>
            <div className="report-summary" style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
              <div className="summary-pill">
                <div className="summary-number">{totalSchemesCount}</div>
                <div className="summary-label">Schemes Joined</div>
              </div>

              <div className="summary-pill">
                <div className="summary-number">{totalPaymentsCount}</div>
                <div className="summary-label">Payments</div>
              </div>

              <div className="summary-pill">
                <div className="summary-number">₹{totalPaymentsAmount}</div>
                <div className="summary-label">Total Paid</div>
              </div>
            </div>

            <div className="report-section">
              <h4 style={{ marginTop: 0 }}>Joined Schemes</h4>
              {filteredChits.length === 0 ? (
                <div className="muted">No schemes match your search.</div>
              ) : (
                <table className="small-table">
                  <thead>
                    <tr>
                      <th>Scheme</th>
                      <th>Amount</th>
                      <th>Duration</th>
                      <th>Joined At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredChits.map((c) => (
                      <tr key={c._id}>
                        {/* Link to chit details and pass the user id as memberId in query */}
                        <td>
                          <Link to={`/admin/chits/${c._id}?memberId=${id}`} className="link">
                            {c.name}
                          </Link>
                        </td>
                        <td>₹{c.amount}</td>
                        <td>{c.durationInMonths} months</td>
                        <td>{c.joinedAt ? new Date(c.joinedAt).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="report-section" style={{ marginTop: 12 }}>
              <h4>Recent Payments</h4>
              {filteredPayments.length === 0 ? (
                <div className="muted">No payments match your search.</div>
              ) : (
                <table className="small-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Chit</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.slice(0, 50).map((p) => (
                      <tr key={p._id}>
                        <td>{p.createdAt ? new Date(p.createdAt).toLocaleString() : '-'}</td>
                        <td>
                          {p.chitId ? (
                            <Link to={`/admin/chits/${p.chitId}?memberId=${id}`} className="link">
                              {p.chitName || String(p.chitId)}
                            </Link>
                          ) : (
                            p.chitName || '-'
                          )}
                        </td>
                        <td>₹{p.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <center>
              <button className="back-btn" onClick={() => navigate('/admin/manage-users')}>← Back</button>
            </center>
          </>
        )}
      </section>
    </div>
  );
};

export default AdminUserDetail;
