import { useState } from 'react';
import QuestionCard from './QuestionCard';

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

  // Collect recommended questions from categories or search results
  const categoryQuestions = categories.flatMap((c) => c.questions || []);
  const rawQuestions = questions || [];
  
  // Merge and deduplicate by title/id
  const combinedMap = new Map();
  categoryQuestions.forEach((q) => {
    const key = q.id || q.title?.toLowerCase();
    if (key) combinedMap.set(key, q);
  });
  rawQuestions.forEach((q) => {
    const key = q.id || q.title?.toLowerCase();
    if (key && !combinedMap.has(key)) combinedMap.set(key, q);
  });

  const displayQuestions = Array.from(combinedMap.values()).slice(0, 16);

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
              Target Prep Guide for <span style={{ color: '#38bdf8' }}>{profile.company || summary.company || 'Tech Company'}</span>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: 4, margin: 0 }}>
              {profile.role || summary.role || 'Software Engineer'} · {profile.experience || summary.experience || 'Candidate'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 16px', textAlign: 'center' }}>
              <div style={{ color: '#38bdf8', fontSize: '1.2rem', fontWeight: 700 }}>{rawQuestions.length || summary.totalResults || 0}</div>
              <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', tracking: '0.05em' }}>Items Analyzed</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 16px', textAlign: 'center' }}>
              <div style={{ color: '#a855f7', fontSize: '1.2rem', fontWeight: 700 }}>{displayQuestions.length}</div>
              <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', tracking: '0.05em' }}>Recommended Qs</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: RECOMMENDED QUESTIONS (NO PLATFORM BIAS) */}
      <section style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: '1.4rem' }}>🎯</span>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Curated Interview Questions</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {displayQuestions.map((q, idx) => (
            <QuestionCard key={idx} question={q} />
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
    </div>
  );
}
