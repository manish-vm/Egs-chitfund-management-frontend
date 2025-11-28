// frontend/src/components/NotificationBell.js
import React, { useEffect, useRef, useState } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteAllNotifications
} from '../services/notification';
import './NotificationBell.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const POLL_INTERVAL_MS = 45000; // 45 seconds

const NotificationBell = ({ poll = true }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [actioningId, setActioningId] = useState(null);
  const timerRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    loadNotifications();

    if (poll) {
      timerRef.current = setInterval(() => {
        loadNotifications();
      }, POLL_INTERVAL_MS);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('click', handleClick);
    } else {
      document.removeEventListener('click', handleClick);
    }
    return () => document.removeEventListener('click', handleClick);
  }, [open]);

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetchNotifications({ limit: 50 });
      const items = (res && res.notifications) ? res.notifications : res;
      setNotifications(items);
      setUnreadCount(items.filter(n => !n.read).length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const onToggle = async () => {
    setOpen(v => !v);
    if (!open) {
      await loadNotifications();
    }
  };

  const handleClickNotification = async (notif) => {
    if (!notif.read) {
      try {
        await markNotificationRead(notif._id);
        setNotifications((prev) => prev.map(n => (n._id === notif._id ? { ...n, read: true } : n)));
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (err) {
        console.error('Failed to mark read', err);
      }
    }
    if (notif.link) {
      navigate(notif.link);
    }
    setOpen(false);
  };

  // New: delete single notification
  const handleDeleteNotification = async (notifId) => {
    if (!notifId) return;
    if (!window.confirm('Delete this notification?')) return;
    setActioningId(notifId);
    try {
      await deleteNotification(notifId);
      // remove locally
      setNotifications((prev) => prev.filter(n => n._id !== notifId));
      // update unread count (in case deleted was unread)
      setUnreadCount((prev) => {
        const wasUnread = notifications.find(n => n._id === notifId && !n.read);
        return wasUnread ? Math.max(0, prev - 1) : prev;
      });
    } catch (err) {
      console.error('Delete notification failed', err);
      alert(err?.response?.data?.message || 'Failed to delete notification');
    } finally {
      setActioningId(null);
    }
  };

  // New: delete all notifications
  const handleDeleteAll = async () => {
    const ok = window.confirm('Are you sure you want to delete ALL notifications? This action cannot be undone.');
    if (!ok) return;
    try {
      await deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      setOpen(false);
    } catch (err) {
      console.error('Delete all failed', err);
      alert(err?.response?.data?.message || 'Failed to delete all notifications');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark all read failed', err);
    }
  };

  return (
    <div className="notif-root" ref={dropdownRef}>
      <button className="notif-bell" onClick={onToggle} aria-label="Notifications">
        <Bell />
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <div className="notif-title">Notifications</div>
            <div className="notif-actions">
              <button className="small" onClick={handleMarkAllRead} title="Mark all read">Mark all read</button>
              <button className="small" onClick={handleDeleteAll} title="Delete all" style={{ color: '#ef4444', marginLeft: 10 }}>Delete all</button>
            </div>
          </div>

          {loading && <div className="notif-loading">Loading…</div>}

          {!loading && notifications.length === 0 && (
            <div className="notif-empty">You're all caught up — no notifications.</div>
          )}

          <div className="notif-list">
            {notifications.map((n) => (
              <div
                key={n._1}
                className={`notif-item ${n.read ? 'read' : 'unread'} ${n.message?.includes('New chit scheme added') ? 'notif-chit' : ''}`}
              >
                <div
                  className="notif-left"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleClickNotification(n)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleClickNotification(n); }}
                  style={{ flex: 1 }}
                >
                  <div className="notif-message">{n.message}</div>
                  <div className="notif-meta"><small>{new Date(n.createdAt).toLocaleString()}</small></div>
                </div>

                <div className="notif-right" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {!n.read ? <div className="dot" title="Unread" /> : <div className="check"><Check size={14} /></div>}
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteNotification(n._id)}
                    disabled={actioningId === n._id}
                    aria-label="Delete notification"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
