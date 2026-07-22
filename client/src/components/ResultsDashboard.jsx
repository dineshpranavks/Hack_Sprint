import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionCard from './QuestionCard';

/**
 * Results Mode Dashboard Component
 * Rendered below the chat box or on /results page when completed === true.
 * NeetCode / Blind75 style DSA Topic Recommendation Platform
 */
export default function ResultsDashboard({ profile = {}, analysis = {}, questions = [] }) {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState(null);

  const {
    summary = {},
    topics = [],
    learningRoadmap = [],
    companyInsights = [],
  } = analysis || {};

  // Group raw questions into topics if topics array from analysis is empty
  const rawQuestions = questions || [];
  
  const displayTopics = (topics && topics.length > 0) ? topics : buildFallbackTopicsFromQuestions(rawQuestions, profile);

  const activeTopicObj = selectedTopic ? displayTopics.find(t => t.name === selectedTopic.name) || selectedTopic : null;
  const activeQuestions = activeTopicObj ? (activeTopicObj.questions || []) : [];

  // Group active topic questions by difficulty
  const easyQuestions = activeQuestions.filter(q => (q.difficulty || '').toLowerCase() === 'easy');
  const mediumQuestions = activeQuestions.filter(q => (q.difficulty || '').toLowerCase() === 'medium' || !(q.difficulty));
  const hardQuestions = activeQuestions.filter(q => (q.difficulty || '').toLowerCase() === 'hard');

  const handleTopicCardClick = (topic) => {
    const topicSlug = topic.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    navigate(`/topic/${topicSlug}`);
  };

  return (
    <div className="results-dashboard-root fade-in" style={{ marginTop: 20, paddingBottom: 64 }}>
      {/* HEADER BANNER */}
      <div
        className="dashboard-header-card"
        style={{
          background: 'linear-gradient(135deg, rgba(20,24,38,0.95), rgba(15,18,28,0.98))',
          border: '1px solid rgba(56,189,248,0.2)',
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
              AI DSA Recommendation Engine Active
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
              DSA Prep Kit for <span style={{ color: '#38bdf8' }}>{profile.company || summary.company || 'Tech Company'}</span>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: 4, margin: 0 }}>
              {profile.role || summary.role || 'Software Engineer'} · {profile.experience || summary.experience || 'Candidate'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 16px', textAlign: 'center' }}>
              <div style={{ color: '#38bdf8', fontSize: '1.2rem', fontWeight: 700 }}>{displayTopics.length}</div>
              <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', tracking: '0.05em' }}>DSA Topics</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 16px', textAlign: 'center' }}>
              <div style={{ color: '#4ade80', fontSize: '1.2rem', fontWeight: 700 }}>{rawQuestions.length || 20}</div>
              <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', tracking: '0.05em' }}>Coding Problems</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: TOPIC CARDS DASHBOARD */}
      <section style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.4rem' }}>🧩</span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              Recommended DSA Topics
            </h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>
            Click any topic to open dedicated topic page ➔
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {displayTopics.map((topic, idx) => {
            const stars = renderStarRating(topic.priorityRating || 5);

            return (
              <div
                key={idx}
                onClick={() => handleTopicCardClick(topic)}
                style={{
                  background: 'rgba(18,22,34,0.85)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14,
                  padding: 20,
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#38bdf8';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(56,189,248,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <h4 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                    {topic.name}
                  </h4>
                  <span style={{ color: '#facc15', fontSize: '0.9rem', letterSpacing: 2 }}>
                    {stars}
                  </span>
                </div>

                <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: '0 0 14px 0', lineHeight: 1.4 }}>
                  {topic.explanation || `Core DSA topic for ${profile.company || 'Tech'} interview preparation.`}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12 }}>
                  <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600 }}>
                    {topic.questionCount || (topic.questions ? topic.questions.length : 5)} Problems
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#4ade80', fontWeight: 600 }}>
                    Freq: {topic.estimatedInterviewFrequency || 'High'}
                  </span>
                </div>
              </div>
            );
          })}
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

      {/* SECTION 3: COMPANY INSIGHTS */}
      {companyInsights.length > 0 && (
        <section style={{ background: 'rgba(18,22,34,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20 }}>
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
        </section>
      )}
    </div>
  );
}

function renderStarRating(rating = 5) {
  const count = Math.min(Math.max(rating, 1), 5);
  return '★'.repeat(count) + '☆'.repeat(5 - count);
}

function buildFallbackTopicsFromQuestions(questions = [], profile = {}) {
  const company = profile.company || 'Tech Company';

  const topicsMap = {
    'Dynamic Programming': [],
    'Graphs & BFS/DFS': [],
    'Trees & Binary Search Trees': [],
    'Arrays, HashMap & Two Pointers': [],
    'Sliding Window & Binary Search': [],
  };

  questions.forEach((q) => {
    const text = `${q.title} ${(q.topics || []).join(' ')} ${(q.tags || []).join(' ')}`.toLowerCase();
    if (text.includes('dp') || text.includes('dynamic')) {
      topicsMap['Dynamic Programming'].push(q);
    } else if (text.includes('graph') || text.includes('bfs') || text.includes('dfs')) {
      topicsMap['Graphs & BFS/DFS'].push(q);
    } else if (text.includes('tree')) {
      topicsMap['Trees & Binary Search Trees'].push(q);
    } else if (text.includes('sliding') || text.includes('binary search')) {
      topicsMap['Sliding Window & Binary Search'].push(q);
    } else {
      topicsMap['Arrays, HashMap & Two Pointers'].push(q);
    }
  });

  return Object.entries(topicsMap).map(([name, qList]) => ({
    name,
    priorityRating: 5,
    explanation: `High frequency DSA pattern for ${company} technical coding rounds.`,
    questionCount: qList.length || 5,
    estimatedInterviewFrequency: 'Very High',
    questions: qList.length ? qList : [
      { id: 'water-overflow', title: `${name} Pattern Problem`, difficulty: 'Medium', source: 'codeforces', reasonRecommended: `Frequent ${name} problem for ${company}` },
    ],
  }));
}
