import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ResultsDashboard from '../components/ResultsDashboard';
import { useAuth } from '../hooks/useAuth';
import { useConversation } from '../hooks/useConversation';

const SUGGESTIONS = [
  { icon: '🧠', label: 'Dynamic Programming', query: 'Dynamic Programming' },
  { icon: '🏢', label: 'Amazon SDE2',         query: 'Amazon SDE2' },
  { icon: '💻', label: 'Java Graph Problems', query: 'Java Graph Problems' },
  { icon: '📊', label: 'Sliding Window',      query: 'Sliding Window' },
  { icon: '💼', label: 'Google SDE1',         query: 'Google SDE1' },
  { icon: '🌲', label: 'Tree Problems',       query: 'Tree Problems' },
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
            AI Intent Extraction Engine Active
          </div>

          <h1>Your Interview Preparation<br />AI Co&#8209;Pilot</h1>

          <p className="hero-sub">
            Tell me your target company, role, language, or DSA topic.
            I will extract your intent and build your interview kit instantly.
          </p>

          {/* STATS OR CONVERSATION HISTORY */}
          {!hasHistory ? (
            <div className="stats-row fade-up-1">
              <div className="stat"><div className="stat-val">500+</div><div className="stat-lbl">Real Problems</div></div>
              <div className="stat-div" />
              <div className="stat"><div className="stat-val">50+</div><div className="stat-lbl">Top Companies</div></div>
              <div className="stat-div" />
              <div className="stat"><div className="stat-val">4</div><div className="stat-lbl">Tech Subjects</div></div>
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
                      <span>Extracting intent & generating interview preparation kit...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* EXTRACTED CRITERIA BAR */}
              <div className="extracted-criteria-bar">
                <span className="criteria-title">Extracted Criteria:</span>
                {fields.company && (
                  <span className="criteria-tag">🏢 Company: {fields.company}</span>
                )}
                {fields.role && (
                  <span className="criteria-tag">💼 Role: {fields.role}</span>
                )}
                {fields.experience && (
                  <span className="criteria-tag">📅 Experience: {fields.experience}</span>
                )}
                {fields.topics && fields.topics.length > 0 && (
                  <span className="criteria-tag">🧩 Topics: {fields.topics.join(', ')}</span>
                )}
                {fields.language && (
                  <span className="criteria-tag">💻 Language: {fields.language}</span>
                )}
                {fields.skills && fields.skills.length > 0 && (
                  <span className="criteria-tag">⚡ Skills: {fields.skills.join(', ')}</span>
                )}
              </div>

              {/* COMPLETED BANNER & RESULTS DASHBOARD */}
              {completed && (
                <div className="fade-in">
                  <div className="completed-badge-card" style={{ marginBottom: 20 }}>
                    <span>✅ Interview preparation kit generated successfully!</span>
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
              placeholder="Enter any interview prompt... e.g. 'Amazon', 'Sliding Window', 'Google SDE2', 'Java Graph Problems'"
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
              AI Intent Engine · Instant personalized DSA & Technical interview recommendations
            </p>
            {hasHistory && (
              <button
                className="reset-conv-btn"
                onClick={resetConversation}
                style={{ fontSize: '0.74rem', padding: '2px 8px' }}
              >
                Clear Session
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
