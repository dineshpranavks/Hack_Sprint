import { getDb, FieldValue } from '../config/db.js';

const BOOKMARKS_COLLECTION = 'userBookmarks';
const RECENTLY_VIEWED_COLLECTION = 'userRecentlyViewed';

/**
 * Toggle bookmark state for a question in Cloud Firestore.
 */
export const toggleBookmark = async (userId = 'guest', questionId, questionData = {}) => {
  if (!questionId) throw new Error('Question ID is required.');
  const db = getDb();
  const docId = `${userId}_${questionId}`;

  if (!db) {
    return { bookmarked: true, questionId };
  }

  const docRef = db.collection(BOOKMARKS_COLLECTION).doc(docId);
  const docSnap = await docRef.get();

  if (docSnap.exists) {
    await docRef.delete();
    return { bookmarked: false, questionId };
  } else {
    await docRef.set({
      userId,
      questionId,
      title: questionData.title || 'Interview Question',
      difficulty: questionData.difficulty || 'Medium',
      category: questionData.category || 'General',
      url: questionData.url || null,
      questionData,
      createdAt: FieldValue.serverTimestamp(),
    });
    return { bookmarked: true, questionId };
  }
};

/**
 * Fetch all bookmarked questions for a user from Cloud Firestore.
 */
export const getUserBookmarks = async (userId = 'guest') => {
  const db = getDb();
  if (!db) return [];

  try {
    const snap = await db.collection(BOOKMARKS_COLLECTION).where('userId', '==', userId).get();
    const bookmarks = [];
    snap.forEach((doc) => {
      bookmarks.push(doc.data());
    });
    return bookmarks;
  } catch (err) {
    console.warn('[getUserBookmarks Warning]:', err.message);
    return [];
  }
};

/**
 * Track recently opened question in Cloud Firestore.
 */
export const trackRecentlyViewed = async (userId = 'guest', questionId, questionData = {}) => {
  if (!questionId) return;
  const db = getDb();
  if (!db) return;

  const docId = `${userId}_${questionId}`;
  try {
    const docRef = db.collection(RECENTLY_VIEWED_COLLECTION).doc(docId);
    await docRef.set({
      userId,
      questionId,
      title: questionData.title || 'Interview Question',
      difficulty: questionData.difficulty || 'Medium',
      url: questionData.url || null,
      questionData,
      viewedAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.warn('[trackRecentlyViewed Warning]:', err.message);
  }
};

/**
 * Fetch recently viewed questions for a user from Cloud Firestore.
 */
export const getUserRecentlyViewed = async (userId = 'guest') => {
  const db = getDb();
  if (!db) return [];

  try {
    const snap = await db.collection(RECENTLY_VIEWED_COLLECTION)
      .where('userId', '==', userId)
      .get();

    const items = [];
    snap.forEach((doc) => {
      items.push(doc.data());
    });
    return items.slice(0, 10);
  } catch (err) {
    console.warn('[getUserRecentlyViewed Warning]:', err.message);
    return [];
  }
};

export default {
  toggleBookmark,
  getUserBookmarks,
  trackRecentlyViewed,
  getUserRecentlyViewed,
};
