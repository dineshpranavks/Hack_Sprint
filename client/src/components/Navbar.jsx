import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfilePanel from './ProfilePanel';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const navigate   = useNavigate();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const getInitials = (nameOrEmail) => {
    if (!nameOrEmail) return 'U';
    const parts = nameOrEmail.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return nameOrEmail[0].toUpperCase();
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const initial = getInitials(displayName);

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

        {/* AUTH ACTIONS / PROFILE BUTTON */}
        {user ? (
          <button
            id="profile-btn"
            className={`profile-icon-btn ${open ? 'profile-icon-btn--active' : ''}`}
            onClick={() => setOpen(o => !o)}
            aria-label="Open profile"
            title={`${displayName} - Profile & History`}
          >
            {user.photoURL ? (
              <img src={user.photoURL} alt={displayName} className="profile-avatar-small" style={{ objectFit: 'cover' }} />
            ) : (
              <div className="profile-avatar-small">{initial}</div>
            )}
          </button>
        ) : (
          <div className="navbar-auth-actions">
            <button
              className="nav-btn-login"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button
              className="nav-btn-signup"
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </button>
          </div>
        )}
      </nav>

      {user && <ProfilePanel isOpen={open} onClose={() => setOpen(false)} />}
    </>
  );
}

