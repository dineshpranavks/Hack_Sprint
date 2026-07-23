import { getDb, FieldValue } from '../config/db.js';
import { searchGithub } from './github.service.js';
import { searchStackOverflow } from './stackexchange.service.js';
import { searchReddit } from './reddit.service.js';
import { searchCodeforces } from './codeforces.service.js';
import { searchTechnicalQuestions } from './technicalQuestions.service.js';

const SESSIONS_COLLECTION = 'conversationSessions';
const SEARCH_RESULTS_COLLECTION = 'searchResults';

/**
 * Filter out non-coding articles, HR round tips, salary negotiations, and cheat sheets.
 */
export const filterSolvableCodingProblems = (results = []) => {
  const rejectedKeywords = ['salary', 'resume', 'hr round', 'behavioral', 'cheat sheet', 'handbook', 'career advice', 'negotiation'];

  return results.filter((item) => {
    if (!item) return false;
    const text = `${item.title || ''} ${item.description || ''}`.toLowerCase();
    return !rejectedKeywords.some(kw => text.includes(kw));
  });
};

/**
 * Remove duplicate questions based on URL or Title.
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
 * Normalize question into flat schema expected by Gemini Call 2:
 * { title, description, difficulty, tags, topics, platform, url, metadata }
 */
export const normalizeQuestionItem = (item = {}) => {
  return {
    id: item.id || (item.title || 'question').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title: item.title || 'Coding Problem',
    description: item.description || item.summary || '',
    difficulty: item.difficulty || 'Medium',
    tags: Array.isArray(item.tags) ? item.tags : (item.topics || []),
    topics: Array.isArray(item.topics) ? item.topics : (item.tags || []),
    platform: item.source || item.platform || 'codeforces',
    url: item.url || '',
    metadata: {
      rating: item.rating || null,
      subject: item.subject || null,
      company: item.company || null,
    },
  };
};

/**
 * Save flat normalized search results to Cloud Firestore.
 */
export const saveSearchResults = async (conversationId, userId, topics = [], results = []) => {
  const db = getDb();
  if (!db || !conversationId) return;

  try {
    const docRef = db.collection(SEARCH_RESULTS_COLLECTION).doc(conversationId);
    await docRef.set({
      userId: userId || null,
      conversationId,
      topics,
      totalCount: results.length,
      results,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error('[searchOrchestrator saveSearchResults Error]:', err.message);
  }
};

/**
 * STEP 2: SEARCH ENGINE (Pure Data Collector)
 * Receives ONLY topic names (e.g. ["Graphs", "Sliding Window", "Operating Systems", "DBMS"]).
 * Returns ONE flat normalized array of questions.
 * NO grouping, NO ranking, NO recommendations.
 */
export const runSearchOrchestrator = async (conversationId, topicNames = [], userId = 'guest') => {
  const safeTopics = (Array.isArray(topicNames) && topicNames.length > 0)
    ? topicNames
    : ['Arrays', 'Sliding Window', 'Graphs', 'Trees', 'Dynamic Programming', 'Operating Systems', 'DBMS'];

  const queries = safeTopics.map(name => ({
    query: `${name} coding interview questions`,
    topic: name,
  }));

  const profile = { topics: safeTopics };

  const [githubItems, stackItems, redditItems, codeforcesItems, technicalItems] = await Promise.all([
    searchGithub(queries, profile).catch(() => []),
    searchStackOverflow(queries, profile).catch(() => []),
    searchReddit(queries, profile).catch(() => []),
    searchCodeforces(queries, profile).catch(() => []),
    searchTechnicalQuestions(queries, profile).catch(() => []),
  ]);

  const rawMerged = [
    ...codeforcesItems,
    ...technicalItems,
    ...githubItems,
    ...stackItems,
    ...redditItems,
  ];

  const deduplicated = removeDuplicateUrls(rawMerged);
  const solvable = filterSolvableCodingProblems(deduplicated);
  const flatNormalized = solvable.map(normalizeQuestionItem);

  await saveSearchResults(conversationId, userId, safeTopics, flatNormalized);

  return {
    conversationId,
    totalCount: flatNormalized.length,
    results: flatNormalized,
  };
};

export const orchestrateSearch = runSearchOrchestrator;

export default {
  removeDuplicateUrls,
  filterSolvableCodingProblems,
  normalizeQuestionItem,
  saveSearchResults,
  runSearchOrchestrator,
  orchestrateSearch,
};
