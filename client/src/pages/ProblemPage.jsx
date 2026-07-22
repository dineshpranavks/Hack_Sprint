import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getProblemBySlug } from '../data/problems';

const PLATFORM_META = {
  LeetCode:      { emoji: '🟨', cls: 'leetcode',   sub: 'Practice on LeetCode' },
  HackerRank:    { emoji: '🟩', cls: 'hackerrank',  sub: 'Practice on HackerRank' },
  GeeksforGeeks: { emoji: '🟢', cls: 'gfg',         sub: 'Practice on GfG' },
};

function ApproachCard({ approach, index }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className="approach-card">
      <div className="approach-header" onClick={() => setOpen(o => !o)}>
        <div className="approach-num">{index + 1}</div>
        <div className="approach-title">{approach.title}</div>
        <div className={`approach-chevron ${open ? 'open' : ''}`}>▼</div>
      </div>
      {open && (
        <div className="approach-body fade-in">
          <ol className="approach-steps">
            {approach.steps.map((step, i) => (
              <li key={i} className="approach-step">
                <div className="step-num">{i + 1}</div>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default function ProblemPage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const navigate  = useNavigate();
  const problem   = getProblemBySlug(slug);
  const backQuery = params.get('from') || '';

  if (!problem) {
    return (
      <div className="page-root">
        <Navbar />
        <div className="not-found">
          <div className="not-found-icon">😕</div>
          <h2>Problem Not Found</h2>
          <p>We couldn't find this problem.</p>
          <button className="back-btn" style={{ marginTop: 16 }} onClick={() => navigate('/')}>← Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-root">
      <Navbar />

      {/* ── BREADCRUMB NAV ── */}
      <div className="problem-top-nav">
        <button className="back-btn" onClick={() => navigate(backQuery ? `/results?q=${backQuery}` : -1)}>
          ← Back
        </button>
        <div className="breadcrumb">
          <span>HackSprint</span>
          <span className="bc-sep">/</span>
          <span>Problems</span>
          <span className="bc-sep">/</span>
          <span style={{ color: 'var(--t2)' }}>{problem.name}</span>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="problem-detail-body">

        {/* HEADER */}
        <div className="problem-header fade-up">
          <h1>{problem.name}</h1>
          <div className="problem-meta-row">
            <span className={`badge badge-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
            {problem.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
          <div className="problem-companies">
            {problem.companies.map(c => <span key={c} className="company-pill">{c}</span>)}
          </div>
        </div>

        <div className="section-div" />

        {/* DESCRIPTION */}
        <div className="detail-section fade-up-1">
          <div className="detail-section-title">📋 Problem Description</div>
          <div className="description-box">
            <p dangerouslySetInnerHTML={{ __html: problem.description }} />
            <div className="example-box">
              <div className="example-label">Example</div>
              {problem.example}
            </div>
          </div>
        </div>

        {/* APPROACHES */}
        <div className="detail-section fade-up-2">
          <div className="detail-section-title">🧠 Solution Approaches</div>
          {problem.approaches.map((a, i) => <ApproachCard key={i} approach={a} index={i} />)}
        </div>

        {/* EDGE CASES */}
        <div className="detail-section fade-up-3">
          <div className="detail-section-title">⚠️ Edge Cases</div>
          <div className="edge-list">
            {problem.edgeCases.map((ec, i) => (
              <div key={i} className="edge-item">
                <span className="edge-icon">⚡</span>
                <span>{ec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PRACTICE LINKS */}
        <div className="detail-section fade-up-4">
          <div className="detail-section-title">🚀 Practice This Problem</div>
          <div className="practice-grid">
            {problem.platforms.map(pl => {
              const m = PLATFORM_META[pl.name] || { emoji: '🔗', cls: '', sub: 'Practice' };
              return (
                <a key={pl.name} href={pl.url} target="_blank" rel="noopener noreferrer"
                  className={`practice-btn ${m.cls}`}>
                  <span className="practice-btn-icon">{m.emoji}</span>
                  <div className="practice-btn-body">
                    <div className="practice-btn-name">{pl.name}</div>
                    <div className="practice-btn-sub">{m.sub}</div>
                  </div>
                  <span className="external-icon">↗</span>
                </a>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
