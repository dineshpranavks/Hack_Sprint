import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import QuestionCard from '../components/QuestionCard';
import { useConversation } from '../hooks/useConversation';

const FALLBACK_TOPIC_PROBLEMS = {
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
    {
      id: 'dice-combinations',
      title: 'Dice Combinations / Coin Change DP',
      difficulty: 'Easy',
      source: 'codeforces',
      topics: ['Dynamic Programming', 'Combinatorics'],
      url: 'https://codeforces.com/problemset',
      reasonRecommended: 'Fundamental 1D DP memoization problem.',
      estimatedInterviewFrequency: 'Very High',
      estimatedStudyTime: '30 mins',
    },
    {
      id: 'maximum-subarray-sum',
      title: 'Maximum Subarray Sum (Kadane DP)',
      difficulty: 'Easy',
      source: 'codeforces',
      topics: ['Dynamic Programming', 'Arrays'],
      url: 'https://codeforces.com/problemset',
      reasonRecommended: 'Standard linear DP algorithm required for initial phone screens.',
      estimatedInterviewFrequency: 'High',
      estimatedStudyTime: '25 mins',
    },
    {
      id: 'edit-distance-dp',
      title: 'Edit Distance (String Alignment DP)',
      difficulty: 'Hard',
      source: 'codeforces',
      topics: ['Dynamic Programming', 'Strings'],
      url: 'https://codeforces.com/problemset',
      reasonRecommended: '2D matrix DP problem asked in senior engineering loops.',
      estimatedInterviewFrequency: 'High',
      estimatedStudyTime: '60 mins',
    },
  ],
  'graphs': [
    {
      id: 'lunar-new-year-and-a-wander',
      title: 'Lunar New Year and a Wander (Priority Graph Traversal)',
      difficulty: 'Medium',
      source: 'codeforces',
      topics: ['Graphs', 'BFS/DFS', 'Priority Queue'],
      url: 'https://codeforces.com/problemset/problem/1106/D',
      reasonRecommended: 'Combines min-heap priority queue with BFS graph traversal.',
      estimatedInterviewFrequency: 'Very High',
      estimatedStudyTime: '45 mins',
    },
    {
      id: 'two-buttons',
      title: 'Two Buttons (State Space Shortest Path BFS)',
      difficulty: 'Medium',
      source: 'codeforces',
      topics: ['Graphs', 'BFS'],
      url: 'https://codeforces.com/problemset/problem/520/B',
      reasonRecommended: 'Classic state transformation shortest path search.',
      estimatedInterviewFrequency: 'High',
      estimatedStudyTime: '35 mins',
    },
    {
      id: 'keys-and-rooms',
      title: 'Keys and Rooms (Connected Components DFS)',
      difficulty: 'Easy',
      source: 'codeforces',
      topics: ['Graphs', 'DFS'],
      url: 'https://codeforces.com/problemset',
      reasonRecommended: 'Foundational graph reachability problem.',
      estimatedInterviewFrequency: 'High',
      estimatedStudyTime: '25 mins',
    },
    {
      id: 'network-delay-time',
      title: 'Network Delay Time (Dijkstra Algorithm)',
      difficulty: 'Medium',
      source: 'codeforces',
      topics: ['Graphs', 'Dijkstra', 'Shortest Path'],
      url: 'https://codeforces.com/problemset',
      reasonRecommended: 'Essential weighted graph shortest path algorithm.',
      estimatedInterviewFrequency: 'Very High',
      estimatedStudyTime: '50 mins',
    },
    {
      id: 'word-ladder',
      title: 'Word Ladder (Shortest Transformation Graph BFS)',
      difficulty: 'Hard',
      source: 'codeforces',
      topics: ['Graphs', 'BFS', 'Strings'],
      url: 'https://codeforces.com/problemset',
      reasonRecommended: 'Bidirectional BFS graph traversal problem.',
      estimatedInterviewFrequency: 'High',
      estimatedStudyTime: '60 mins',
    },
  ],
  'trees': [
    {
      id: 'binary-tree-inorder',
      title: 'Binary Tree Inorder Traversal',
      difficulty: 'Easy',
      source: 'codeforces',
      topics: ['Trees', 'Traversal'],
      url: 'https://codeforces.com/problemset',
      reasonRecommended: 'Core tree recursion and stack traversal problem.',
      estimatedInterviewFrequency: 'Very High',
      estimatedStudyTime: '20 mins',
    },
    {
      id: 'k-tree',
      title: 'k-Tree (Tree DP & Recursive Traversal)',
      difficulty: 'Medium',
      source: 'codeforces',
      topics: ['Trees', 'DP'],
      url: 'https://codeforces.com/problemset/problem/431/C',
      reasonRecommended: 'Tree path construction and recursion state tracking.',
      estimatedInterviewFrequency: 'High',
      estimatedStudyTime: '40 mins',
    },
    {
      id: 'lowest-common-ancestor',
      title: 'Lowest Common Ancestor of a Binary Tree',
      difficulty: 'Medium',
      source: 'codeforces',
      topics: ['Trees', 'BST'],
      url: 'https://codeforces.com/problemset',
      reasonRecommended: 'Tested in almost all top tech company coding rounds.',
      estimatedInterviewFrequency: 'Very High',
      estimatedStudyTime: '40 mins',
    },
    {
      id: 'serialize-deserialize-binary-tree',
      title: 'Serialize and Deserialize Binary Tree',
      difficulty: 'Hard',
      source: 'codeforces',
      topics: ['Trees', 'Design'],
      url: 'https://codeforces.com/problemset',
      reasonRecommended: 'System design meets tree structure serialization.',
      estimatedInterviewFrequency: 'High',
      estimatedStudyTime: '60 mins',
    },
  ],
  'sliding-window': [
    {
      id: 'longest-substring-without-repeating',
      title: 'Longest Substring Without Repeating Characters',
      difficulty: 'Medium',
      source: 'codeforces',
      topics: ['Sliding Window', 'HashMap'],
      url: 'https://codeforces.com/problemset',
      reasonRecommended: 'High frequency variable-size sliding window question.',
      estimatedInterviewFrequency: 'Very High',
      estimatedStudyTime: '35 mins',
    },
    {
      id: 'two-sum',
      title: 'Two Sum & Two Pointer Optimization',
      difficulty: 'Easy',
      source: 'codeforces',
      topics: ['Two Pointers', 'HashMap'],
      url: 'https://codeforces.com/problemset',
      reasonRecommended: 'Most famous coding question asked across all tech companies.',
      estimatedInterviewFrequency: 'Very High',
      estimatedStudyTime: '20 mins',
    },
    {
      id: '3sum-problem',
      title: '3Sum (Sorted Two Pointers)',
      difficulty: 'Medium',
      source: 'codeforces',
      topics: ['Two Pointers', 'Sorting'],
      url: 'https://codeforces.com/problemset',
      reasonRecommended: 'Tests array sorting and duplicate avoidance techniques.',
      estimatedInterviewFrequency: 'High',
      estimatedStudyTime: '40 mins',
    },
    {
      id: 'minimum-window-substring',
      title: 'Minimum Window Substring',
      difficulty: 'Hard',
      source: 'codeforces',
      topics: ['Sliding Window', 'HashMap'],
      url: 'https://codeforces.com/problemset',
      reasonRecommended: 'Hard sliding window optimization problem.',
      estimatedInterviewFrequency: 'High',
      estimatedStudyTime: '55 mins',
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

    const topics = analysisResults?.topics || [];
    const rawSlug = (topicSlug || '').toLowerCase();
    const formattedSlug = rawSlug.replace(/[^a-z0-9]+/g, '-');

    const found = topics.find((t) => {
      const nameSlug = t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return nameSlug === formattedSlug || t.name.toLowerCase().includes(rawSlug.replace(/-/g, ' '));
    });

    // Match searchResults by topic tags or titles
    const matchingFromSearch = (searchResults || []).filter((q) => {
      const text = `${q.title} ${(q.topics || []).join(' ')} ${(q.tags || []).join(' ')}`.toLowerCase();
      return text.includes(rawSlug.replace(/-/g, ' ')) || (rawSlug.includes('dp') && text.includes('dp'));
    });

    // Lookup fallback questions if needed
    let catalogFallback = [];
    if (formattedSlug.includes('dynamic') || formattedSlug.includes('dp')) {
      catalogFallback = FALLBACK_TOPIC_PROBLEMS['dynamic-programming'];
    } else if (formattedSlug.includes('graph') || formattedSlug.includes('bfs') || formattedSlug.includes('dfs')) {
      catalogFallback = FALLBACK_TOPIC_PROBLEMS['graphs'];
    } else if (formattedSlug.includes('tree')) {
      catalogFallback = FALLBACK_TOPIC_PROBLEMS['trees'];
    } else if (formattedSlug.includes('window') || formattedSlug.includes('pointer')) {
      catalogFallback = FALLBACK_TOPIC_PROBLEMS['sliding-window'];
    } else {
      catalogFallback = FALLBACK_TOPIC_PROBLEMS['dynamic-programming'];
    }

    const mergedQuestions = [
      ...(found?.questions || []),
      ...matchingFromSearch,
      ...catalogFallback,
    ];

    // Remove duplicates by title/id
    const seen = new Set();
    const uniqueQuestions = mergedQuestions.filter((q) => {
      const key = (q.id || q.title || '').toLowerCase().trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const readableName = found?.name || (topicSlug ? topicSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'DSA Topic');

    setTopicObj({
      name: readableName,
      priorityRating: found?.priorityRating || 5,
      explanation: found?.explanation || `High-frequency coding problems for ${fields?.company || 'Tech'} interview preparation.`,
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
          <h2>Loading DSA Topic Details...</h2>
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
            border: '1px solid rgba(56,189,248,0.3)',
            borderRadius: 16,
            padding: '28px 32px',
            marginBottom: 32,
            boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 12 }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                DSA Topic Module
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
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Total Problems</span>
              <div style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.95rem' }}>{questions.length} Coding Problems</div>
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
              <span>🟢</span> Easy Coding Problems ({easyQuestions.length})
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
              <span>🟡</span> Medium Coding Problems ({mediumQuestions.length})
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
              <span>🔴</span> Hard Coding Problems ({hardQuestions.length})
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
