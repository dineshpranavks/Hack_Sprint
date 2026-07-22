import { getDb, FieldValue } from '../config/db.js';
import { searchGithub } from './github.service.js';
import { searchStackOverflow } from './stackexchange.service.js';
import { searchReddit } from './reddit.service.js';
import { searchCodeforces } from './codeforces.service.js';

const SESSIONS_COLLECTION = 'conversationSessions';
const QUERIES_COLLECTION = 'generatedQueries';
const SEARCH_RESULTS_COLLECTION = 'searchResults';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Classify a search item into exact categories:
 * - 'Coding Problem'
 * - 'Interview Experience'
 * - 'Discussion'
 * - 'System Design'
 * - 'Blog'
 * - 'Cheat Sheet'
 */
export const classifyResultItem = (item = {}) => {
  const source = (item.source || '').toLowerCase();
  const title = (item.title || '').toLowerCase();
  const desc = (item.description || '').toLowerCase();
  const tags = (item.tags || []).map((t) => t.toLowerCase()).join(' ');
  const topics = (item.topics || []).map((t) => t.toLowerCase()).join(' ');
  const combinedText = `${title} ${desc} ${tags} ${topics}`;

  // Rule 1: Codeforces items are ALWAYS Coding Problems
  if (source === 'codeforces' || combinedText.includes('codeforces') || combinedText.includes('problemset')) {
    return 'Coding Problem';
  }

  // Rule 2: Explicit Cheat Sheet detection
  if (combinedText.includes('cheat sheet') || combinedText.includes('cheatsheet')) {
    return 'Cheat Sheet';
  }

  // Rule 3: Explicit System Design detection
  if (combinedText.includes('system design') || combinedText.includes('hld') || combinedText.includes('lld') || combinedText.includes('architecture')) {
    return 'System Design';
  }

  // Rule 4: Explicit Blog / Handbook / Career Advice detection
  if (
    combinedText.includes('handbook') ||
    combinedText.includes('guide') ||
    combinedText.includes('blog') ||
    combinedText.includes('resume') ||
    combinedText.includes('salary') ||
    combinedText.includes('hr interview') ||
    combinedText.includes('career advice')
  ) {
    return 'Blog';
  }

  // Rule 5: Interview Experience detection
  if (combinedText.includes('interview experience') || combinedText.includes('interview loop') || combinedText.includes('asked in interview')) {
    return 'Interview Experience';
  }

  // Rule 6: Coding Problem Detection keywords
  const codingKeywords = [
    'problem', 'input', 'output', 'constraints', 'two sum', 'lru cache', 'number of islands',
    'clone graph', 'binary tree', 'merge intervals', 'array', 'string', 'algorithm', 'dsa',
    'solution', 'leetcode', 'hackerrank', 'codechef', 'tree', 'heap', 'stack', 'queue',
    'dp', 'dynamic programming', 'graph', 'backtracking', 't-primes', 'watermelon', 'way too long words'
  ];

  const isCoding = codingKeywords.some((kw) => combinedText.includes(kw));
  if (isCoding) {
    return 'Coding Problem';
  }

  return 'Discussion';
};

/**
 * Remove duplicates based on URL or Title.
 */
export const removeDuplicateUrls = (results = []) => {
  const seenUrls = new Set();
  const seenTitles = new Set();

  return results.filter((item) => {
    if (!item) return false;
    const urlKey = (item.url || '').toLowerCase().trim();
    const titleKey = (item.title || '').toLowerCase().trim();

    if (urlKey && seenUrls.has(urlKey)) return false;
    if (titleKey && seenTitles.has(titleKey)) return false;

    if (urlKey) seenUrls.add(urlKey);
    if (titleKey) seenTitles.add(titleKey);

    return true;
  });
};

/**
 * Calculate point-based relevance score based on strict rules:
 * - Coding Problem: +100
 * - Company Match: +50
 * - Topic Match: +30
 * - Difficulty Match: +20
 * - Interview Experience: +10
 * - Blog: -40
 * - System Design: -50
 * - Cheat Sheet: -60
 */
export const calculateRelevanceScore = (item, profile = {}) => {
  let score = 50; // Base score

  const itemType = classifyResultItem(item);
  const itemText = `${item.title} ${item.description} ${(item.tags || []).join(' ')} ${(item.topics || []).join(' ')}`.toLowerCase();

  const company = (profile.company || '').toLowerCase();
  const role = (profile.role || '').toLowerCase();
  const profileDifficulty = (profile.experience || '').toLowerCase().includes('senior') ? 'hard' : 'medium';
  const itemDifficulty = (item.difficulty || '').toLowerCase();

  // Item Type Scoring Matrix
  switch (itemType) {
    case 'Coding Problem':
      score += 100;
      break;
    case 'Interview Experience':
      score += 10;
      break;
    case 'Blog':
      score -= 40;
      break;
    case 'System Design':
      score -= 50;
      break;
    case 'Cheat Sheet':
      score -= 60;
      break;
    default:
      score += 5;
      break;
  }

  // Company Match (+50)
  if (company && itemText.includes(company)) {
    score += 50;
  }

  // Topic Match (+30)
  const userTopics = [...(profile.skills || []), ...(profile.technologies || [])].map((t) => t.toLowerCase());
  const hasTopicMatch = userTopics.some((ut) => ut && itemText.includes(ut)) || itemText.includes('dsa') || itemText.includes('algorithms');
  if (hasTopicMatch) {
    score += 30;
  }

  // Difficulty Match (+20)
  if (profileDifficulty && itemDifficulty && (profileDifficulty === itemDifficulty || itemDifficulty === 'medium')) {
    score += 20;
  }

  return score;
};

/**
 * Sort results adhering to the ~80% Coding Problems requirement:
 * Coding Problems are partitioned to fill top positions.
 */
export const sortByRelevance = (results = [], profile = {}) => {
  const scored = results.map((item) => {
    const type = classifyResultItem(item);
    const isCoding = type === 'Coding Problem';
    return {
      ...item,
      type,
      isCodingProblem: isCoding,
      relevanceScore: calculateRelevanceScore(item, profile),
    };
  });

  // Separate coding problems from secondary items
  const codingProblems = scored.filter((item) => item.isCodingProblem).sort((a, b) => b.relevanceScore - a.relevanceScore);
  const secondaryItems = scored.filter((item) => !item.isCodingProblem).sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Guarantee ~80%+ coding problems at the top
  return [...codingProblems, ...secondaryItems];
};

/**
 * Merge results from all search providers.
 */
export const mergeResults = (githubRes = [], stackRes = [], redditRes = [], codeforcesRes = []) => {
  return [
    ...codeforcesRes, // Codeforces has top priority
    ...githubRes,
    ...stackRes,
    ...redditRes,
  ];
};

/**
 * Save search results to Cloud Firestore.
 */
export const saveResults = async (conversationId, userId, primaryQuery, results = []) => {
  const db = getDb();
  if (!db || !conversationId) return;

  try {
    const docRef = db.collection(SEARCH_RESULTS_COLLECTION).doc(conversationId);
    await docRef.set({
      userId: userId || null,
      conversationId,
      query: primaryQuery || 'Combined Interview Search',
      totalCount: results.length,
      results,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error('[searchOrchestrator saveResults Error]:', err.message);
  }
};

/**
 * Main Service Handler for Search Orchestrator.
 */
export const runSearchOrchestrator = async (conversationId, userId = 'guest') => {
  const db = getDb();

  let profile = {};
  let queries = [];

  if (db && conversationId) {
    try {
      const sessionSnap = await db.collection(SESSIONS_COLLECTION).doc(conversationId).get();
      if (sessionSnap.exists) {
        profile = sessionSnap.data()?.extractedFields || {};
      }

      const queriesSnap = await db.collection(QUERIES_COLLECTION).doc(conversationId).get();
      if (queriesSnap.exists) {
        queries = queriesSnap.data()?.queries || [];
      }
    } catch (e) {
      console.warn('[searchOrchestrator Firestore fetch warning]:', e.message);
    }
  }

  if (!queries || !queries.length) {
    queries = [
      { query: `${profile.company || 'Tech'} ${profile.role || 'Software Engineer'} interview coding questions` },
      { query: `${profile.company || 'Tech'} data structures algorithms coding problem` },
    ];
  }

  const [githubItems, stackItems, redditItems, codeforcesItems] = await Promise.all([
    searchGithub(queries, profile),
    searchStackOverflow(queries, profile),
    searchReddit(queries, profile),
    searchCodeforces(queries, profile),
  ]);

  const rawMerged = mergeResults(githubItems, stackItems, redditItems, codeforcesItems);
  const deduplicated = removeDuplicateUrls(rawMerged);
  const finalResults = sortByRelevance(deduplicated, profile);

  await saveResults(conversationId, userId, queries[0]?.query, finalResults);

  return {
    conversationId,
    totalCount: finalResults.length,
    results: finalResults,
  };
};

// Export alias for orchestrateSearch
export const orchestrateSearch = runSearchOrchestrator;

export default {
  classifyResultItem,
  removeDuplicateUrls,
  calculateRelevanceScore,
  sortByRelevance,
  mergeResults,
  saveResults,
  runSearchOrchestrator,
  orchestrateSearch,
};
