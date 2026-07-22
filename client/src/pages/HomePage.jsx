import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ResultsDashboard from '../components/ResultsDashboard';
import { useAuth } from '../hooks/useAuth';
import { useConversation } from '../hooks/useConversation';

const SUGGESTIONS = [
  { icon: '🧠', label: 'Dynamic Programming', query: 'dynamic programming' },
  { icon: '🏢', label: 'Google Questions',    query: 'google' },
  { icon: '🔥', label: 'Hard Problems',       query: 'hard' },
  { icon: '📊', label: 'Arrays & Two Pointer',query: 'array' },
  { icon: '💼', label: 'Amazon SDE Prep',     query: 'amazon' },
  { icon: '🌲', label: 'Tree Problems',       query: 'tree' },
];

export default function HomePage() {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const {
    chatHistory,
    fields,
    completed,
    analysisResults,
    searchResults,
    loading,
    sendMessage,
    resetConversation,
  } = useConversation();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  useEffect(() => {
    if (completed) {
      navigate('/results');
    }
  }, [completed, navigate]);

  const handleSearch = async (overrideQuery) => {
    const q = (typeof overrideQuery === 'string' ? overrideQuery : query).trim();
    if (!q || loading) return;

    if (!user) {
      navigate('/login', {
        state: {
          from: {
            pathname: '/',
            search: `?prompt=${encodeURIComponent(q)}`
          }
        }
      });
      return;
    }

    setQuery('');
    const res = await sendMessage(q);
    if (res?.completed) {
      navigate('/results');
    }
  };

  const fillSearch = (q) => {
    setQuery(q);
    inputRef.current?.focus();
  };

  const hasHistory = chatHistory.length > 0;

  return (
    <div className="page-root">
      <Navbar />

      {/* CENTER HERO */}
      <div className="home-stage grid-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        <div className="hero fade-up" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            AI Agent Active
          </div>

          <h1>Your Coding Interview<br />AI Co&#8209;Pilot</h1>

          <p className="hero-sub">
            Chat naturally — tell me your target company, role, or experience level.
            I will understand your intent and collect everything required.
          </p>

          {/* STATS OR CONVERSATION HISTORY */}
          {!hasHistory ? (
            <div className="stats-row fade-up-1">
              <div className="stat"><div className="stat-val">500+</div><div className="stat-lbl">Real Problems</div></div>
              <div className="stat-div" />
              <div className="stat"><div className="stat-val">50+</div><div className="stat-lbl">Top Companies</div></div>
              <div className="stat-div" />
              <div className="stat"><div className="stat-val">3</div><div className="stat-lbl">Platforms</div></div>
            </div>
          ) : (
            <div className="ai-assistant-wrapper fade-in">
              {/* CHAT MESSAGES STREAM */}
              <div className="ai-chat-card">
                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`ai-chat-bubble ${
                      msg.role === 'user' ? 'ai-bubble-user' : 'ai-bubble-assistant'
                    }`}
                  >
                    <div className="bubble-sender">
                      {msg.role === 'user' ? 'You' : 'AI Assistant'}
                    </div>
                    <div className="bubble-content">{msg.content}</div>
                  </div>
                ))}

                {loading && (
                  <div className="ai-chat-bubble ai-bubble-assistant">
                    <div className="bubble-sender">AI Assistant</div>
                    <div className="bubble-content" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="btn-spinner" style={{ width: 14, height: 14 }} />
                      <span>Thinking & executing master workflow...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* EXTRACTED FIELDS BAR */}
              <div className="extracted-criteria-bar">
                <span className="criteria-title">Collected Criteria:</span>
                <span className={`criteria-tag ${!fields.company ? 'criteria-tag--missing' : ''}`}>
                  🏢 Company: {fields.company || 'Missing'}
                </span>
                <span className={`criteria-tag ${!fields.role ? 'criteria-tag--missing' : ''}`}>
                  💼 Role: {fields.role || 'Missing'}
                </span>
                <span className={`criteria-tag ${!fields.experience ? 'criteria-tag--missing' : ''}`}>
                  📅 Experience: {fields.experience || 'Missing'}
                </span>

                {fields.skills && fields.skills.length > 0 && (
                  <span className="criteria-tag">
                    ⚡ Skills: {fields.skills.join(', ')}
                  </span>
                )}
                {fields.interviewTypes && fields.interviewTypes.length > 0 && (
                  <span className="criteria-tag">
                    🎯 Rounds: {fields.interviewTypes.join(', ')}
                  </span>
                )}
              </div>

              {/* COMPLETED BANNER & RESULTS DASHBOARD */}
              {completed && (
                <div className="fade-in">
                  <div className="completed-badge-card" style={{ marginBottom: 20 }}>
                    <span>✅ All required information collected! Session status updated to <strong>completed</strong>.</span>
                    <button className="reset-conv-btn" onClick={resetConversation}>
                      New Session
                    </button>
                  </div>

                  {/* RESULTS MODE DASHBOARD */}
                  <ResultsDashboard
                    profile={fields}
                    analysis={analysisResults}
                    questions={searchResults}
                  />
                </div>
              )}
            </div>
          )}

          {/* SUGGESTION CHIPS */}
          {!completed && (
            <div className="suggestions fade-up-2" style={{ marginTop: hasHistory ? 16 : 28 }}>
              {SUGGESTIONS.map(s => (
                <button key={s.query} className="suggestion-chip" onClick={() => fillSearch(s.query)}>
                  <span className="chip-icon">{s.icon}</span>{s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM SEARCH BAR */}
      <div className="home-search-bar fade-up-3">
        <div className="home-search-inner">
          <div className={`search-box ${loading ? 'search-box--loading' : ''}`}>
            <span className="sb-icon">💬</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Tell me your interview target... e.g. 'Amazon backend engineer with 2 yrs experience'"
              disabled={loading}
            />
            <button
              className="send-btn"
              onClick={() => handleSearch()}
              disabled={!query.trim() || loading}
              aria-label="Send message"
            >
              {loading ? <span className="btn-spinner" /> : <span>↑</span>}
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
            <p className="search-hint" style={{ margin: 0 }}>
              AI Master Orchestrator · Single request executes Conversation ➔ Queries ➔ Multi-Source Search ➔ AI Analysis
            </p>
            {hasHistory && (
              <button
                className="reset-conv-btn"
                onClick={resetConversation}
                style={{ fontSize: '0.74rem', padding: '2px 8px' }}
              >
                Clear History
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
