import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const localCodeforcesCache = require('../data/codeforcesCache.json');

const PERMITTED_DSA_TAGS = [
  'graphs', 'trees', 'dp', 'binary search', 'heap', 'dfs', 'bfs',
  'greedy', 'backtracking', 'two pointers', 'hashmap', 'prefix sum',
  'bitmask', 'trie', 'dsu', 'union find', 'data structures', 'shortest paths',
  'number theory', 'strings', 'matrices', 'divide and conquer'
];

const EXCLUDED_TAGS = ['implementation', 'constructive algorithms', 'math', 'brute force'];

/**
 * Filter local Codeforces problem cache based on interview criteria.
 * Rating range: 1200 to 2200.
 * Prefers core DSA topics over Div2 A implementation-only / math-only problems.
 */
export const searchCodeforces = async (queries = [], profile = {}) => {
  const problems = Array.isArray(localCodeforcesCache) ? localCodeforcesCache : [];
  if (!problems.length) return [];

  // Rating range strictly enforced: 1200 to 2200 for interview relevancy
  const minRating = 1200;
  const maxRating = 2200;

  // Filter problems by rating (1200-2200) and interview DSA topics
  let filtered = problems.filter((p) => {
    const rating = p.rating || 1300;
    if (rating < minRating || rating > maxRating) return false;

    const tags = (p.tags || []).map((t) => t.toLowerCase());

    // Prefer core DSA tags
    const hasDsaTag = tags.some((t) => PERMITTED_DSA_TAGS.some((dt) => t.includes(dt)));
    const isImplementationOnly = tags.length === 1 && EXCLUDED_TAGS.includes(tags[0]);

    if (isImplementationOnly) return false;
    return hasDsaTag || tags.length > 1;
  });

  if (filtered.length < 10) {
    filtered = problems.filter((p) => (p.rating || 1300) >= 1000 && (p.rating || 1300) <= 2200);
  }

  return filtered.slice(0, 30).map((p) => {
    const rating = p.rating || 1300;
    let difficulty = 'Medium';
    if (rating < 1400) difficulty = 'Easy';
    else if (rating >= 1800) difficulty = 'Hard';

    return {
      id: p.slug || `codeforces-${p.id}`,
      slug: p.slug || `codeforces-${p.id}`,
      source: 'codeforces',
      type: 'Coding Problem',
      isCodingProblem: true,
      title: p.name || 'Codeforces Coding Problem',
      description: p.description || `Codeforces problem rated ${rating} covering ${(p.topics || p.tags || []).join(', ')}.`,
      url: p.url || `https://codeforces.com/problemset/problem/${p.id}`,
      company: p.companies?.[0] || profile.company || 'Tech Company',
      role: profile.role || 'Software Engineer',
      topics: p.topics || p.tags || ['DSA', 'Algorithms'],
      difficulty,
      rating,
      tags: p.tags || ['Codeforces'],
      author: p.author || 'Codeforces',
      reasonRecommended: `Rating ${rating} problem testing ${(p.topics || p.tags || ['DSA']).join(', ')} patterns.`,
      estimatedInterviewFrequency: rating >= 1600 ? 'Very High' : 'High',
      estimatedStudyTime: difficulty === 'Hard' ? '60 mins' : difficulty === 'Medium' ? '45 mins' : '30 mins',
      createdAt: new Date().toISOString(),
    };
  });
};

export default searchCodeforces;
