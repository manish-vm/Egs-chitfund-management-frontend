// src/pages/AdminUserDocuments.js
import React, { useEffect, useState } from 'react';
import {
  adminGetUserDocuments,
  adminUpdateUserDocuments,
  adminSetVerificationStatus
} from '../services/documentService';
import './AdminUserDocuments.css';
import { useParams } from 'react-router-dom';
import api from '../services/api';

/**
 * AdminUserDocuments
 * - Fetches user & document data for userId from route param
 * - Allows admin to view currently uploaded files (opens absolute URL)
 * - Allows admin to update text fields and re-upload files (same field names backend expects)
 */
const AdminUserDocuments = () => {
  const { id } = useParams(); // expects route /admin/users/:id/documents
  const [user, setUser] = useState(null);
  const [docs, setDocs] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    aadharNumber: '',
    panNumber: '',
    additionalProofText: '',
    verificationStatus: 'pending'
  });

  const [files, setFiles] = useState({
    aadharDoc: null,
    panDoc: null,
    additionalProofFile: null
  });

  const [saving, setSaving] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminGetUserDocuments(id);
      // backend may return { user, documents } or { documents: {...}, user: {...} }
      const receivedDocs = res?.documents || res?.data?.documents || res || {};
      const receivedUser = res?.user || res?.data?.user || res?.userData || null;

      setDocs(receivedDocs);
      setUser(receivedUser);

      setForm((prev) => ({
        ...prev,
        aadharNumber: receivedDocs?.aadharNumber || '',
        panNumber: receivedDocs?.panNumber || '',
        additionalProofText: receivedDocs?.additionalProofText || '',
        verificationStatus: receivedDocs?.verificationStatus || 'pending'
      }));
    } catch (err) {
      console.error('Load user docs failed', err);
      alert(err?.response?.data?.message || 'Failed to load user documents');
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = (key, e) => {
    const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setFiles((p) => ({ ...p, [key]: f }));
  };

  const handleChange = (k, e) => {
    const v = typeof e === 'string' ? e : e.target.value;
    setForm((p) => ({ ...p, [k]: v }));
  };

  // Build absolute URL from backend return value (string path or object)
  const buildFileUrl = (fileField) => {
    if (!fileField) return null;

    // if it's a string (path or url)
    if (typeof fileField === 'string') {
      if (fileField.startsWith('http')) return fileField;
      const base = process.env.REACT_APP_API_URL
        ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '')
        : (api?.defaults?.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, '') : window.location.origin);
      return `${base}${fileField}`;
    }

    // if it's an object { path, url, filename }
    if (typeof fileField === 'object') {
      if (fileField.url) return fileField.url;
      const p = fileField.path || fileField.filepath || fileField.filename;
      if (!p) return null;
      if (typeof p === 'string' && p.startsWith('http')) return p;
      const base2 = process.env.REACT_APP_API_URL
        ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '')
        : (api?.defaults?.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, '') : window.location.origin);
      return `${base2}${p}`;
    }

    return null;
  };

  const fileLabel = (fileField) => {
    if (!fileField) return 'View';
    if (typeof fileField === 'string') {
      const parts = fileField.split('/');
      return parts[parts.length - 1] || 'View';
    }
    if (typeof fileField === 'object') {
      return fileField.filename || fileField.originalname || (fileField.path ? fileField.path.split('/').pop() : 'View');
    }
    return 'View';
  };

  const handleSave = async () => {
    // assemble FormData using the exact field names your backend expects:
    // aadharDoc, panDoc, additionalProofFile
    const fd = new FormData();
    fd.append('aadharNumber', form.aadharNumber || '');
    fd.append('panNumber', form.panNumber || '');
    fd.append('additionalProofText', form.additionalProofText || '');
    // verificationStatus may be updated via separate endpoint as well
    if (form.verificationStatus) fd.append('verificationStatus', form.verificationStatus);

    if (files.aadharDoc) fd.append('aadharDoc', files.aadharDoc);
    if (files.panDoc) fd.append('panDoc', files.panDoc);
    if (files.additionalProofFile) fd.append('additionalProofFile', files.additionalProofFile);

    try {
      setSaving(true);
      const res = await adminUpdateUserDocuments(id, fd);
      const updatedDocs = res?.documents || res || {};
      setDocs(updatedDocs);
      // refresh form fields in case backend normalized values
      setForm((p) => ({
        ...p,
        aadharNumber: updatedDocs?.aadharNumber || p.aadharNumber,
        panNumber: updatedDocs?.panNumber || p.panNumber,
        additionalProofText: updatedDocs?.additionalProofText || p.additionalProofText,
        verificationStatus: updatedDocs?.verificationStatus || p.verificationStatus
      }));
      // clear local file inputs
      setFiles({ aadharDoc: null, panDoc: null, additionalProofFile: null });
      alert('Documents saved/updated successfully.');
    } catch (err) {
      console.error('Save error', err);
  // show server response body if available
  if (err?.response) {
    console.error('Server response data:', err.response.data);
    alert(err.response.data?.message || JSON.stringify(err.response.data) || 'Save failed (server error)');
  } else {
    alert(err?.message || 'Save failed (network error)');
  }
} finally {
  setSaving(false);
}
  };

  const changeVerificationStatus = async (newStatus) => {
    if (!window.confirm(`Change verification status to "${newStatus.toUpperCase()}"?`)) return;
    try {
      setStatusChanging(true);
      const res = await adminSetVerificationStatus(id, newStatus);
      const updatedStatus = res?.verificationStatus || newStatus;
      setForm((p) => ({ ...p, verificationStatus: updatedStatus }));
      setDocs((p) => ({ ...(p || {}), verificationStatus: updatedStatus }));
      alert(`Verification status updated to ${updatedStatus.toUpperCase()}`);
    } catch (err) {
      console.error('Status change failed', err);
      alert(err?.response?.data?.message || 'Failed to change verification status');
    } finally {
      setStatusChanging(false);
    }
  };

  if (loading) return <div>Loading user documents...</div>;

  return (
    <div className="admin-docs-panel">
      <h2>Documents for {user?.name || user?.email || 'User'}</h2>

      <div className="admin-docs-row">
        <label>Aadhar Number</label>
        <input value={form.aadharNumber} onChange={(e) => handleChange('aadharNumber', e)} />
      </div>

      <div className="admin-docs-row">
        <label>PAN Number</label>
        <input value={form.panNumber} onChange={(e) => handleChange('panNumber', e)} />
      </div>

      <div className="admin-docs-row">
        <label>Aadhar Document</label>
        { (docs?.aadharDoc || docs?.aadharFile) ? (
          <a href={buildFileUrl(docs?.aadharDoc || docs?.aadharFile)} target="_blank" rel="noreferrer">
            {fileLabel(docs?.aadharDoc || docs?.aadharFile)}
          </a>
        ) : <span>Not provided</span> }
        <input type="file" accept=".pdf,image/*" onChange={(e) => onFileChange('aadharDoc', e)} />
      </div>

      <div className="admin-docs-row">
        <label>PAN Document</label>
        { (docs?.panDoc || docs?.panFile) ? (
          <a href={buildFileUrl(docs?.panDoc || docs?.panFile)} target="_blank" rel="noreferrer">
            {fileLabel(docs?.panDoc || docs?.panFile)}
          </a>
        ) : <span>Not provided</span> }
        <input type="file" accept=".pdf,image/*" onChange={(e) => onFileChange('panDoc', e)} />
      </div>

      <div className="admin-docs-row">
        <label>Additional Proof Text</label>
        <input value={form.additionalProofText} onChange={(e) => handleChange('additionalProofText', e)} />
        { (docs?.additionalProofFile || docs?.additionalProof) && (
          <a href={buildFileUrl(docs?.additionalProofFile || docs?.additionalProof)} target="_blank" rel="noreferrer">
            {fileLabel(docs?.additionalProofFile || docs?.additionalProof)}
          </a>
        )}
        <input type="file" accept=".pdf,image/*" onChange={(e) => onFileChange('additionalProofFile', e)} />
      </div>

      <div className="admin-docs-row">
  <label>Aadhar Document</label>
  {docs?.aadharDoc || docs?.aadharFile ? (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <a
        href={`${process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '') : ''}/api/documents/user/${id}/download?field=aadharDoc`}
        target="_blank"
        rel="noreferrer"
        className="btn small"
      >
        Download
      </a>
      <span className="muted">{(docs.aadharDoc && docs.aadharDoc.filename) || (docs.aadharFile && docs.aadharFile.filename) || 'Aadhar file'}</span>
    </div>
  ) : (
    <span>Not provided</span>
  )}
  <input type="file" accept=".pdf,image/*" onChange={(e) => handleFile('aadharDoc', e)} />
</div>

      <div className="admin-docs-row">
        <label>Verification Status</label>
        <select value={form.verificationStatus} onChange={(e) => handleChange('verificationStatus', e)}>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
        <button className="btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>

        <button
          className="btn approve"
          onClick={() => changeVerificationStatus('verified')}
          disabled={statusChanging || form.verificationStatus === 'verified'}
          title="Approve documents"
        >
          Approve
        </button>

        <button
          className="btn reject"
          onClick={() => changeVerificationStatus('rejected')}
          disabled={statusChanging || form.verificationStatus === 'rejected'}
          title="Reject documents"
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default AdminUserDocuments;
