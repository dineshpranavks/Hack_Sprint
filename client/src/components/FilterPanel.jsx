import { useEffect, useRef } from 'react';
import { ALL_COMPANIES, ALL_DIFFICULTIES, PROGRAM_TYPES } from '../data/problems';

export default function FilterPanel({ isOpen, onClose, filters, onChange, onReset, anchorRef }) {
  const panelRef = useRef(null);

  /* close on outside click */
  useEffect(() => {
    if (!isOpen) return;
    const fn = (e) => {
      if (anchorRef?.current?.contains(e.target)) return;
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [isOpen, onClose, anchorRef]);

  /* close on Escape */
  useEffect(() => {
    const fn = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  const toggleDiff = (d) =>
    onChange({ ...filters, difficulty: filters.difficulty === d ? 'All' : d });

  const toggleCompany = (c) => {
    const set = new Set(filters.companies);
    set.has(c) ? set.delete(c) : set.add(c);
    onChange({ ...filters, companies: [...set] });
  };

  const togglePType = (pt) => {
    const set = new Set(filters.programTypes);
    set.has(pt) ? set.delete(pt) : set.add(pt);
    onChange({ ...filters, programTypes: [...set] });
  };

  const activeCount =
    (filters.difficulty !== 'All' ? 1 : 0) +
    filters.companies.length +
    filters.programTypes.length;

  return (
    <div ref={panelRef} className={`fp-panel ${isOpen ? 'fp-panel--open' : ''}`}>

      {/* Header */}
      <div className="fp-header">
        <span className="fp-title">⚙️ Filters</span>
        {activeCount > 0 && (
          <button className="fp-reset" onClick={onReset}>Reset all</button>
        )}
        <button className="fp-close" onClick={onClose} aria-label="Close filters">✕</button>
      </div>

      <div className="fp-body">

        {/* ── DIFFICULTY ── */}
        <div className="fp-section">
          <div className="fp-section-label">Difficulty</div>
          <div className="fp-chips">
            {ALL_DIFFICULTIES.map(d => (
              <button
                key={d}
                className={`fp-chip fp-chip--diff-${d.toLowerCase()} ${filters.difficulty === d ? 'fp-chip--active' : ''}`}
                onClick={() => toggleDiff(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* ── PROGRAM TYPE ── */}
        <div className="fp-section">
          <div className="fp-section-label">Program Type</div>
          <div className="fp-chips">
            {PROGRAM_TYPES.map(pt => (
              <button
                key={pt}
                className={`fp-chip ${filters.programTypes.includes(pt) ? 'fp-chip--active' : ''}`}
                onClick={() => togglePType(pt)}
              >
                {pt}
              </button>
            ))}
          </div>
        </div>

        {/* ── COMPANY ── */}
        <div className="fp-section">
          <div className="fp-section-label">Company</div>
          <div className="fp-chips">
            {ALL_COMPANIES.map(c => (
              <button
                key={c}
                className={`fp-chip fp-chip--company ${filters.companies.includes(c) ? 'fp-chip--active' : ''}`}
                onClick={() => toggleCompany(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="fp-footer">
        <span className="fp-active-count">
          {activeCount > 0 ? `${activeCount} filter${activeCount > 1 ? 's' : ''} active` : 'No filters applied'}
        </span>
        <button className="fp-apply" onClick={onClose}>Apply →</button>
      </div>
    </div>
  );
}
