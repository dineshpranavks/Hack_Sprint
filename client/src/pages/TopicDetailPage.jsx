import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import QuestionCard from '../components/QuestionCard';
import { useConversation } from '../hooks/useConversation';

export default function TopicDetailPage() {
  const { topicSlug } = useParams();
  const { analysisResults, fields } = useConversation();

  const [topicObj, setTopicObj] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const allTopics = [
      ...(analysisResults?.dsaTopics || []),
      ...(analysisResults?.technicalTopics || []),
      ...(analysisResults?.topics || []),
    ];

    const rawSlug = (topicSlug || '').toLowerCase();
    const formattedSlug = rawSlug.replace(/[^a-z0-9]+/g, '-');

    // Find exact topic directly from backend analysisResults
    const found = allTopics.find((t) => {
      const nameSlug = (t.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return nameSlug === formattedSlug || (t.name || '').toLowerCase().includes(rawSlug.replace(/-/g, ' '));
    });

    if (found) {
      setTopicObj(found);
    } else {
      const readableName = topicSlug
        ? topicSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
        : 'Topic';
      
      setTopicObj({
        name: readableName,
        priorityRating: 5,
        explanation: `Topic overview for ${fields?.company || 'General Software Engineering'}.`,
        questionCount: 0,
        estimatedInterviewFrequency: 'High',
        questions: [],
      });
    }
  }, [topicSlug, analysisResults, fields]);

  if (!topicObj) {
    return (
      <div className="page-root">
        <Navbar />
        <div style={{ maxWidth: 1000, margin: '60px auto', textAlign: 'center', color: '#94a3b8' }}>
          <h2>Loading Topic Details...</h2>
        </div>
      </div>
    );
  }

  const questions = topicObj.questions || [];
  const easyQuestions = questions.filter((q) => (q.difficulty || '').toLowerCase() === 'easy');
  const mediumQuestions = questions.filter((q) => (q.difficulty || '').toLowerCase() === 'medium' || !q.difficulty);
  const hardQuestions = questions.filter((q) => (q.difficulty || '').toLowerCase() === 'hard');

  return (
    <div className="page-root" style={{ background: '#0b0f19', minHeight: '100vh', color: '#f8fafc' }}>
      <Navbar />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 80px' }} className="fade-in">
        {/* BACK BUTTON */}
        <Link
          to="/results"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: '#38bdf8',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 600,
            marginBottom: 24,
            padding: '8px 16px',
            background: 'rgba(56,189,248,0.1)',
            border: '1px solid rgba(56,189,248,0.2)',
            borderRadius: 8,
            transition: 'all 0.2s ease',
          }}
        >
          ← Back to All Topics
        </Link>

        {/* TOPIC HEADER CARD */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(20,26,42,0.95), rgba(15,20,32,0.98))',
            border: '1px solid rgba(168,85,247,0.3)',
            borderRadius: 16,
            padding: '28px 32px',
            marginBottom: 32,
            boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 12 }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#c084fc', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                Interview Module
              </span>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', margin: '4px 0 0 0' }}>
                {topicObj.name}
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: 'rgba(250,204,21,0.12)', border: '1px solid rgba(250,204,21,0.3)', padding: '6px 14px', borderRadius: 20, color: '#facc15', fontSize: '1rem', fontWeight: 700 }}>
                {renderStarRating(topicObj.priorityRating || 5)}
              </div>
            </div>
          </div>

          <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.6, margin: '0 0 20px 0', maxWidth: 850 }}>
            {topicObj.explanation}
          </p>

          <div style={{ display: 'flex', gap: 20, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16, flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Target Company</span>
              <div style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.95rem' }}>{fields?.company || 'General Software Engineering'}</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Target Role</span>
              <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.95rem' }}>{fields?.role || 'Software Engineer'}</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Total Questions</span>
              <div style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.95rem' }}>{questions.length} Questions</div>
            </div>
          </div>
        </div>

        {/* NO QUESTIONS FOUND MESSAGE */}
        {questions.length === 0 ? (
          <div style={{ background: 'rgba(30,41,59,0.5)', border: '1px border-dashed rgba(255,255,255,0.1)', borderRadius: 16, padding: '48px 24px', textAlign: 'center', color: '#94a3b8' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 12 }}>🔍</span>
            <h3 style={{ color: '#f8fafc', fontSize: '1.2rem', fontWeight: 600, margin: '0 0 8px 0' }}>
              No questions found for this topic.
            </h3>
            <p style={{ fontSize: '0.9rem', margin: 0, color: '#64748b' }}>
              No specific questions were returned from the backend search engine for this topic module.
            </p>
          </div>
        ) : (
          <>
            {/* EASY SECTION */}
            {easyQuestions.length > 0 && (
              <section style={{ marginBottom: 36 }}>
                <h3 style={{ color: '#4ade80', fontSize: '1.2rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🟢</span> Easy Questions ({easyQuestions.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                  {easyQuestions.map((q, idx) => (
                    <QuestionCard key={idx} question={{ ...q, isCodingProblem: true }} />
                  ))}
                </div>
              </section>
            )}

            {/* MEDIUM SECTION */}
            {mediumQuestions.length > 0 && (
              <section style={{ marginBottom: 36 }}>
                <h3 style={{ color: '#facc15', fontSize: '1.2rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🟡</span> Medium Questions ({mediumQuestions.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                  {mediumQuestions.map((q, idx) => (
                    <QuestionCard key={idx} question={{ ...q, isCodingProblem: true }} />
                  ))}
                </div>
              </section>
            )}

            {/* HARD SECTION */}
            {hardQuestions.length > 0 && (
              <section style={{ marginBottom: 36 }}>
                <h3 style={{ color: '#f87171', fontSize: '1.2rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🔴</span> Hard Questions ({hardQuestions.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                  {hardQuestions.map((q, idx) => (
                    <QuestionCard key={idx} question={{ ...q, isCodingProblem: true }} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function renderStarRating(rating = 5) {
  const count = Math.min(Math.max(Number(rating) || 5, 1), 5);
  return '★'.repeat(count) + '☆'.repeat(5 - count);
}
