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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLang, setActiveLang] = useState('python');
  const [revealedHints, setRevealedHints] = useState({});
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Accordion collapsed state management
  const [openSections, setOpenSections] = useState({
    explanation: true,
    walkthrough: true,
    hints: true,
    testCases: true,
    solutions: true,
    complexity: true,
    insights: true,
    followUps: true,
    similar: true,
    practice: true,
  });

  const toggleSection = (sectionKey) => {
    setOpenSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  useEffect(() => {
    async function fetchQuestionDetails() {
      try {
        setLoading(true);
        setError(null);

        const targetId = id || passedQuestion.questionId || passedQuestion.id || passedQuestion.slug;

        const payload = {
          questionId: targetId,
          source: passedQuestion.source || 'all',
          title: passedQuestion.title || targetId,
          description: passedQuestion.description || '',
          difficulty: passedQuestion.difficulty || 'Medium',
          topics: passedQuestion.topics || passedQuestion.tags || [],
          company: passedQuestion.company || 'Tech Company',
          url: passedQuestion.url || null,
          userId: user?.uid || 'guest',
        };

        const res = await axios.post(`${API_BASE_URL}/question/details`, payload);
        if (res.data && (res.data.explanation || res.data.solutions)) {
          setData(res.data);
        } else {
          setError('Unable to generate detailed explanation.');
        }
      } catch (err) {
        console.error('[QuestionDetailPage Load Error]:', err);
        setError(err?.response?.data?.error || 'Unable to generate detailed explanation.');
      } finally {
        setLoading(false);
      }
    }

    fetchQuestionDetails();
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
        questionData: data || passedQuestion,
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

  const q = data || {};
  const explanation = q.explanation || {};
  const walkthrough = q.walkthrough || {};
  const hints = q.hints || [];
  const testCases = q.testCases || [];
  const solutions = q.solutions || {};
  const complexity = q.complexity || {};
  const insights = q.interviewInsights || {};
  const followUps = q.followUpQuestions || [];
  const similar = q.similarQuestions || [];
  const studyAdvice = q.studyAdvice || {};
  const practicePlatforms = q.practicePlatforms || [];

  const currentTitle = passedQuestion.title || q.title || id || 'Technical Problem';
  const currentDesc = passedQuestion.description || explanation.whatQuestionAsks || '';
  const currentTopics = passedQuestion.topics || passedQuestion.tags || q.topics || ['Algorithms'];

  const currentSolution = solutions[activeLang] || {};

  return (
    <div className="page-root">
      <Navbar />

      <div className="home-stage grid-bg" style={{ minHeight: '100vh', paddingBottom: 80 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px' }}>

          {/* BACK & BOOKMARK BAR */}
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

          {/* LOADING STATE */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
              <div className="btn-spinner" style={{ width: 36, height: 36, margin: '0 auto 20px auto' }} />
              <h3 style={{ fontSize: '1.4rem', color: '#f8fafc', fontWeight: 600 }}>Generating AI explanation for "{currentTitle}"...</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Synthesizing problem breakdown, 10 test cases, step-by-step dry run, & Python/Java/JS solutions...</p>
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
              {/* HEADER TITLE & DESCRIPTION CARD */}
              <div style={{ background: 'rgba(18,22,34,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                  <span style={{ padding: '4px 12px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600, background: getDifficultyBg(passedQuestion.difficulty || q.difficulty), color: getDifficultyColor(passedQuestion.difficulty || q.difficulty) }}>
                    {passedQuestion.difficulty || q.difficulty || 'Medium'}
                  </span>
                  {currentTopics.map((topic, idx) => (
                    <span key={idx} style={{ padding: '4px 10px', borderRadius: 6, fontSize: '0.76rem', fontWeight: 600, background: 'rgba(56,189,248,0.12)', color: '#38bdf8' }}>
                      {topic}
                    </span>
                  ))}
                  {passedQuestion.company && (
                    <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: '0.76rem', fontWeight: 600, background: 'rgba(168,85,247,0.12)', color: '#c084fc' }}>
                      🏢 {passedQuestion.company}
                    </span>
                  )}
                </div>

                <h1 style={{ color: '#f8fafc', fontSize: '1.85rem', fontWeight: 700, margin: '0 0 14px 0', lineHeight: 1.3 }}>
                  {currentTitle}
                </h1>

                {currentDesc && (
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 16, color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.6 }}>
                    <strong>Problem Statement:</strong> {currentDesc}
                  </div>
                )}
              </div>

              {/* SECTION 1: PROBLEM OVERVIEW & EXPLANATION */}
              <AccordionSection title="💡 1. Problem Explanation" isOpen={openSections.explanation} onToggle={() => toggleSection('explanation')}>
                <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 16 }}>
                  {explanation.whatQuestionAsks || currentDesc}
                </p>

                {explanation.importantObservations && (
                  <div style={{ marginBottom: 16 }}>
                    <h5 style={{ color: '#f8fafc', fontSize: '0.92rem', fontWeight: 600, marginBottom: 8 }}>Important Observations:</h5>
                    <ul style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5, paddingLeft: 20, margin: 0 }}>
                      {explanation.importantObservations.map((obs, idx) => (
                        <li key={idx} style={{ marginBottom: 4 }}>{obs}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {explanation.commonMistakes && (
                  <div style={{ marginBottom: 16 }}>
                    <h5 style={{ color: '#fca5a5', fontSize: '0.92rem', fontWeight: 600, marginBottom: 8 }}>Common Mistakes to Avoid:</h5>
                    <ul style={{ color: '#fca5a5', fontSize: '0.88rem', lineHeight: 1.5, paddingLeft: 20, margin: 0 }}>
                      {explanation.commonMistakes.map((mis, idx) => (
                        <li key={idx} style={{ marginBottom: 4 }}>{mis}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {explanation.interviewExpectations && (
                  <div style={{ background: 'rgba(34,197,94,0.08)', borderLeft: '3px solid #22c55e', padding: '10px 14px', borderRadius: '0 8px 8px 0', color: '#86efac', fontSize: '0.88rem' }}>
                    <strong>Interview Expectation:</strong> {explanation.interviewExpectations}
                  </div>
                )}
              </AccordionSection>

              {/* SECTION 2: STEP-BY-STEP WALKTHROUGH & DRY RUN */}
              {walkthrough.exampleInput && (
                <AccordionSection title="🔍 2. Step-by-Step Walkthrough & Dry Run" isOpen={openSections.walkthrough} onToggle={() => toggleSection('walkthrough')}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 14, marginBottom: 12, fontFamily: 'monospace', fontSize: '0.88rem', color: '#38bdf8' }}>
                    <div><strong>Input:</strong> {walkthrough.exampleInput}</div>
                    <div><strong>Expected Output:</strong> {walkthrough.exampleOutput}</div>
                  </div>
                  <pre style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.55, margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                    {walkthrough.dryRun}
                  </pre>
                </AccordionSection>
              )}

              {/* SECTION 3: 5 PROGRESSIVE HINTS */}
              {hints.length > 0 && (
                <AccordionSection title={`🔑 3. Progressive Hints (${hints.length})`} isOpen={openSections.hints} onToggle={() => toggleSection('hints')}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {hints.map((h, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ color: '#facc15', fontWeight: 600, fontSize: '0.88rem' }}>Hint #{h.level || idx + 1}</span>
                          <button onClick={() => toggleHint(idx)} style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.8rem', cursor: 'pointer' }}>
                            {revealedHints[idx] ? 'Hide Hint' : 'Reveal Hint'}
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
                </AccordionSection>
              )}

              {/* SECTION 4: 10 TEST CASES GRID */}
              {testCases.length > 0 && (
                <AccordionSection title={`🧪 4. Generated Test Cases (${testCases.length})`} isOpen={openSections.testCases} onToggle={() => toggleSection('testCases')}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                    {testCases.map((tc, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>Case #{idx + 1}</span>
                          <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: 4, background: 'rgba(168,85,247,0.15)', color: '#c084fc' }}>{tc.type || 'Standard'}</span>
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#94a3b8', marginBottom: 4 }}>In: {tc.input}</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#4ade80', marginBottom: 6 }}>Out: {tc.expectedOutput}</div>
                        <div style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>{tc.shortExplanation}</div>
                      </div>
                    ))}
                  </div>
                </AccordionSection>
              )}

              {/* SECTION 5 & 6: SOLUTIONS IN 3 LANGUAGES & COMPLEXITY */}
              <AccordionSection title="💻 5 & 6. Code Solutions & Complexity" isOpen={openSections.solutions} onToggle={() => toggleSection('solutions')}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['python', 'java', 'javascript'].map((lang) => (
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
                        {lang === 'javascript' ? 'JavaScript' : lang === 'python' ? 'Python' : 'Java'}
                      </button>
                    ))}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                    Time: <strong style={{ color: '#4ade80' }}>{currentSolution.timeComplexity || complexity.time || 'O(N)'}</strong> | Space: <strong style={{ color: '#4ade80' }}>{currentSolution.spaceComplexity || complexity.space || 'O(N)'}</strong>
                  </div>
                </div>

                {currentSolution.code ? (
                  <div>
                    <pre style={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 16, color: '#f1f5f9', fontFamily: 'monospace', fontSize: '0.88rem', overflowX: 'auto', margin: '0 0 12px 0' }}>
                      {currentSolution.code}
                    </pre>

                    <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
                      {currentSolution.explanation}
                    </p>
                  </div>
                ) : (
                  <div style={{ color: '#64748b', fontSize: '0.88rem' }}>Solution code available in Python, Java, and JavaScript.</div>
                )}
              </AccordionSection>

              {/* SECTION 7: INTERVIEW INSIGHTS */}
              {insights.whyCompaniesAskThis && (
                <AccordionSection title="🏢 7. Interview Insights" isOpen={openSections.insights} onToggle={() => toggleSection('insights')}>
                  <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: 12 }}>
                    <strong>Why Companies Ask This:</strong> {insights.whyCompaniesAskThis}
                  </p>
                  {insights.conceptsEvaluated && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                      {insights.conceptsEvaluated.map((c, idx) => (
                        <span key={idx} style={{ padding: '3px 8px', borderRadius: 4, background: 'rgba(168,85,247,0.12)', color: '#c084fc', fontSize: '0.78rem' }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={{ color: '#94a3b8', fontSize: '0.84rem' }}>
                    Typical Round: <strong style={{ color: '#f1f5f9' }}>{insights.typicalRound}</strong>
                  </div>
                </AccordionSection>
              )}

              {/* SECTION 8: 5 COMMON FOLLOW-UP QUESTIONS */}
              {followUps.length > 0 && (
                <AccordionSection title={`❓ 8. Common Interview Follow-Up Questions (${followUps.length})`} isOpen={openSections.followUps} onToggle={() => toggleSection('followUps')}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {followUps.map((fu, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 12 }}>
                        <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{idx + 1}. {fu.question}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{fu.rationale}</div>
                      </div>
                    ))}
                  </div>
                </AccordionSection>
              )}

              {/* SECTION 9: 5 SIMILAR QUESTIONS & STUDY ADVICE */}
              {similar.length > 0 && (
                <AccordionSection title={`🎯 9. Similar Questions & Study Advice (${similar.length})`} isOpen={openSections.similar} onToggle={() => toggleSection('similar')}>
                  {studyAdvice.whatToStudyNext && (
                    <div style={{ background: 'rgba(56,189,248,0.08)', borderLeft: '3px solid #38bdf8', padding: '10px 14px', borderRadius: '0 8px 8px 0', color: '#bae6fd', fontSize: '0.88rem', marginBottom: 16 }}>
                      <strong>What to study next:</strong> {studyAdvice.whatToStudyNext}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                    {similar.map((sq, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.88rem' }}>{sq.title}</span>
                          <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: 4, background: getDifficultyBg(sq.difficulty), color: getDifficultyColor(sq.difficulty) }}>{sq.difficulty}</span>
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>{sq.reason}</p>
                      </div>
                    ))}
                  </div>
                </AccordionSection>
              )}

              {/* SECTION 10: AVAILABLE TO PRACTICE BUTTONS */}
              <AccordionSection title="🌐 10. Available To Practice Platforms" isOpen={openSections.practice} onToggle={() => toggleSection('practice')}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {practicePlatforms.length > 0 ? (
                    practicePlatforms.map((p, idx) => (
                      <a
                        key={idx}
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '10px 20px',
                          background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(129,140,248,0.2))',
                          border: '1px solid rgba(56,189,248,0.4)',
                          borderRadius: 10,
                          color: '#38bdf8',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          textDecoration: 'none',
                        }}
                      >
                        {p.label || `Practice on ${p.platform}`} ↗
                      </a>
                    ))
                  ) : (
                    <a
                      href={passedQuestion.url || q.url || 'https://codeforces.com/problemset'}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(129,140,248,0.2))',
                        border: '1px solid rgba(56,189,248,0.4)',
                        borderRadius: 10,
                        color: '#38bdf8',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        textDecoration: 'none',
                      }}
                    >
                      Practice on Original Platform ↗
                    </a>
                  )}
                </div>
              </AccordionSection>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AccordionSection({ title, isOpen, onToggle, children }) {
  return (
    <div style={{ background: 'rgba(18,22,34,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, marginBottom: 20, overflow: 'hidden' }}>
      <div
        onClick={onToggle}
        style={{
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          cursor: 'pointer',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        <h3 style={{ color: '#f8fafc', fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>{title}</h3>
        <span style={{ color: '#94a3b8', fontSize: '1.1rem', fontWeight: 600 }}>{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && <div style={{ padding: '0 24px 24px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>{children}</div>}
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
