// src/components/UserDocumentProofs.js
import React, { useEffect, useState } from 'react';
import { getMyDocuments, submitMyDocuments } from '../services/documentService';
import api from '../services/api';
import './UserDocumentProofs.css';

const UserDocumentProofs = () => {
  const [docs, setDocs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    aadharNumber: '',
    panNumber: '',
    additionalProofText: ''
  });
  const [files, setFiles] = useState({
    aadharDoc: null,
    panDoc: null,
    additionalProofFile: null
  });

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMyDocuments();
      // backend returns { documents: { ... } } or maybe just the document object
      const d = res?.documents || res || {};
      setDocs(d);
      setForm({
        aadharNumber: d?.aadharNumber || '',
        panNumber: d?.panNumber || '',
        additionalProofText: d?.additionalProofText || ''
      });
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (key, ev) => {
    const f = ev.target.files && ev.target.files[0] ? ev.target.files[0] : null;
    setFiles((p) => ({ ...p, [key]: f }));
  };

  const handleInputChange = (key, ev) => {
    setForm((p) => ({ ...p, [key]: ev.target.value }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();

    // Prevent edits if user already uploaded and uploadedByUser is true
    if (docs && docs.uploadedByUser) {
      alert('You cannot edit documents after submission. Contact admin for changes.');
      return;
    }

    if (!form.aadharNumber || !form.panNumber) {
      alert('Please enter Aadhar and PAN numbers.');
      return;
    }

    const fd = new FormData();
    // text fields
    fd.append('aadharNumber', form.aadharNumber);
    fd.append('panNumber', form.panNumber);
    fd.append('additionalProofText', form.additionalProofText || '');

    // files using exact names backend expects
    if (files.aadharDoc) fd.append('aadharDoc', files.aadharDoc);
    if (files.panDoc) fd.append('panDoc', files.panDoc);
    if (files.additionalProofFile) fd.append('additionalProofFile', files.additionalProofFile);

    try {
      setSubmitting(true);
      const res = await submitMyDocuments(fd);
      // expect backend to return { documents: { ... } } or the documents object
      const received = res?.documents || res || {};
      setDocs(received);
      setForm({
        aadharNumber: received?.aadharNumber || '',
        panNumber: received?.panNumber || '',
        additionalProofText: received?.additionalProofText || ''
      });
      // clear file inputs
      setFiles({ aadharDoc: null, panDoc: null, additionalProofFile: null });
      alert('Documents uploaded successfully and sent for verification.');
    } catch (err) {
      console.error('Submit docs failed', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit documents';
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // build absolute url from backend's response. Accept either string path or object { path, url }
  const buildFileUrl = (fileField) => {
    if (!fileField) return null;
    // If backend provided a full URL
    if (typeof fileField === 'string') {
      if (fileField.startsWith('http')) return fileField;
      // else assume it's a path beginning with /uploads...
      const base = process.env.REACT_APP_API_URL
        ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '')
        : (api?.defaults?.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, '') : window.location.origin);
      return `${base}${fileField}`;
    }
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

  if (loading) return <div className="doc-panel">Loading Document Proofs...</div>;

  const readOnly = !!docs?.uploadedByUser;

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

  return (
    <div className="doc-panel">
      <h3>Document Proofs</h3>
      <form onSubmit={handleSubmit} className="doc-form" encType="multipart/form-data">
        <div className="doc-row">
          <label>Aadhar Number</label>
          <input
            type="text"
            value={form.aadharNumber}
            onChange={(e) => handleInputChange('aadharNumber', e)}
            disabled={readOnly}
            placeholder="Enter Aadhar number"
          />
        </div>

        <div className="doc-row">
          <label>PAN Number</label>
          <input
            type="text"
            value={form.panNumber}
            onChange={(e) => handleInputChange('panNumber', e)}
            disabled={readOnly}
            placeholder="Enter PAN number"
          />
        </div>

        <div className="doc-row">
          <label>Aadhar Document (PDF / image)</label>
          { (docs?.aadharDoc || docs?.aadharFile) ? (
            <div className="doc-links">
              <a href={buildFileUrl(docs?.aadharDoc || docs?.aadharFile)} target="_blank" rel="noreferrer">
                {fileLabel(docs?.aadharDoc || docs?.aadharFile)}
              </a>
            </div>
          ) : readOnly ? (
            <div className="doc-status">Not provided</div>
          ) : (
            <input type="file" accept=".pdf,image/*" onChange={(e) => handleFileChange('aadharDoc', e)} />
          )}
        </div>

        <div className="doc-row">
          <label>PAN Document (PDF / image)</label>
          { (docs?.panDoc || docs?.panFile) ? (
            <div className="doc-links">
              <a href={buildFileUrl(docs?.panDoc || docs?.panFile)} target="_blank" rel="noreferrer">
                {fileLabel(docs?.panDoc || docs?.panFile)}
              </a>
            </div>
          ) : readOnly ? (
            <div className="doc-status">Not provided</div>
          ) : (
            <input type="file" accept=".pdf,image/*" onChange={(e) => handleFileChange('panDoc', e)} />
          )}
        </div>

        <div className="doc-row">
          <label>Additional Proof (optional)</label>
          <input
            type="text"
            value={form.additionalProofText}
            onChange={(e) => handleInputChange('additionalProofText', e)}
            placeholder="E.g., Voter ID / Passport"
            disabled={readOnly}
          />
          { (docs?.additionalProofFile || docs?.additionalProof) ? (
            <div className="doc-links">
              <a href={buildFileUrl(docs?.additionalProofFile || docs?.additionalProof)} target="_blank" rel="noreferrer">
                {fileLabel(docs?.additionalProofFile || docs?.additionalProof)}
              </a>
            </div>
          ) : (!readOnly && (
            <input type="file" accept=".pdf,image/*" onChange={(e) => handleFileChange('additionalProofFile', e)} />
          ))}
        </div>

        <div className="doc-status-row" status={docs?.verificationStatus?.toUpperCase() || 'PENDING'}>
          <div>
            Verification Status:{' '}
            <strong verificationstatus={docs?.verificationStatus?.toUpperCase() || 'PENDING'}>
              {(docs?.verificationStatus || 'pending').toUpperCase()}
            </strong>
          </div>
        </div>

        {!readOnly && (
          <div className="doc-actions">
            <button type="submit" className="btn" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Documents'}</button>
          </div>
        )}

        {readOnly && <div className="doc-readonly-note">You cannot edit documents after submission. Contact admin to update.</div>}
      </form>
    </div>
  );
};

export default UserDocumentProofs;
