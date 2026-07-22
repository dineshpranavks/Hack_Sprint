import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/v1\/?$/, '') 
  : 'http://localhost:5000/api';

export default function QuestionCard({ question = {}, userId = 'guest' }) {
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(!!question.bookmarked);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const questionId = question.id || question.slug || (question.title ? question.title.toLowerCase().replace(/\s+/g, '-') : 'question');
  const title = question.title || 'Technical Coding Problem';
  const difficulty = question.difficulty || 'Medium';
  const topics = question.topics || question.tags || ['Data Structures', 'Algorithms'];
  const whyRecommended = question.reasonRecommended || question.whyRecommended || `Recommended based on target profile criteria and past interview trends.`;
  const frequency = question.estimatedInterviewFrequency || 'High';
  const studyTime = question.estimatedStudyTime || '30-45 mins';

  // Determine if item is a solvable coding problem
  const itemType = question.type || (question.source === 'codeforces' || question.isCodingProblem !== false ? 'Coding Problem' : 'Resource');
  const isCodingProblem = itemType === 'Coding Problem' || question.isCodingProblem === true || question.source === 'codeforces';

  const handleToggleBookmark = async (e) => {
    e.stopPropagation();
    try {
      setBookmarkLoading(true);
      const res = await axios.post(`${API_BASE_URL}/user/bookmark`, {
        userId,
        questionId,
        questionData: question,
      });
      if (res.data?.bookmarked !== undefined) {
        setIsBookmarked(res.data.bookmarked);
      } else {
        setIsBookmarked((prev) => !prev);
      }
    } catch (err) {
      console.warn('[Bookmark toggle note]:', err.message);
      setIsBookmarked((prev) => !prev);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleViewDetails = () => {
    if (!isCodingProblem) {
      if (question.url) {
        window.open(question.url, '_blank');
      }
      return;
    }

    navigate(`/question/${encodeURIComponent(questionId)}`, {
      state: { questionData: question },
    });
  };

  return (
    <div
      className="question-card fade-in"
      style={{
        background: 'rgba(18,22,34,0.85)',
        border: isCodingProblem ? '1px solid rgba(56,189,248,0.2)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s ease, border-color 0.2s ease',
        position: 'relative',
      }}
    >
      <div>
        {/* TOP ROW: DIFFICULTY & ITEM TYPE BADGE & BOOKMARK TOGGLE */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span
              style={{
                padding: '3px 10px',
                borderRadius: 6,
                fontSize: '0.74rem',
                fontWeight: 600,
                background: getDifficultyBg(difficulty),
                color: getDifficultyColor(difficulty),
              }}
            >
              {difficulty}
            </span>

            <span
              style={{
                padding: '3px 8px',
                borderRadius: 6,
                fontSize: '0.72rem',
                fontWeight: 600,
                background: isCodingProblem ? 'rgba(34,197,94,0.15)' : 'rgba(148,163,184,0.15)',
                color: isCodingProblem ? '#4ade80' : '#cbd5e1',
              }}
            >
              {isCodingProblem ? '🧩 Coding Problem' : `📄 ${itemType}`}
            </span>
          </div>

          <button
            onClick={handleToggleBookmark}
            disabled={bookmarkLoading}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem',
              color: isBookmarked ? '#f59e0b' : '#64748b',
              padding: 4,
              transition: 'color 0.2s',
            }}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Question'}
          >
            {isBookmarked ? '★' : '☆'}
          </button>
        </div>

        {/* TITLE */}
        <h4
          onClick={handleViewDetails}
          style={{
            color: '#f8fafc',
            fontSize: '1.08rem',
            fontWeight: 600,
            margin: '0 0 10px 0',
            lineHeight: 1.35,
            cursor: 'pointer',
          }}
        >
          {title}
        </h4>

        {/* TOPIC CHIPS */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {topics.slice(0, 4).map((t, idx) => (
            <span
              key={idx}
              style={{
                padding: '2px 8px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 4,
                color: '#94a3b8',
                fontSize: '0.74rem',
              }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* WHY RECOMMENDED */}
        <div
          style={{
            background: isCodingProblem ? 'rgba(56,189,248,0.08)' : 'rgba(255,255,255,0.03)',
            borderLeft: isCodingProblem ? '3px solid #38bdf8' : '3px solid #64748b',
            padding: '8px 10px',
            borderRadius: '0 6px 6px 0',
            color: isCodingProblem ? '#bae6fd' : '#cbd5e1',
            fontSize: '0.8rem',
            marginBottom: 14,
            lineHeight: 1.4,
          }}
        >
          <strong>Why Recommended:</strong> {whyRecommended}
        </div>
      </div>

      {/* FOOTER METRICS & BUTTONS */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            color: '#64748b',
            fontSize: '0.78rem',
            marginBottom: 14,
            borderTop: '1px solid rgba(255,255,255,0.05)',
            paddingTop: 10,
          }}
        >
          <span>Interview Freq: <strong style={{ color: '#cbd5e1' }}>{frequency}</strong></span>
          <span>Study Time: <strong style={{ color: '#cbd5e1' }}>{studyTime}</strong></span>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: 'flex', gap: 8 }}>
          {isCodingProblem ? (
            <button
              onClick={handleViewDetails}
              style={{
                flex: 1,
                padding: '9px 14px',
                background: '#38bdf8',
                color: '#0f172a',
                border: 'none',
                borderRadius: 8,
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              View Details
            </button>
          ) : (
            <a
              href={question.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '9px 14px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                color: '#cbd5e1',
                fontSize: '0.84rem',
                fontWeight: 600,
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              Open Resource ↗
            </a>
          )}

          {isCodingProblem && question.url && (
            <a
              href={question.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '9px 12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#e2e8f0',
                fontSize: '0.8rem',
                fontWeight: 500,
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              Practice on Platform ↗
            </a>
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
