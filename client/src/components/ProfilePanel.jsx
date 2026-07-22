import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CHAT_HISTORY } from '../data/problems';

export default function ProfilePanel({ isOpen, onClose }) {
  const navigate   = useNavigate();
  const location   = useLocation();
  const panelRef   = useRef(null);

  /* close on outside click */
  useEffect(() => {
    if (!isOpen) return;
    const fn = (e) => {
      // ignore clicks on the profile button itself
      if (document.getElementById('profile-btn')?.contains(e.target)) return;
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [isOpen, onClose]);

  /* close on Escape */
  useEffect(() => {
    const fn = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  const go = (path) => { navigate(path); onClose(); };

  const grouped = {
    Today:     CHAT_HISTORY.filter(c => c.time.includes('h ago')),
    Yesterday: CHAT_HISTORY.filter(c => c.time === 'Yesterday'),
    Earlier:   CHAT_HISTORY.filter(c => c.time.includes('days ago')),
  };

  const isActive = (query) =>
    location.search.includes(encodeURIComponent(query));

  return (
    <>
      {/* BACKDROP */}
      <div
        className={`pp-backdrop ${isOpen ? 'pp-backdrop--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* PANEL */}
      <aside ref={panelRef} className={`profile-panel ${isOpen ? 'profile-panel--open' : ''}`} aria-label="Profile panel">

        {/* ── USER HEADER ── */}
        <div className="pp-header">
          <div className="pp-avatar-wrap">
            <div className="pp-avatar">A</div>
            <span className="pp-online-dot" />
          </div>
          <div className="pp-user-info">
            <div className="pp-user-name">Arjun</div>
            <div className="pp-user-email">arjun@hacksprint.ai</div>
          </div>
        </div>

        {/* ── VIEW PROFILE BUTTON ── */}
        <button className="pp-profile-btn" onClick={() => go('/profile')}>
          <span className="pp-btn-icon">👤</span>
          <span>View Profile</span>
          <span className="pp-btn-arrow">→</span>
        </button>

        <div className="pp-divider" />

        {/* ── CHAT HISTORY ── */}
        <div className="pp-section-label">
          <span>💬</span> Chat History
        </div>

        <div className="pp-chat-list">
          {Object.entries(grouped).map(([label, chats]) =>
            chats.length > 0 ? (
              <div key={label}>
                <div className="pp-group-label">{label}</div>
                {chats.map(chat => (
                  <button
                    key={chat.id}
                    className={`pp-chat-item ${isActive(chat.query) ? 'pp-chat-item--active' : ''}`}
                    onClick={() => go(`/results?q=${encodeURIComponent(chat.query)}`)}
                  >
                    <span className="pp-chat-icon">📄</span>
                    <div className="pp-chat-body">
                      <div className="pp-chat-title">{chat.title}</div>
                      <div className="pp-chat-time">{chat.time}</div>
                    </div>
                    <span className="pp-chat-arrow">›</span>
                  </button>
                ))}
              </div>
            ) : null
          )}
        </div>

        {/* ── FOOTER ACTIONS ── */}
        <div className="pp-footer">
          <button className="pp-action-btn pp-action-settings" onClick={() => go('/profile')}>
            <span>⚙️</span> Settings
          </button>
          <button className="pp-action-btn pp-action-logout" onClick={() => { onClose(); navigate('/'); }}>
            <span>⎋</span> Logout
          </button>
        </div>

      </aside>
    </>
  );
}
