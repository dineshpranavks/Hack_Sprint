import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ResultsDashboard from '../components/ResultsDashboard';
import { useConversation } from '../hooks/useConversation';

export default function ResultsPage() {
  const navigate = useNavigate();
  const { fields, analysisResults, searchResults, resetConversation } = useConversation();

  return (
    <div className="page-root" style={{ background: '#0b0f19', minHeight: '100vh', color: '#f8fafc' }}>
      <Navbar />

      <div style={{ maxWidth: 1150, margin: '0 auto', padding: '32px 20px 80px' }} className="fade-in">
        {/* HEADER ACTIONS */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: '#cbd5e1',
              padding: '8px 16px',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ← Back to Chat Assistant
          </button>

          <button
            onClick={() => {
              resetConversation();
              navigate('/');
            }}
            style={{
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8,
              color: '#f87171',
              padding: '8px 16px',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Start New Session
          </button>
        </div>

        {/* RESULTS MODE DASHBOARD */}
        <ResultsDashboard
          profile={fields}
          analysis={analysisResults}
          questions={searchResults}
        />
      </div>
    </div>
  );
}
