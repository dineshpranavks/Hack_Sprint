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
 * Calculate relevance score based on criteria matches:
 * Company Match: +30
 * Role Match: +25
 * Topic Match: +20
 * Skill Match: +15
 * Interview Type Match: +10
 */
export const calculateRelevanceScore = (item, profile = {}) => {
  let score = 50; // Base score

  const itemText = `${item.title} ${item.description} ${(item.tags || []).join(' ')} ${(item.topics || []).join(' ')}`.toLowerCase();
  
  const company = (profile.company || '').toLowerCase();
  const role = (profile.role || '').toLowerCase();
  const skills = (profile.skills || []).map(s => s.toLowerCase());
  const technologies = (profile.technologies || []).map(t => t.toLowerCase());
  const interviewTypes = (profile.interviewTypes || []).map(i => i.toLowerCase());

  // Company Match (+30)
  if (company && itemText.includes(company)) {
    score += 30;
  }

  // Role Match (+25)
  if (role && itemText.includes(role)) {
    score += 25;
  }

  // Topic Match (+20)
  const hasTopicMatch = (item.topics || []).some(t => t.toLowerCase().includes('interview') || t.toLowerCase().includes('system design') || t.toLowerCase().includes('dsa'));
  if (hasTopicMatch) {
    score += 20;
  }

  // Skill Match (+15)
  const allSkills = [...skills, ...technologies];
  if (allSkills.some(s => s && itemText.includes(s))) {
    score += 15;
  }

  // Interview Type Match (+10)
  if (interviewTypes.some(it => it && itemText.includes(it))) {
    score += 10;
  }

  return score;
};

/**
 * Sort results by calculated relevance score in descending order.
 */
export const sortByRelevance = (results = [], profile = {}) => {
  const scored = results.map((item) => ({
    ...item,
    relevanceScore: calculateRelevanceScore(item, profile),
  }));

  return scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
};

/**
 * Merge results from all search providers.
 */
export const mergeResults = (githubRes = [], stackRes = [], redditRes = [], codeforcesRes = []) => {
  return [
    ...githubRes,
    ...stackRes,
    ...redditRes,
    ...codeforcesRes,
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
      source: 'all',
      results,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error('[Firestore saveResults Error]:', err.message);
  }
};

/**
 * Check if a fresh cache (< 24 hours old) exists in Cloud Firestore.
 */
export const getCachedSearchResults = async (conversationId) => {
  const db = getDb();
  if (!db || !conversationId) return null;

  try {
    const docSnap = await db.collection(SEARCH_RESULTS_COLLECTION).doc(conversationId).get();
    if (!docSnap.exists) return null;

    const data = docSnap.data();
    const updatedAt = data.updatedAt ? (data.updatedAt.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)) : null;

    if (updatedAt && Date.now() - updatedAt.getTime() < CACHE_TTL_MS) {
      console.log(`[Cache Hit] Returning cached search results for conversationId ${conversationId}`);
      return data.results || [];
    }
  } catch (err) {
    console.warn('[Cache Check Warning]:', err.message);
  }

  return null;
};

/**
 * Master Search Orchestrator method:
 * 1. Checks 24-hr Firestore cache.
 * 2. Loads generated queries & profile context.
 * 3. Runs GitHub, StackOverflow, Reddit, and Codeforces searches concurrently using Promise.all().
 * 4. Normalizes, merges, deduplicates, and ranks results.
 * 5. Saves and returns capped output (max 50 items).
 */
export const orchestrateSearch = async (conversationId) => {
  if (!conversationId) {
    throw new Error('Conversation ID is required for search orchestration.');
  }

  // Step 1: Check 24-hr Firestore Cache
  const cachedResults = await getCachedSearchResults(conversationId);
  if (cachedResults && cachedResults.length > 0) {
    return cachedResults;
  }

  const db = getDb();
  let queries = [];
  let profile = {};
  let userId = null;

  // Step 2: Load profile and generated queries from Firestore
  if (db) {
    try {
      const sessionSnap = await db.collection(SESSIONS_COLLECTION).doc(conversationId).get();
      if (sessionSnap.exists) {
        const sData = sessionSnap.data();
        profile = sData.fields || {};
        userId = sData.userId || null;
      }

      const queriesSnap = await db.collection(QUERIES_COLLECTION).doc(conversationId).get();
      if (queriesSnap.exists) {
        const qData = queriesSnap.data();
        queries = qData.queries || [];
      }
    } catch (dbErr) {
      console.warn('[Search Orchestrator Firestore Load Warning]:', dbErr.message);
    }
  }

  // Fallback default query if queries empty
  if (!queries.length) {
    const defaultQuery = `${profile.company || 'Tech'} ${profile.role || 'Developer'} Interview`;
    queries = [{ category: 'company', query: defaultQuery }];
  }

  const primaryQuery = queries[0]?.query || `${profile.company || ''} ${profile.role || ''} Interview`.trim();

  // Step 3: Run all searches concurrently using Promise.all()
  const [githubRes, stackRes, redditRes, codeforcesRes] = await Promise.all([
    searchGithub(queries, profile).catch((err) => {
      console.error('[GitHub Provider Error]:', err.message);
      return [];
    }),
    searchStackOverflow(queries, profile).catch((err) => {
      console.error('[StackOverflow Provider Error]:', err.message);
      return [];
    }),
    searchReddit(queries, profile).catch((err) => {
      console.error('[Reddit Provider Error]:', err.message);
      return [];
    }),
    searchCodeforces(queries, profile).catch((err) => {
      console.error('[Codeforces Provider Error]:', err.message);
      return [];
    }),
  ]);

  // Step 4: Merge, deduplicate, calculate relevance score, and sort
  const merged = mergeResults(githubRes, stackRes, redditRes, codeforcesRes);
  const deduplicated = removeDuplicateUrls(merged);
  const ranked = sortByRelevance(deduplicated, profile);

  // Cap combined results to max 50 items
  const finalResults = ranked.slice(0, 50);

  // Step 5: Save to Cloud Firestore
  await saveResults(conversationId, userId, primaryQuery, finalResults);

  return finalResults;
};

export default {
  searchGithub,
  searchStackOverflow,
  searchReddit,
  searchCodeforces,
  mergeResults,
  removeDuplicateUrls,
  sortByRelevance,
  saveResults,
  getCachedSearchResults,
  orchestrateSearch,
};
