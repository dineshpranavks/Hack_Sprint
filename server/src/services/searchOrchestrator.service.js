import { getDb, FieldValue } from '../config/db.js';
import { searchGithub } from './github.service.js';
import { searchStackOverflow } from './stackexchange.service.js';
import { searchReddit } from './reddit.service.js';
import { searchCodeforces } from './codeforces.service.js';
import { searchTechnicalQuestions } from './technicalQuestions.service.js';

const SESSIONS_COLLECTION = 'conversationSessions';
const QUERIES_COLLECTION = 'generatedQueries';
const SEARCH_RESULTS_COLLECTION = 'searchResults';

/**
 * Filter out non-coding articles, blogs, cheat sheets, HR, salary, resume advice.
 */
export const filterSolvableCodingProblems = (results = []) => {
  const rejectedKeywords = ['salary', 'resume', 'hr round', 'behavioral', 'cheat sheet', 'handbook', 'career advice', 'negotiation'];

  const codingList = [];
  const additionalResources = [];

  results.forEach((item) => {
    if (!item) return;
    const text = `${item.title || ''} ${item.description || ''}`.toLowerCase();
    const isRejected = rejectedKeywords.some(kw => text.includes(kw));

    if (isRejected) {
      additionalResources.push({ ...item, isAdditionalResource: true });
    } else {
      codingList.push(item);
    }
  });

  return { codingList, additionalResources };
};

export const classifyResultItem = (item = {}) => {
  if (item.source === 'technical' || item.subject) {
    return 'Technical Question';
  }
  const source = (item.source || '').toLowerCase();
  const title = (item.title || '').toLowerCase();
  const desc = (item.description || '').toLowerCase();
  const combinedText = `${title} ${desc}`;

  if (source === 'codeforces' || combinedText.includes('codeforces')) {
    return 'Coding Problem';
  }

  const codingKeywords = [
    'problem', 'input', 'output', 'constraints', 'two sum', 'tree', 'graph', 'dp',
    'dynamic programming', 'binary search', 'heap', 'backtracking'
  ];

  if (codingKeywords.some((kw) => combinedText.includes(kw))) {
    return 'Coding Problem';
  }

  return 'Technical Question';
};

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

export const calculateRelevanceScore = (item, profile = {}) => {
  let score = 50;
  const company = (profile.company || '').toLowerCase();
  const text = `${item.title} ${item.description || ''} ${(item.topics || []).join(' ')}`.toLowerCase();

  if (company && text.includes(company)) score += 40;
  if (item.source === 'codeforces') score += 50;
  if (item.source === 'technical') score += 45;

  return score;
};

export const sortByRelevance = (results = [], profile = {}) => {
  return results.map((item) => ({
    ...item,
    type: classifyResultItem(item),
    relevanceScore: calculateRelevanceScore(item, profile),
  })).sort((a, b) => b.relevanceScore - a.relevanceScore);
};

export const mergeResults = (githubRes = [], stackRes = [], redditRes = [], codeforcesRes = [], technicalRes = []) => {
  return [
    ...codeforcesRes,
    ...technicalRes,
    ...githubRes,
    ...stackRes,
    ...redditRes,
  ];
};

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

  const [githubItems, stackItems, redditItems, codeforcesItems, technicalItems] = await Promise.all([
    searchGithub(queries, profile).catch(() => []),
    searchStackOverflow(queries, profile).catch(() => []),
    searchReddit(queries, profile).catch(() => []),
    searchCodeforces(queries, profile).catch(() => []),
    searchTechnicalQuestions(queries, profile).catch(() => []),
  ]);

  const rawMerged = mergeResults(githubItems, stackItems, redditItems, codeforcesItems, technicalItems);
  const deduplicated = removeDuplicateUrls(rawMerged);
  const { codingList, additionalResources } = filterSolvableCodingProblems(deduplicated);
  const finalResults = sortByRelevance(codingList, profile);

  await saveResults(conversationId, userId, queries[0]?.query, finalResults);

  return {
    conversationId,
    totalCount: finalResults.length,
    results: finalResults,
    additionalResources,
  };
};

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
