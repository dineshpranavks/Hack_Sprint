import { useNavigate } from 'react-router-dom';

/**
 * Results Mode Dashboard Component
 * AI Interview Architect: Pure Renderer of Backend AI-Ranked Recommendations
 */
export default function ResultsDashboard({ profile = {}, analysis = {}, questions = [] }) {
  const navigate = useNavigate();

  const safeProfile = profile || {};
  const safeAnalysis = analysis || {};

  const {
    summary = {},
    dsaTopics = [],
    technicalTopics = [],
    learningRoadmap = [],
    companyInsights = [],
  } = safeAnalysis;

  const displayDsaTopics = Array.isArray(dsaTopics) ? dsaTopics : [];
  const displayTechTopics = Array.isArray(technicalTopics) ? technicalTopics : [];

  const rawCompany = safeProfile.company || summary.company;
  const isGeneric = !rawCompany || rawCompany === 'Tech Company' || rawCompany === 'Target Tech Company';
  const displayCompany = isGeneric ? 'General Software Engineering' : rawCompany;

  const handleTopicCardClick = (topic) => {
    if (!topic || !topic.name) return;
    const topicSlug = topic.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    navigate(`/topic/${topicSlug}`);
  };

  const hasNoRecommendations = displayDsaTopics.length === 0 && displayTechTopics.length === 0;

  return (
    <div className="results-dashboard-root fade-in" style={{ marginTop: 20, paddingBottom: 64 }}>
      {/* HEADER BANNER */}
      <div
        className="dashboard-header-card"
        style={{
          background: 'linear-gradient(135deg, rgba(20,24,38,0.95), rgba(15,18,28,0.98))',
          border: '1px solid rgba(56,189,248,0.25)',
          borderRadius: 16,
          padding: '26px 30px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(12px)',
          marginBottom: 32,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 20, color: '#4ade80', fontSize: '0.78rem', fontWeight: 600, marginBottom: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
              AI Interview Architect Engine Active
            </div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
              Interview Preparation for <span style={{ color: '#38bdf8' }}>{displayCompany}</span>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.94rem', marginTop: 4, margin: 0 }}>
              {safeProfile.role || summary.role || 'Software Engineer'} {safeProfile.experience ? `· ${safeProfile.experience}` : ''}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 16px', textAlign: 'center' }}>
              <div style={{ color: '#38bdf8', fontSize: '1.25rem', fontWeight: 700 }}>{displayDsaTopics.length}</div>
              <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase' }}>DSA Topics</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 16px', textAlign: 'center' }}>
              <div style={{ color: '#a855f7', fontSize: '1.25rem', fontWeight: 700 }}>{displayTechTopics.length}</div>
              <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase' }}>Tech Subjects</div>
            </div>
          </div>
        </div>
      </div>

      {/* ERROR MESSAGE IF NO RECOMMENDATIONS */}
      {hasNoRecommendations ? (
        <div style={{ background: 'rgba(30,41,59,0.5)', border: '1px border-dashed rgba(255,255,255,0.1)', borderRadius: 16, padding: '48px 24px', textAlign: 'center', color: '#94a3b8' }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 12 }}>⚠️</span>
          <h3 style={{ color: '#f8fafc', fontSize: '1.2rem', fontWeight: 600, margin: '0 0 8px 0' }}>
            Unable to generate personalized recommendations.
          </h3>
          <p style={{ fontSize: '0.9rem', margin: 0, color: '#64748b' }}>
            Please try re-submitting your interview prompt or refining your criteria.
          </p>
        </div>
      ) : (
        <>
          {/* MAIN UNIFIED SECTION TITLE */}
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12, marginBottom: 28 }}>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Role-Specific Interview Preparation Plan
            </h3>
          </div>

          {/* SECTION 1: CODING INTERVIEW (DSA TOPICS) */}
          {displayDsaTopics.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.4rem' }}>🧩</span>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8', margin: 0 }}>
                    Coding Interview (Role-Tailored DSA)
                  </h4>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Click a topic to view coding questions ➔
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {displayDsaTopics.map((topic, idx) => {
                  const stars = renderStarRating(topic?.priorityRating || 5);
                  const rankTag = topic?.rankCategory || (topic?.priorityRating >= 5 ? 'Must Learn' : topic?.priorityRating >= 4 ? 'Important' : 'Optional');
                  const badge = getRankBadgeStyle(rankTag);

                  return (
                    <div
                      key={idx}
                      onClick={() => handleTopicCardClick(topic)}
                      style={{
                        background: 'rgba(18,22,34,0.85)',
                        border: '1px solid rgba(56,189,248,0.2)',
                        borderRadius: 14,
                        padding: 20,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#38bdf8';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(56,189,248,0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(56,189,248,0.2)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                        <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, background: badge.bg, border: badge.border, color: badge.color }}>
                          {rankTag}
                        </span>
                        <span style={{ color: '#facc15', fontSize: '0.85rem', letterSpacing: 1 }}>
                          {stars}
                        </span>
                      </div>

                      <h5 style={{ color: '#f8fafc', fontSize: '1.08rem', fontWeight: 700, margin: '0 0 8px 0' }}>
                        {topic?.name || 'DSA Topic'}
                      </h5>

                      <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: '0 0 14px 0', lineHeight: 1.4 }}>
                        {topic?.explanation || `Core DSA topic for ${displayCompany} interview preparation.`}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12 }}>
                        <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600 }}>
                          {topic?.questionCount || (topic?.questions ? topic.questions.length : 0)} Problems
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#4ade80', fontWeight: 600 }}>
                          Freq: {topic?.estimatedInterviewFrequency || 'High'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* SECTION 2: TECHNICAL INTERVIEW (ROLE-TAILORED SUBJECTS) */}
          {displayTechTopics.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.4rem' }}>💻</span>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#a855f7', margin: 0 }}>
                    Technical Interview (Role-Tailored Subjects)
                  </h4>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Click a subject to view technical questions ➔
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {displayTechTopics.map((topic, idx) => {
                  const stars = renderStarRating(topic?.priorityRating || 5);
                  const rankTag = topic?.rankCategory || (topic?.priorityRating >= 5 ? 'Must Learn' : topic?.priorityRating >= 4 ? 'Important' : 'Optional');
                  const badge = getRankBadgeStyle(rankTag);

                  return (
                    <div
                      key={idx}
                      onClick={() => handleTopicCardClick(topic)}
                      style={{
                        background: 'rgba(24,18,36,0.85)',
                        border: '1px solid rgba(168,85,247,0.25)',
                        borderRadius: 14,
                        padding: 20,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#a855f7';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(168,85,247,0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(168,85,247,0.25)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                        <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, background: badge.bg, border: badge.border, color: badge.color }}>
                          {rankTag}
                        </span>
                        <span style={{ color: '#facc15', fontSize: '0.85rem', letterSpacing: 1 }}>
                          {stars}
                        </span>
                      </div>

                      <h5 style={{ color: '#f8fafc', fontSize: '1.08rem', fontWeight: 700, margin: '0 0 8px 0' }}>
                        {topic?.name || 'Tech Subject'}
                      </h5>

                      <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: '0 0 14px 0', lineHeight: 1.4 }}>
                        {topic?.explanation || `Essential ${topic?.name || 'Technical'} conceptual questions for ${displayCompany} rounds.`}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12 }}>
                        <span style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: 600 }}>
                          {topic?.questionCount || (topic?.questions ? topic.questions.length : 0)} Questions
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#4ade80', fontWeight: 600 }}>
                          Freq: {topic?.estimatedInterviewFrequency || 'High'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* SECTION 3: LEARNING ROADMAP */}
          {Array.isArray(learningRoadmap) && learningRoadmap.length > 0 && (
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
                      {item?.step || idx + 1}
                    </div>
                    <h4 style={{ color: '#f8fafc', fontSize: '0.98rem', fontWeight: 600, margin: '0 0 6px 0' }}>{item?.title}</h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: 0, lineHeight: 1.4 }}>{item?.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SECTION 4: COMPANY INSIGHTS */}
          {Array.isArray(companyInsights) && companyInsights.length > 0 && (
            <section style={{ background: 'rgba(18,22,34,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: '1.2rem' }}>🏢</span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Interview Insights</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {companyInsights.map((ci, idx) => (
                  <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 12 }}>
                    <h5 style={{ color: '#a855f7', fontSize: '0.92rem', fontWeight: 600, margin: '0 0 4px 0' }}>{ci?.title}</h5>
                    <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0, lineHeight: 1.4 }}>{ci?.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function renderStarRating(rating = 5) {
  const count = Math.min(Math.max(Number(rating) || 5, 1), 5);
  return '★'.repeat(count) + '☆'.repeat(5 - count);
}

function getRankBadgeStyle(tag = 'Must Learn') {
  if (tag === 'Must Learn') {
    return { bg: 'rgba(239,68,68,0.14)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171' };
  }
  if (tag === 'Important') {
    return { bg: 'rgba(250,204,21,0.14)', border: '1px solid rgba(250,204,21,0.35)', color: '#facc15' };
  }
  return { bg: 'rgba(56,189,248,0.14)', border: '1px solid rgba(56,189,248,0.35)', color: '#38bdf8' };
}
