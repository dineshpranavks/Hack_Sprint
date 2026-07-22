import { useState } from 'react';

/**
 * Results Mode Dashboard Component
 * Rendered below the chat box when completed === true.
 */
export default function ResultsDashboard({ profile = {}, analysis = {}, questions = [] }) {
  const [openSource, setOpenSource] = useState('all');

  const {
    summary = {},
    categories = [],
    learningRoadmap = [],
    priorityTopics = [],
    recommendations = [],
    companyInsights = [],
    weakAreas = [],
    interviewStrategy = [],
    similarTopics = [],
  } = analysis || {};

  // Group search results by source
  const githubItems = questions.filter((q) => q.source === 'github');
  const stackItems = questions.filter((q) => q.source === 'stackoverflow');
  const redditItems = questions.filter((q) => q.source === 'reddit');
  const codeforcesItems = questions.filter((q) => q.source === 'codeforces');

  // Collect recommended questions from categories or top ranked questions
  const recommendedQuestions = categories.flatMap((c) => c.questions || []).slice(0, 12);
  const displayQuestions = recommendedQuestions.length > 0 ? recommendedQuestions : questions.slice(0, 10);

  return (
    <div className="results-dashboard-root fade-in" style={{ marginTop: 32, paddingBottom: 64 }}>
      {/* HEADER BANNER */}
      <div
        className="dashboard-header-card"
        style={{
          background: 'linear-gradient(135deg, rgba(20,24,38,0.95), rgba(15,18,28,0.98))',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '24px 28px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(12px)',
          marginBottom: 28,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 20, color: '#4ade80', fontSize: '0.78rem', fontWeight: 600, marginBottom: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
              AI Intelligence Analysis Ready
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
              Target Prep Kit for <span style={{ color: '#38bdf8' }}>{profile.company || summary.company || 'Tech Company'}</span>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: 4, margin: 0 }}>
              {profile.role || summary.role || 'Software Engineer'} · {profile.experience || summary.experience || 'Candidate'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 16px', textAlign: 'center' }}>
              <div style={{ color: '#38bdf8', fontSize: '1.2rem', fontWeight: 700 }}>{questions.length || summary.totalResults || 0}</div>
              <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', tracking: '0.05em' }}>Items Analyzed</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 16px', textAlign: 'center' }}>
              <div style={{ color: '#a855f7', fontSize: '1.2rem', fontWeight: 700 }}>{displayQuestions.length}</div>
              <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', tracking: '0.05em' }}>Recommended Qs</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: RECOMMENDED QUESTIONS */}
      <section style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: '1.4rem' }}>🎯</span>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Recommended Questions</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {displayQuestions.map((q, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(18,22,34,0.85)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14,
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                transition: 'transform 0.2s, border-color 0.2s',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      background: getSourceBadgeBg(q.source),
                      color: getSourceBadgeColor(q.source),
                    }}
                  >
                    {q.source || 'Curated'}
                  </span>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      background: getDifficultyBg(q.difficulty),
                      color: getDifficultyColor(q.difficulty),
                    }}
                  >
                    {q.difficulty || 'Medium'}
                  </span>
                </div>

                <h4 style={{ color: '#f1f5f9', fontSize: '1.02rem', fontWeight: 600, margin: '0 0 8px 0', lineHeight: 1.35 }}>
                  {q.title}
                </h4>

                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 12px 0', lineHeight: 1.45 }}>
                  {q.shortExplanation || q.description || 'Key interview practice question.'}
                </p>

                {q.reasonRecommended && (
                  <div style={{ background: 'rgba(56,189,248,0.08)', borderLeft: '3px solid #38bdf8', padding: '6px 10px', borderRadius: '0 6px 6px 0', color: '#bae6fd', fontSize: '0.78rem', marginBottom: 12 }}>
                    <strong>Why:</strong> {q.reasonRecommended}
                  </div>
                )}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', fontSize: '0.75rem', marginBottom: 12 }}>
                  <span>Freq: <strong style={{ color: '#cbd5e1' }}>{q.estimatedInterviewFrequency || 'High'}</strong></span>
                  <span>Time: <strong style={{ color: '#cbd5e1' }}>{q.estimatedStudyTime || '30 mins'}</strong></span>
                </div>

                {q.url && (
                  <a
                    href={q.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '8px 12px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      color: '#38bdf8',
                      fontSize: '0.82rem',
                      fontWeight: 500,
                      textDecoration: 'none',
                    }}
                  >
                    Open Original Link ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: LEARNING ROADMAP */}
      <section style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: '1.4rem' }}>🗺️</span>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Personalized Learning Roadmap</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {learningRoadmap.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(24,28,42,0.85)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: 16,
                position: 'relative',
              }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: '#38bdf8', color: '#0f172a', fontWeight: 700, fontSize: '0.85rem', marginBottom: 10 }}>
                {item.step || idx + 1}
              </div>
              <h4 style={{ color: '#f8fafc', fontSize: '0.98rem', fontWeight: 600, margin: '0 0 6px 0' }}>{item.title}</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: 0, lineHeight: 1.4 }}>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3 & 4: PRIORITY TOPICS & COMPANY INSIGHTS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 36 }}>
        {/* PRIORITY TOPICS */}
        <div style={{ background: 'rgba(18,22,34,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: '1.2rem' }}>🔥</span>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Priority Focus Topics</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {priorityTopics.map((pt, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.92rem' }}>{pt.topic}</span>
                  <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600, background: pt.importance === 'High' ? 'rgba(239,68,68,0.2)' : 'rgba(234,179,8,0.2)', color: pt.importance === 'High' ? '#f87171' : '#facc15' }}>
                    {pt.importance || 'High'}
                  </span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>{pt.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* COMPANY INSIGHTS */}
        <div style={{ background: 'rgba(18,22,34,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: '1.2rem' }}>🏢</span>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Company Insights</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {companyInsights.map((ci, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 12 }}>
                <h5 style={{ color: '#a855f7', fontSize: '0.92rem', fontWeight: 600, margin: '0 0 4px 0' }}>{ci.title}</h5>
                <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0, lineHeight: 1.4 }}>{ci.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 5 & 6: WEAK AREAS & INTERVIEW STRATEGY */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 36 }}>
        {/* WEAK AREAS */}
        <div style={{ background: 'rgba(18,22,34,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Target Improvement Areas</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {weakAreas.map((wa, idx) => (
              <div key={idx} style={{ background: 'rgba(239,68,68,0.06)', borderLeft: '3px solid #ef4444', padding: '10px 12px', borderRadius: '0 8px 8px 0' }}>
                <span style={{ color: '#fca5a5', fontWeight: 600, fontSize: '0.88rem', display: 'block', marginBottom: 2 }}>{wa.topic}</span>
                <span style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>{wa.reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* INTERVIEW STRATEGY */}
        <div style={{ background: 'rgba(18,22,34,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: '1.2rem' }}>💡</span>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Tactical Interview Strategy</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {interviewStrategy.map((st, idx) => (
              <div key={idx} style={{ background: 'rgba(34,197,94,0.06)', borderLeft: '3px solid #22c55e', padding: '10px 12px', borderRadius: '0 8px 8px 0' }}>
                <span style={{ color: '#86efac', fontWeight: 600, fontSize: '0.88rem', display: 'block', marginBottom: 2 }}>{st.title}</span>
                <span style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>{st.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 7: COLLAPSIBLE RAW SEARCH RESULTS */}
      <section style={{ background: 'rgba(18,22,34,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.2rem' }}>🌐</span>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Multi-Source Search Items ({questions.length})</h4>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'github', 'stackoverflow', 'reddit', 'codeforces'].map((src) => (
              <button
                key={src}
                onClick={() => setOpenSource(src)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  background: openSource === src ? '#38bdf8' : 'rgba(255,255,255,0.06)',
                  color: openSource === src ? '#0f172a' : '#94a3b8',
                }}
              >
                {src}
              </button>
            ))}
          </div>
        </div>

        {/* ITEMS LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {questions
            .filter((q) => openSource === 'all' || q.source === openSource)
            .map((q, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 10,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: getSourceBadgeBg(q.source), color: getSourceBadgeColor(q.source) }}>
                      {q.source}
                    </span>
                    <a href={q.url} target="_blank" rel="noopener noreferrer" style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
                      {q.title} ↗
                    </a>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>
                    {q.description ? q.description.slice(0, 140) + '...' : 'Interview problem reference.'}
                  </p>
                </div>
                <div style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  Score: {q.relevanceScore || 75}
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}

function getSourceBadgeBg(source) {
  switch (source) {
    case 'github': return 'rgba(59,130,246,0.15)';
    case 'stackoverflow': return 'rgba(249,115,22,0.15)';
    case 'reddit': return 'rgba(239,68,68,0.15)';
    case 'codeforces': return 'rgba(168,85,247,0.15)';
    default: return 'rgba(148,163,184,0.15)';
  }
}

function getSourceBadgeColor(source) {
  switch (source) {
    case 'github': return '#60a5fa';
    case 'stackoverflow': return '#fb923c';
    case 'reddit': return '#f87171';
    case 'codeforces': return '#c084fc';
    default: return '#cbd5e1';
  }
}

function getDifficultyBg(difficulty) {
  switch ((difficulty || '').toLowerCase()) {
    case 'easy': return 'rgba(34,197,94,0.15)';
    case 'medium': return 'rgba(234,179,8,0.15)';
    case 'hard': return 'rgba(239,68,68,0.15)';
    default: return 'rgba(148,163,184,0.15)';
  }
}

function getDifficultyColor(difficulty) {
  switch ((difficulty || '').toLowerCase()) {
    case 'easy': return '#4ade80';
    case 'medium': return '#facc15';
    case 'hard': return '#f87171';
    default: return '#cbd5e1';
  }
}
