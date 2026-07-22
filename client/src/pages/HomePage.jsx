import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const SUGGESTIONS = [
  { icon: '🧠', label: 'Dynamic Programming', query: 'dynamic programming' },
  { icon: '🏢', label: 'Google Questions',    query: 'google' },
  { icon: '🔥', label: 'Hard Problems',       query: 'hard' },
  { icon: '📊', label: 'Arrays & Two Pointer',query: 'array' },
  { icon: '💼', label: 'Amazon SDE Prep',     query: 'amazon' },
  { icon: '🌲', label: 'Tree Problems',       query: 'tree' },
];

export default function HomePage() {
  const [query, setQuery]   = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSearch = () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setTimeout(() => navigate(`/results?q=${encodeURIComponent(q)}`), 850);
  };

  const fillSearch = (q) => { setQuery(q); inputRef.current?.focus(); };

  return (
    <div className="page-root">
      <Navbar />

      {/* CENTER HERO */}
      <div className="home-stage grid-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        <div className="hero fade-up">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            AI Agent Active
          </div>

          <h1>Your Coding Interview<br />AI Co&#8209;Pilot</h1>

          <p className="hero-sub">
            Ask anything — search problems by company, topic, or difficulty.
            Get real solutions, approaches, and direct practice links instantly.
          </p>

          <div className="stats-row fade-up-1">
            <div className="stat"><div className="stat-val">500+</div><div className="stat-lbl">Real Problems</div></div>
            <div className="stat-div" />
            <div className="stat"><div className="stat-val">50+</div><div className="stat-lbl">Top Companies</div></div>
            <div className="stat-div" />
            <div className="stat"><div className="stat-val">3</div><div className="stat-lbl">Platforms</div></div>
          </div>

          <div className="suggestions fade-up-2">
            {SUGGESTIONS.map(s => (
              <button key={s.query} className="suggestion-chip" onClick={() => fillSearch(s.query)}>
                <span className="chip-icon">{s.icon}</span>{s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM SEARCH BAR */}
      <div className="home-search-bar fade-up-3">
        <div className="home-search-inner">
          <div className={`search-box ${loading ? 'search-box--loading' : ''}`}>
            <span className="sb-icon">🔍</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search by company, topic, or difficulty… e.g. 'Google hard DP'"
              disabled={loading}
            />
            <button
              className="send-btn"
              onClick={handleSearch}
              disabled={!query.trim() || loading}
              aria-label="Search"
            >
              {loading
                ? <span className="btn-spinner" />
                : <span>↑</span>
              }
            </button>
          </div>
          <p className="search-hint">
            Searches across LeetCode · HackerRank · GeeksforGeeks with real company data
          </p>
        </div>
      </div>

      {/* FULL-SCREEN LOADING */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <div className="loading-label">Analyzing your query…</div>
          <div className="typing-dots"><span /><span /><span /></div>
        </div>
      )}
    </div>
  );
}
