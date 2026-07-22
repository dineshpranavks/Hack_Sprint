import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfilePanel from './ProfilePanel';

export default function Navbar() {
  const navigate   = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        {/* LOGO */}
        <div className="navbar-logo" onClick={() => navigate('/')} role="button" tabIndex={0}>
          <div className="logo-icon">⚡</div>
          Hack<span className="logo-accent">Sprint</span>
        </div>

        <div className="navbar-spacer" />

        {/* LIVE STATUS */}
        <div className="navbar-status">
          <span>AI Agent</span>
          <span className="status-dot" />
        </div>

        {/* PROFILE BUTTON */}
        <button
          id="profile-btn"
          className={`profile-icon-btn ${open ? 'profile-icon-btn--active' : ''}`}
          onClick={() => setOpen(o => !o)}
          aria-label="Open profile"
          title="Profile & History"
        >
          <div className="profile-avatar-small">A</div>
        </button>
      </nav>

      <ProfilePanel isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
