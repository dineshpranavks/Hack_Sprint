import Navbar from '../components/Navbar';

const PROFILE_ROWS = [
  { icon: '👤', label: 'Full Name',   value: 'Arjun' },
  { icon: '📧', label: 'Email',        value: 'arjun@hacksprint.ai' },
  { icon: '🎯', label: 'Goal',         value: 'SDE-1 at a FAANG company' },
  { icon: '📅', label: 'Member Since', value: 'July 2026' },
  { icon: '🏆', label: 'Rank',         value: 'Rising Coder' },
];

const STATS = [
  { val: '24', lbl: 'Problems Solved' },
  { val: '8',  lbl: 'Hard Problems' },
  { val: '6',  lbl: 'Searches Today' },
];

export default function ProfilePage() {
  return (
    <div className="page-root">
      <Navbar />

      <div className="profile-page-body fade-up">
        {/* ── AVATAR ── */}
        <div className="profile-avatar-lg">A</div>
        <div className="profile-name">Arjun</div>
        <div className="profile-email">arjun@hacksprint.ai</div>

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
          {PROFILE_ROWS.map(r => (
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
