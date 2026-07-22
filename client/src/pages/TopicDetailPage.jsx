import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import QuestionCard from '../components/QuestionCard';
import { useConversation } from '../hooks/useConversation';

const FALLBACK_TOPIC_PROBLEMS = {
  'object-oriented-programming': [
    {
      id: 'what-is-polymorphism',
      title: 'What is Polymorphism? Explain Compile-Time vs Runtime Polymorphism',
      difficulty: 'Easy',
      source: 'technical',
      isCodingProblem: true,
      topics: ['Object Oriented Programming', 'OOP', 'Polymorphism'],
      reasonRecommended: 'Core OOP concept tested in almost every technical interview.',
      estimatedInterviewFrequency: 'Very High',
      estimatedStudyTime: '25 mins',
    },
    {
      id: 'abstraction-vs-encapsulation',
      title: 'Difference Between Abstraction and Encapsulation with Examples',
      difficulty: 'Easy',
      source: 'technical',
      isCodingProblem: true,
      topics: ['Object Oriented Programming', 'OOP', 'Encapsulation'],
      reasonRecommended: 'Fundamental architectural distinction required for OOP design rounds.',
      estimatedInterviewFrequency: 'Very High',
      estimatedStudyTime: '20 mins',
    },
    {
      id: 'solid-principles-explained',
      title: 'Explain SOLID Principles with Real-World System Examples',
      difficulty: 'Medium',
      source: 'technical',
      isCodingProblem: true,
      topics: ['Object Oriented Programming', 'SOLID', 'Design Patterns'],
      reasonRecommended: 'Crucial for mid/senior level software engineering interviews.',
      estimatedInterviewFrequency: 'Very High',
      estimatedStudyTime: '45 mins',
    },
    {
      id: 'virtual-functions-cplusplus',
      title: 'How Virtual Functions and VTABLE Work under the Hood in C++',
      difficulty: 'Hard',
      source: 'technical',
      isCodingProblem: true,
      topics: ['Object Oriented Programming', 'Virtual Functions', 'VTABLE'],
      reasonRecommended: 'High-frequency low-level OOP question for Backend & Systems roles.',
      estimatedInterviewFrequency: 'High',
      estimatedStudyTime: '40 mins',
    },
    {
      id: 'diamond-problem-multiple-inheritance',
      title: 'What is the Diamond Problem in Multiple Inheritance and How to Resolve It?',
      difficulty: 'Medium',
      source: 'technical',
      isCodingProblem: true,
      topics: ['Object Oriented Programming', 'Inheritance'],
      reasonRecommended: 'Tests understanding of class hierarchy resolution and interface design.',
      estimatedInterviewFrequency: 'High',
      estimatedStudyTime: '30 mins',
    },
  ],
  'database-management-systems': [
    {
      id: 'dbms-normalization-forms',
      title: 'Database Normalization: 1NF, 2NF, 3NF, and BCNF Explained',
      difficulty: 'Medium',
      source: 'technical',
      isCodingProblem: true,
      topics: ['Database Management Systems', 'DBMS', 'SQL'],
      reasonRecommended: 'Essential database design theory asked in all backend rounds.',
      estimatedInterviewFrequency: 'Very High',
      estimatedStudyTime: '35 mins',
    },
    {
      id: 'acid-properties-transactions',
      title: 'Explain ACID Properties in DBMS with Real-World Transaction Examples',
      difficulty: 'Easy',
      source: 'technical',
      isCodingProblem: true,
      topics: ['Database Management Systems', 'ACID', 'Transactions'],
      reasonRecommended: 'Core database transaction reliability principles.',
      estimatedInterviewFrequency: 'Very High',
      estimatedStudyTime: '25 mins',
    },
    {
      id: 'dbms-b-tree-indexing',
      title: 'How B-Tree & B+ Tree Database Indexing Works to Optimize Queries',
      difficulty: 'Hard',
      source: 'technical',
      isCodingProblem: true,
      topics: ['Database Management Systems', 'Indexing', 'B-Trees'],
      reasonRecommended: 'Crucial for database performance tuning & query optimization rounds.',
      estimatedInterviewFrequency: 'High',
      estimatedStudyTime: '45 mins',
    },
    {
      id: 'transaction-isolation-levels',
      title: 'Transaction Isolation Levels and Concurrency Anomalies (Dirty Reads, Phantom Reads)',
      difficulty: 'Hard',
      source: 'technical',
      isCodingProblem: true,
      topics: ['Database Management Systems', 'Concurrency', 'Transactions'],
      reasonRecommended: 'Tested in distributed systems and high-throughput backend interviews.',
      estimatedInterviewFrequency: 'High',
      estimatedStudyTime: '50 mins',
    },
    {
      id: 'sql-joins-inner-left-right-outer',
      title: 'Explain SQL Joins: Inner, Left, Right, and Full Outer Joins with Examples',
      difficulty: 'Easy',
      source: 'technical',
      isCodingProblem: true,
      topics: ['Database Management Systems', 'SQL', 'Joins'],
      reasonRecommended: 'Standard SQL query writing question for engineering candidates.',
      estimatedInterviewFrequency: 'Very High',
      estimatedStudyTime: '20 mins',
    },
  ],
  'operating-systems': [
    {
      id: 'process-vs-thread',
      title: 'Process vs Thread: Memory Management, Context Switching, and Overhead',
      difficulty: 'Easy',
      source: 'technical',
      isCodingProblem: true,
      topics: ['Operating Systems', 'OS', 'Concurrency'],
      reasonRecommended: 'Most popular operating systems question in technical interviews.',
      estimatedInterviewFrequency: 'Very High',
      estimatedStudyTime: '25 mins',
    },
    {
      id: 'deadlock-conditions-avoidance',
      title: 'What is a Deadlock? 4 Necessary Conditions and Banker\'s Algorithm',
      difficulty: 'Medium',
      source: 'technical',
      isCodingProblem: true,
      topics: ['Operating Systems', 'Deadlock', 'Concurrency'],
      reasonRecommended: 'Standard OS concurrency management question.',
      estimatedInterviewFrequency: 'Very High',
      estimatedStudyTime: '35 mins',
    },
    {
      id: 'mutex-vs-semaphore',
      title: 'Difference Between Mutex and Semaphore (Counting vs Binary Semaphore)',
      difficulty: 'Medium',
      source: 'technical',
      isCodingProblem: true,
      topics: ['Operating Systems', 'Synchronization', 'Mutex'],
      reasonRecommended: 'Tests multi-threading synchronization mechanics.',
      estimatedInterviewFrequency: 'High',
      estimatedStudyTime: '30 mins',
    },
    {
      id: 'virtual-memory-paging-segmentation',
      title: 'Virtual Memory, Paging, Page Faults, and Segmentation Explained',
      difficulty: 'Hard',
      source: 'technical',
      isCodingProblem: true,
      topics: ['Operating Systems', 'Memory Management', 'Paging'],
      reasonRecommended: 'Evaluates physical vs virtual memory address translation.',
      estimatedInterviewFrequency: 'High',
      estimatedStudyTime: '45 mins',
    },
  ],
  'computer-networks': [
    {
      id: 'osi-model-7-layers',
      title: 'Explain the 7 Layers of OSI Model and Their Protocol Functions',
      difficulty: 'Easy',
      source: 'technical',
      isCodingProblem: true,
      topics: ['Computer Networks', 'OSI Model', 'Networking'],
      reasonRecommended: 'Foundational networking model asked in initial technical screenings.',
      estimatedInterviewFrequency: 'Very High',
      estimatedStudyTime: '25 mins',
    },
    {
      id: 'tcp-vs-udp-protocol-comparison',
      title: 'TCP vs UDP: 3-Way Handshake, Reliability, Header Size, and Use Cases',
      difficulty: 'Easy',
      source: 'technical',
      isCodingProblem: true,
      topics: ['Computer Networks', 'TCP', 'UDP'],
      reasonRecommended: 'Core transport layer comparison question.',
      estimatedInterviewFrequency: 'Very High',
      estimatedStudyTime: '25 mins',
    },
    {
      id: 'http-vs-https-tls-handshake',
      title: 'HTTP vs HTTPS: SSL/TLS Handshake, Encryption, and Certificates',
      difficulty: 'Medium',
      source: 'technical',
      isCodingProblem: true,
      topics: ['Computer Networks', 'HTTP', 'Security'],
      reasonRecommended: 'Critical web network security question for backend & full-stack roles.',
      estimatedInterviewFrequency: 'High',
      estimatedStudyTime: '35 mins',
    },
    {
      id: 'dns-resolution-process',
      title: 'What Happens Step-by-Step When You Type a URL in Browser (DNS Resolution)?',
      difficulty: 'Medium',
      source: 'technical',
      isCodingProblem: true,
      topics: ['Computer Networks', 'DNS', 'Web Architecture'],
      reasonRecommended: 'Classic end-to-end web request lifecycle question.',
      estimatedInterviewFrequency: 'Very High',
      estimatedStudyTime: '35 mins',
    },
  ],
  'dynamic-programming': [
    {
      id: 'cut-ribbon',
      title: 'Cut Ribbon (Unbounded Knapsack / DP)',
      difficulty: 'Medium',
      source: 'codeforces',
      topics: ['Dynamic Programming', 'Knapsack'],
      url: 'https://codeforces.com/problemset/problem/189/A',
      reasonRecommended: 'Classic DP optimization problem frequently tested in technical rounds.',
      estimatedInterviewFrequency: 'Very High',
      estimatedStudyTime: '45 mins',
    },
    {
      id: 'water-overflow',
      title: 'Water Overflow & DP State Transitions',
      difficulty: 'Medium',
      source: 'codeforces',
      topics: ['Dynamic Programming', 'State Space'],
      url: 'https://codeforces.com/problemset',
      reasonRecommended: 'Evaluates DP recurrence relations and state table updates.',
      estimatedInterviewFrequency: 'High',
      estimatedStudyTime: '40 mins',
    },
    {
      id: 'k-tree',
      title: 'k-Tree (Tree Path Counting DP)',
      difficulty: 'Medium',
      source: 'codeforces',
      topics: ['Dynamic Programming', 'Trees'],
      url: 'https://codeforces.com/problemset/problem/431/C',
      reasonRecommended: 'Combines tree traversal with DP state transitions.',
      estimatedInterviewFrequency: 'High',
      estimatedStudyTime: '45 mins',
    },
  ],
};

export default function TopicDetailPage() {
  const { topicSlug } = useParams();
  const navigate = useNavigate();
  const { analysisResults, searchResults, fields } = useConversation();

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

    const found = allTopics.find((t) => {
      const nameSlug = t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return nameSlug === formattedSlug || t.name.toLowerCase().includes(rawSlug.replace(/-/g, ' '));
    });

    const matchingFromSearch = (searchResults || []).filter((q) => {
      const text = `${q.title} ${(q.topics || []).join(' ')} ${(q.tags || []).join(' ')} ${q.subject || ''}`.toLowerCase();
      return text.includes(rawSlug.replace(/-/g, ' '));
    });

    let catalogFallback = [];
    if (formattedSlug.includes('object') || formattedSlug.includes('oop')) {
      catalogFallback = FALLBACK_TOPIC_PROBLEMS['object-oriented-programming'];
    } else if (formattedSlug.includes('database') || formattedSlug.includes('dbms')) {
      catalogFallback = FALLBACK_TOPIC_PROBLEMS['database-management-systems'];
    } else if (formattedSlug.includes('operating') || formattedSlug.includes('os')) {
      catalogFallback = FALLBACK_TOPIC_PROBLEMS['operating-systems'];
    } else if (formattedSlug.includes('network')) {
      catalogFallback = FALLBACK_TOPIC_PROBLEMS['computer-networks'];
    } else {
      catalogFallback = FALLBACK_TOPIC_PROBLEMS['dynamic-programming'];
    }

    const mergedQuestions = [
      ...(found?.questions || []),
      ...matchingFromSearch,
      ...catalogFallback,
    ];

    const seen = new Set();
    const uniqueQuestions = mergedQuestions.filter((q) => {
      const key = (q.id || q.title || '').toLowerCase().trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const readableName = found?.name || (topicSlug ? topicSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Technical Subject');

    setTopicObj({
      name: readableName,
      priorityRating: found?.priorityRating || 5,
      explanation: found?.explanation || `Essential ${readableName} questions for ${fields?.company || 'Tech'} interview preparation.`,
      questionCount: uniqueQuestions.length,
      estimatedInterviewFrequency: found?.estimatedInterviewFrequency || 'Very High',
      questions: uniqueQuestions,
    });
  }, [topicSlug, analysisResults, searchResults, fields]);

  if (!topicObj) {
    return (
      <div className="page-root">
        <Navbar />
        <div style={{ maxWidth: 1000, margin: '60px auto', textAlign: 'center', color: '#94a3b8' }}>
          <h2>Loading Technical Subject Details...</h2>
        </div>
      </div>
    );
  }

  const questions = topicObj.questions || [];
  const easyQuestions = questions.filter(q => (q.difficulty || '').toLowerCase() === 'easy');
  const mediumQuestions = questions.filter(q => (q.difficulty || '').toLowerCase() === 'medium' || !q.difficulty);
  const hardQuestions = questions.filter(q => (q.difficulty || '').toLowerCase() === 'hard');

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
              <div style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.95rem' }}>{fields?.company || 'Tech Company'}</div>
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
            <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Interview Frequency</span>
              <div style={{ color: '#facc15', fontWeight: 700, fontSize: '0.95rem' }}>{topicObj.estimatedInterviewFrequency || 'Very High'}</div>
            </div>
          </div>
        </div>

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
      </div>
    </div>
  );
}

function renderStarRating(rating = 5) {
  const count = Math.min(Math.max(rating, 1), 5);
  return '★'.repeat(count) + '☆'.repeat(5 - count);
}
