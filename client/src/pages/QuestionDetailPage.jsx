import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/v1\/?$/, '') 
  : 'http://localhost:5000/api';

export default function QuestionDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const passedQuestion = location.state?.questionData || {};
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLang, setActiveLang] = useState('java');
  const [revealedHints, setRevealedHints] = useState({});
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    async function loadQuestionDetail() {
      try {
        setLoading(true);
        setError(null);

        const payload = {
          questionId: id || passedQuestion.id || passedQuestion.slug,
          title: passedQuestion.title || id,
          company: passedQuestion.company || 'Tech Company',
          role: passedQuestion.role || 'Software Engineer',
          difficulty: passedQuestion.difficulty || 'Medium',
          category: passedQuestion.category || 'General',
          topics: passedQuestion.topics || passedQuestion.tags || [],
          url: passedQuestion.url || null,
          userId: user?.uid || 'guest',
        };

        const res = await axios.post(`${API_BASE_URL}/agent/question-detail`, payload);
        if (res.data?.detail) {
          setDetail(res.data.detail);
        } else {
          setError('Failed to load question explanation.');
        }
      } catch (err) {
        console.error('[QuestionDetailPage Load Error]:', err);
        setError(err?.response?.data?.error || 'Unable to load detailed explanation.');
      } finally {
        setLoading(false);
      }
    }

    loadQuestionDetail();
  }, [id, passedQuestion, user]);

  const toggleHint = (level) => {
    setRevealedHints((prev) => ({ ...prev, [level]: !prev[level] }));
  };

  const handleToggleBookmark = async () => {
    try {
      const questionId = id || passedQuestion.id;
      const res = await axios.post(`${API_BASE_URL}/user/bookmark`, {
        userId: user?.uid || 'guest',
        questionId,
        questionData: detail || passedQuestion,
      });
      if (res.data?.bookmarked !== undefined) {
        setIsBookmarked(res.data.bookmarked);
      } else {
        setIsBookmarked((prev) => !prev);
      }
    } catch (e) {
      setIsBookmarked((prev) => !prev);
    }
  };

  const qData = detail || passedQuestion;
  const solutions = detail?.solutions || {};
  const currentSolution = solutions[activeLang] || {};

  return (
    <div className="page-root">
      <Navbar />

      <div className="home-stage grid-bg" style={{ minHeight: '100vh', paddingBottom: 80 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px' }}>
          
          {/* NAVIGATION HEADER */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#94a3b8',
                padding: '8px 14px',
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              ← Back to Dashboard
            </button>

            <button
              onClick={handleToggleBookmark}
              style={{
                background: isBookmarked ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)',
                border: isBookmarked ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: isBookmarked ? '#f59e0b' : '#e2e8f0',
                padding: '8px 14px',
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              {isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
              <div className="btn-spinner" style={{ width: 32, height: 32, margin: '0 auto 16px auto' }} />
              <h3>Synthesizing AI Knowledge Guide...</h3>
              <p style={{ fontSize: '0.88rem' }}>Generating problem breakdown, test cases, worked example & multi-language solutions...</p>
            </div>
          ) : error ? (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 12, padding: 24, textAlign: 'center', color: '#fca5a5' }}>
              <h4>{error}</h4>
              <button onClick={() => window.location.reload()} style={{ marginTop: 12, padding: '8px 16px', background: '#ef4444', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer' }}>
                Retry Loading
              </button>
            </div>
          ) : (
            <div className="fade-in">
              {/* TITLE HEADER CARD */}
              <div style={{ background: 'rgba(18,22,34,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: '0.76rem', fontWeight: 600, background: getDifficultyBg(qData.difficulty), color: getDifficultyColor(qData.difficulty) }}>
                    {qData.difficulty || 'Medium'}
                  </span>
                  <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: '0.76rem', fontWeight: 600, background: 'rgba(56,189,248,0.12)', color: '#38bdf8' }}>
                    {qData.category || 'Algorithms'}
                  </span>
                  {qData.company && (
                    <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: '0.76rem', fontWeight: 600, background: 'rgba(168,85,247,0.12)', color: '#c084fc' }}>
                      🏢 {qData.company}
                    </span>
                  )}
                </div>

                <h1 style={{ color: '#f8fafc', fontSize: '1.8rem', fontWeight: 700, margin: '0 0 12px 0' }}>
                  {qData.title}
                </h1>

                <div style={{ display: 'flex', gap: 16, color: '#94a3b8', fontSize: '0.85rem' }}>
                  <span>Freq: <strong style={{ color: '#f1f5f9' }}>{qData.estimatedInterviewFrequency || 'High'}</strong></span>
                  <span>Study Time: <strong style={{ color: '#f1f5f9' }}>{qData.estimatedStudyTime || '45 mins'}</strong></span>
                </div>
              </div>

              {/* PROBLEM BREAKDOWN & EXPECTATIONS */}
              <div style={{ background: 'rgba(18,22,34,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
                <h3 style={{ color: '#38bdf8', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 12px 0' }}>
                  💡 Problem Overview & Interview Expectations
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 16 }}>
                  {detail.problemExplanation?.whatProblemIsAsking}
                </p>

                {detail.problemExplanation?.keyObservations && (
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ color: '#f8fafc', fontSize: '0.95rem', fontWeight: 600, marginBottom: 8 }}>Key Observations:</h4>
                    <ul style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, paddingLeft: 20, margin: 0 }}>
                      {detail.problemExplanation.keyObservations.map((obs, idx) => (
                        <li key={idx} style={{ marginBottom: 4 }}>{obs}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {detail.problemExplanation?.interviewExpectations && (
                  <div style={{ background: 'rgba(34,197,94,0.08)', borderLeft: '3px solid #22c55e', padding: '10px 14px', borderRadius: '0 8px 8px 0', color: '#86efac', fontSize: '0.88rem' }}>
                    <strong>Interview Expectation:</strong> {detail.problemExplanation.interviewExpectations}
                  </div>
                )}
              </div>

              {/* WORKED EXAMPLE WALKTHROUGH */}
              {detail.workedExample && (
                <div style={{ background: 'rgba(18,22,34,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
                  <h3 style={{ color: '#f59e0b', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 12px 0' }}>
                    🔍 Worked Example Walkthrough
                  </h3>
                  <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 14, marginBottom: 12, fontFamily: 'monospace', fontSize: '0.88rem', color: '#38bdf8' }}>
                    <div><strong>Input:</strong> {detail.workedExample.input}</div>
                    <div><strong>Output:</strong> {detail.workedExample.output}</div>
                  </div>
                  <pre style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                    {detail.workedExample.stepByStepExplanation}
                  </pre>
                </div>
              )}

              {/* 10 TEST CASES ACCORDION */}
              {detail.testCases && detail.testCases.length > 0 && (
                <div style={{ background: 'rgba(18,22,34,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
                  <h3 style={{ color: '#a855f7', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px 0' }}>
                    🧪 Generated Test Cases ({detail.testCases.length})
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                    {detail.testCases.map((tc, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>Test Case #{idx + 1}</span>
                          <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: 4, background: 'rgba(168,85,247,0.15)', color: '#c084fc' }}>{tc.type || 'Standard'}</span>
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 4 }}>In: {tc.input}</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#4ade80', marginBottom: 6 }}>Out: {tc.expectedOutput}</div>
                        <div style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>{tc.shortExplanation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CODE SOLUTIONS IN TABBED VIEW */}
              <div style={{ background: 'rgba(18,22,34,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ color: '#4ade80', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                    💻 Optimal Solutions
                  </h3>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['java', 'python', 'javascript'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setActiveLang(lang)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 6,
                          border: 'none',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textTransform: 'capitalize',
                          background: activeLang === lang ? '#4ade80' : 'rgba(255,255,255,0.06)',
                          color: activeLang === lang ? '#0f172a' : '#94a3b8',
                        }}
                      >
                        {lang === 'javascript' ? 'JavaScript' : lang}
                      </button>
                    ))}
                  </div>
                </div>

                {currentSolution.code ? (
                  <div>
                    <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: '0.82rem', color: '#94a3b8' }}>
                      <span>Time Complexity: <strong style={{ color: '#4ade80' }}>{currentSolution.timeComplexity}</strong></span>
                      <span>Space Complexity: <strong style={{ color: '#4ade80' }}>{currentSolution.spaceComplexity}</strong></span>
                    </div>

                    <pre style={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 16, color: '#f1f5f9', fontFamily: 'monospace', fontSize: '0.88rem', overflowX: 'auto', margin: '0 0 12px 0' }}>
                      {currentSolution.code}
                    </pre>

                    <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
                      {currentSolution.explanation}
                    </p>
                  </div>
                ) : (
                  <div style={{ color: '#64748b', fontSize: '0.88rem' }}>Solution available in Java, Python, and JavaScript.</div>
                )}
              </div>

              {/* PROGRESSIVE HINTS */}
              {detail.hints && detail.hints.length > 0 && (
                <div style={{ background: 'rgba(18,22,34,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
                  <h3 style={{ color: '#facc15', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 14px 0' }}>
                    🔑 Progressive Hints
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {detail.hints.map((h, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ color: '#facc15', fontWeight: 600, fontSize: '0.88rem' }}>Hint #{h.level || idx + 1}</span>
                          <button onClick={() => toggleHint(idx)} style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.8rem', cursor: 'pointer' }}>
                            {revealedHints[idx] ? 'Hide' : 'Reveal Hint'}
                          </button>
                        </div>
                        {revealedHints[idx] && (
                          <div style={{ marginTop: 8, color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.4 }}>
                            {h.hint}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ORIGINAL PRACTICE LINK BUTTON */}
              {qData.url && (
                <div style={{ textAlign: 'center', margin: '32px 0' }}>
                  <a
                    href={qData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      padding: '12px 28px',
                      background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                      color: '#0f172a',
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: '1rem',
                      textDecoration: 'none',
                      boxShadow: '0 4px 14px rgba(56,189,248,0.4)',
                    }}
                  >
                    Practice on Original Platform ↗
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
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
