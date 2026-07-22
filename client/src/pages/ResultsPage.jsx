import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FilterPanel from '../components/FilterPanel';
import { searchProblems } from '../data/problems';

const PLATFORM_CLS = { LeetCode: 'leetcode', HackerRank: 'hackerrank', GeeksforGeeks: 'gfg' };

const DEFAULT_FILTERS = { difficulty: 'All', companies: [], programTypes: [] };

function activeCount(f) {
  return (f.difficulty !== 'All' ? 1 : 0) + f.companies.length + f.programTypes.length;
}

/* ── Problem card ── */
function ProblemCard({ problem, index, query }) {
  const navigate = useNavigate();
  return (
    <div
      className="problem-card fade-up"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => navigate(`/problem/${problem.slug}?from=${encodeURIComponent(query)}`)}
    >
      <div className="problem-card-top">
        <div style={{ flex: 1 }}>
          <div className="problem-name">{problem.name}</div>
          <div className="problem-card-meta">
            <span className={`badge badge-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
            {problem.tags.slice(0, 3).map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        </div>
        <div className="arrow-icon">↗</div>
      </div>

      <div className="problem-card-bottom">
        <div className="platforms-row">
          <span className="section-mini-label">On:</span>
          {problem.platforms.map(pl => (
            <span key={pl.name} className={`platform-pill ${PLATFORM_CLS[pl.name] || ''}`}>{pl.name}</span>
          ))}
        </div>
        <div className="companies-row">
          <span className="section-mini-label">Asked by:</span>
          {problem.companies.slice(0, 4).map(c => <span key={c} className="company-pill">{c}</span>)}
          {problem.companies.length > 4 && <span className="company-pill">+{problem.companies.length - 4}</span>}
        </div>
      </div>
    </div>
  );
}

/* ── Active filter pills (shown below search bar) ── */
function ActivePills({ filters, onChange }) {
  const pills = [];

  if (filters.difficulty !== 'All')
    pills.push({ label: `Difficulty: ${filters.difficulty}`, remove: () => onChange({ ...filters, difficulty: 'All' }) });

  filters.programTypes.forEach(pt =>
    pills.push({ label: pt, remove: () => onChange({ ...filters, programTypes: filters.programTypes.filter(x => x !== pt) }) })
  );

  filters.companies.forEach(c =>
    pills.push({ label: c, remove: () => onChange({ ...filters, companies: filters.companies.filter(x => x !== c) }) })
  );

  if (!pills.length) return null;

  return (
    <div className="active-pills-row">
      <span className="active-pills-label">Active:</span>
      {pills.map((p, i) => (
        <span key={i} className="active-pill">
          {p.label}
          <button className="active-pill-remove" onClick={p.remove} aria-label="Remove filter">✕</button>
        </span>
      ))}
    </div>
  );
}

/* ── Main component ── */
export default function ResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputVal, setInputVal] = useState(searchParams.get('q') || '');
  const [query,    setQuery]    = useState(searchParams.get('q') || '');
  const [filters,  setFilters]  = useState(DEFAULT_FILTERS);
  const [loading,  setLoading]  = useState(true);
  const [fpOpen,   setFpOpen]   = useState(false);

  const inputRef     = useRef(null);
  const filterBtnRef = useRef(null);
  const navigate     = useNavigate();

  /* sync URL → state */
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q); setInputVal(q);
  }, [searchParams]);

  /* loading flicker */
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 480);
    return () => clearTimeout(t);
  }, [query, filters]);

  const results = searchProblems(query, filters);
  const count   = activeCount(filters);

  const doSearch = () => {
    const q = inputVal.trim();
    if (!q) return;
    setSearchParams({ q });
    setFilters(DEFAULT_FILTERS);
  };

  const handleFiltersChange = (newF) => setFilters(newF);
  const resetFilters        = ()    => setFilters(DEFAULT_FILTERS);

  return (
    <div className="page-root">
      <Navbar />

      <div className="results-page">

        {/* ── STICKY TOP BAR ── */}
        <div className="results-topbar">

          {/* Search row */}
          <div className="results-search-row">
            <div className="top-search-box">
              <span className="search-icon">🔍</span>
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doSearch()}
                placeholder="Search problems, companies, topics…"
              />
            </div>

            <button className="top-send-btn" onClick={doSearch} aria-label="Search">↑</button>

            {/* FILTER BUTTON */}
            <button
              ref={filterBtnRef}
              className={`filter-toggle-btn ${fpOpen ? 'filter-toggle-btn--open' : ''} ${count > 0 ? 'filter-toggle-btn--active' : ''}`}
              onClick={() => setFpOpen(o => !o)}
              aria-label="Open filters"
            >
              <span>⚙</span>
              <span>Filter</span>
              {count > 0 && <span className="filter-count-badge">{count}</span>}
              <span className={`filter-btn-chevron ${fpOpen ? 'open' : ''}`}>▾</span>
            </button>

            <div className="results-count">
              <strong>{results.length}</strong> results
            </div>
          </div>

          {/* Active filter pills */}
          <ActivePills filters={filters} onChange={handleFiltersChange} />

          {/* FILTER POPOVER */}
          <FilterPanel
            isOpen={fpOpen}
            onClose={() => setFpOpen(false)}
            filters={filters}
            onChange={handleFiltersChange}
            onReset={resetFilters}
            anchorRef={filterBtnRef}
          />
        </div>

        {/* ── RESULTS BODY ── */}
        <div className="results-body">
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <div style={{ color: 'var(--t2)', fontSize: '.87rem' }}>Analyzing "{query}"…</div>
              <div className="typing-dots"><span /><span /><span /></div>
            </div>
          ) : results.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <div className="empty-title">No problems found</div>
              <div className="empty-sub">
                Try different keywords or{' '}
                {count > 0 && <button className="inline-reset" onClick={resetFilters}>clear filters</button>}
              </div>
            </div>
          ) : (
            <div className="results-list">
              {results.map((p, i) => <ProblemCard key={p.id} problem={p} index={i} query={query} />)}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
