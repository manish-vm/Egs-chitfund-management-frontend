import React, { useEffect, useState } from 'react';
import { getAllChitSchemes } from '../services/chit';
import { createJoinRequest, getUserJoinRequests } from '../services/joinRequest';
import { useAuth } from '../context/AuthContext';
import { sendChitJoinEmail } from "../utils/email";
import {
  IndianRupee,
  UsersRound,
  Clock,
  CheckCircle,
  Plus,
  ShieldCheck,
  XCircle
} from 'lucide-react';
import './JoinChitScheme.css';

const JoinChitScheme = () => {
  const [schemes, setSchemes] = useState([]);
  const [requestStatuses, setRequestStatuses] = useState({}); // { [chitId]: 'pending'|'approved'|'rejected' }
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Helper: determines if user is a member (approved) of this scheme
  const isUserApprovedMember = (scheme) => {
    if (!scheme) return false;
    // joinedUsers could be array of ids or array of objects { user, isApproved }
    if (Array.isArray(scheme.joinedUsers)) {
      return scheme.joinedUsers.some((u) => {
        if (!u) return false;
        if (typeof u === 'object' && u.user) {
          return String(u.user) === String(user?._id) && u.isApproved;
        }
        return String(u) === String(user?._id);
      });
    }

    // fallback: check currentMembers if available
    if (Array.isArray(scheme.currentMembers)) {
      return scheme.currentMembers.some((m) => String(m) === String(user?._id));
    }

    return false;
  };

  // Helper: get count of joined users (works for different shapes)
  const getJoinedCount = (scheme) => {
    if (!scheme) return 0;
    if (Array.isArray(scheme.joinedUsers)) return scheme.joinedUsers.length;
    if (Array.isArray(scheme.currentMembers)) return scheme.currentMembers.length;
    return 0;
  };

  // Load schemes + user's join requests
  useEffect(() => {
    const fetch = async () => {
      if (!user?._id) return;
      setLoading(true);
      try {
        const data = await getAllChitSchemes();
        setSchemes(data || []);

        // load user's join requests to get statuses
        const reqs = await getUserJoinRequests();
        // build map { chitId: status }
        const map = {};
        if (Array.isArray(reqs)) {
          reqs.forEach((r) => {
            // r.chitId might be populated or just an id
            const cid = r.chitId && r.chitId._id ? r.chitId._id : r.chitId;
            map[String(cid)] = r.status;
          });
        }
        setRequestStatuses(map);
      } catch (err) {
        console.error('Error fetching schemes or requests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [user]);

  const handleJoin = async (schemeId) => {
    if (!user?._id) {
      alert('You must be logged in to join a scheme.');
      return;
    }

    try {
      // create join request (backend will prevent duplicates)
      const res = await createJoinRequest(schemeId);
      console.log('Join request response:', res);
      // Expect res.request or res.message - handle both
      const request = res?.request || res;
      // Update local status map
      setRequestStatuses((prev) => ({ ...prev, [String(schemeId)]: request?.status || 'pending' }));

      // optional: send an email (to admin or user) — your util may expect (user, scheme)
      const joinedScheme = schemes.find((s) => String(s._id) === String(schemeId));
      try {
        await sendChitJoinEmail(user, joinedScheme);
      } catch (emailErr) {
        console.warn('Failed to send join email:', emailErr);
      }
    } catch (err) {
      console.error('Join failed:', err?.response?.data || err.message || err);
      const msg = err?.response?.data?.message || err?.message || 'Server error';
      alert(`❌ Failed to send join request: ${msg}`);
    }
  };

  if (loading) {
    return <div className="loading">Loading chit schemes...</div>;
  }

  return (
    <div className="join-scheme-container">
      <header className="join-header">
        <h2>
          <ShieldCheck className="header-icon" /> Join a Chit Scheme
        </h2>
        <p>Explore savings plans and join a trusted community</p>
      </header>

      {schemes.length === 0 ? (
        <p className="no-schemes">No chit schemes available currently.</p>
      ) : (
        <div className="scheme-grid">
          {schemes.map((scheme) => {
            const alreadyJoined = isUserApprovedMember(scheme);
            const isFull = getJoinedCount(scheme) >= (scheme.totalMembers || 0);
            const requestStatus = requestStatuses[String(scheme._id)]; // pending|approved|rejected|undefined

            // If requestStatus is 'approved', consider user joined.
            const showAsJoined = alreadyJoined || requestStatus === 'approved';

            return (
              <div key={scheme._id} className="scheme-card">
                <div>
                  <h3 className="scheme-title">{scheme.name}</h3>

                  <div className="scheme-details">
                    <div className="detail-item">
                      <IndianRupee className="icon" />
                      <span>Amount:</span>
                      <strong>₹{scheme.amount}</strong>
                    </div>

                    <div className="detail-item">
                      <UsersRound className="icon" />
                      <span>Members:</span>
                      <strong>
                        {getJoinedCount(scheme)}/{scheme.totalMembers}
                      </strong>
                    </div>

                    <div className="detail-item">
                      <Clock className="icon" />
                      <span>Duration:</span>
                      <strong>{scheme.durationInMonths} months</strong>
                    </div>
                  </div>
                </div>

                <div className="button-wrapper">
                  {showAsJoined ? (
                    <button disabled className="joined-button">
                      <CheckCircle className="btn-icon" /> Joined
                    </button>
                  ) : requestStatus === 'pending' ? (
                    <button disabled className="pending-button">
                      <Clock className="btn-icon" /> Request Sent (Pending)
                    </button>
                  ) : requestStatus === 'rejected' ? (
                    <button disabled className="rejected-button">
                      <XCircle className="btn-icon" /> Request Rejected
                    </button>
                  ) : isFull ? (
                    <button disabled className="full-button">
                      <XCircle className="btn-icon" /> Full
                    </button>
                  ) : (
                    <button onClick={() => handleJoin(scheme._id)} className="join-button">
                      <Plus className="btn-icon" /> Join Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JoinChitScheme;
