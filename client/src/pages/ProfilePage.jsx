import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';

const STATS = [
  { val: '24', lbl: 'Problems Solved' },
  { val: '8',  lbl: 'Hard Problems' },
  { val: '6',  lbl: 'Searches Today' },
];

export default function ProfilePage() {
  const { user } = useAuth();

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || 'user@hacksprint.ai';

  const getInitials = (nameOrEmail) => {
    if (!nameOrEmail) return 'U';
    const parts = nameOrEmail.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return nameOrEmail[0].toUpperCase();
  };

  const initial = getInitials(displayName);

  const profileRows = [
    { icon: '👤', label: 'Full Name',   value: displayName },
    { icon: '📧', label: 'Email',        value: displayEmail },
    { icon: '🎯', label: 'Goal',         value: 'SDE-1 at a FAANG company' },
    { icon: '📅', label: 'Member Since', value: 'July 2026' },
    { icon: '🏆', label: 'Rank',         value: 'Rising Coder' },
  ];

  return (
    <div className="page-root">
      <Navbar />

      <div className="profile-page-body fade-up">
        {/* ── AVATAR ── */}
        {user?.photoURL ? (
          <img src={user.photoURL} alt={displayName} className="profile-avatar-lg" style={{ objectFit: 'cover', borderRadius: '50%' }} />
        ) : (
          <div className="profile-avatar-lg">{initial}</div>
        )}
        <div className="profile-name">{displayName}</div>
        <div className="profile-email">{displayEmail}</div>

        {/* ── STATS ── */}
        <div className="profile-stats fade-up-1">
          {STATS.map(s => (
            <div key={s.lbl} className="profile-stat-card">
              <div className="profile-stat-val">{s.val}</div>
              <div className="profile-stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* ── DETAILS ── */}
        <div className="profile-detail-card fade-up-2">
          {profileRows.map(r => (
            <div key={r.label} className="profile-detail-row">
              <span className="pdr-icon">{r.icon}</span>
              <div>
                <div className="pdr-label">{r.label}</div>
                <div className="pdr-value">{r.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

