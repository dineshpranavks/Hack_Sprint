import { getGeminiClient } from '../config/gemini.js';
import { getDb, FieldValue } from '../config/db.js';
import { buildIntentPrompt } from '../prompts/intent.prompt.js';
import { buildAnalysisPrompt } from '../prompts/analysis.prompt.js';

const COLLECTION_NAME = 'conversationSessions';
const ANALYSIS_COLLECTION_NAME = 'analysisResults';

function cleanJsonString(str) {
  if (!str) return '';
  let cleaned = str.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
  }
  return cleaned.trim();
}

export const validateConversation = (fields = {}) => {
  return { completed: true, missingFields: [] };
};

/**
 * Heuristic intent extraction fallback if Gemini is offline.
 */
function heuristicExtract(latestMsg = '', existingFields = {}) {
  const text = (typeof latestMsg === 'string' ? latestMsg : JSON.stringify(latestMsg)).toLowerCase();
  
  const companies = [
    'zoho', 'amazon', 'google', 'microsoft', 'meta', 'apple', 'netflix', 'uber',
    'linkedin', 'adobe', 'twitter', 'oracle', 'salesforce', 'flipkart', 'atlassian',
    'paypal', 'tcs', 'infosys', 'wipro', 'swiggy', 'zomato', 'goldman', 'walmart',
    'stripe', 'cisco', 'intel', 'nvidia'
  ];
  let comp = existingFields.company || null;
  for (const c of companies) {
    if (text.includes(c)) {
      comp = c.charAt(0).toUpperCase() + c.slice(1);
      if (c === 'tcs') comp = 'TCS';
      break;
    }
  }

  let role = existingFields.role || null;
  if (text.includes('frontend') || text.includes('react') || text.includes('ui')) {
    role = 'Frontend Engineer';
  } else if (text.includes('backend') || text.includes('node') || text.includes('spring')) {
    role = 'Backend Engineer';
  } else if (text.includes('cloud') || text.includes('devops') || text.includes('aws')) {
    role = 'Cloud/DevOps Engineer';
  } else if (text.includes('data engineer') || text.includes('spark') || text.includes('etl')) {
    role = 'Data Engineer';
  } else if (text.includes('machine learning') || text.includes('ml engineer') || text.includes('pytorch')) {
    role = 'Machine Learning Engineer';
  } else if (text.includes('mobile') || text.includes('android') || text.includes('ios')) {
    role = 'Mobile Engineer';
  } else if (text.includes('sde2') || text.includes('sde 2') || text.includes('sd2')) {
    role = 'Software Development Engineer II';
  } else if (text.includes('sde1') || text.includes('sde 1') || text.includes('sd1')) {
    role = 'Software Development Engineer I';
  }

  let exp = existingFields.experience || null;
  if (text.includes('5 years') || text.includes('5 yrs') || text.includes('6 years') || text.includes('senior')) {
    exp = 'Senior (5+ yrs)';
  } else if (text.includes('2 years') || text.includes('2 yrs') || text.includes('3 years')) {
    exp = 'Mid-Level (2-4 yrs)';
  } else if (text.includes('fresher') || text.includes('0 years') || text.includes('intern')) {
    exp = 'Junior / Fresher (0-1 yrs)';
  }

  const topics = [...(existingFields.topics || [])];
  const knownTopics = [
    'Dynamic Programming', 'Graphs', 'Trees', 'Sliding Window', 'Two Pointers',
    'Binary Search', 'Heap', 'Backtracking', 'Object Oriented Programming',
    'Database Management Systems', 'Operating Systems', 'Computer Networks'
  ];
  for (const t of knownTopics) {
    if (text.includes(t.toLowerCase()) && !topics.includes(t)) {
      topics.push(t);
    }
  }

  let lang = existingFields.language || null;
  if (text.includes('java') && !text.includes('javascript')) lang = 'Java';
  else if (text.includes('python')) lang = 'Python';
  else if (text.includes('c++') || text.includes('cpp')) lang = 'C++';
  else if (text.includes('javascript') || text.includes('js')) lang = 'JavaScript';

  return {
    company: comp,
    role,
    experience: exp,
    skills: existingFields.skills || [],
    technologies: existingFields.technologies || [],
    topics,
    difficulty: existingFields.difficulty || null,
    language: lang,
    interviewType: existingFields.interviewType || null,
    confidence: 0.95,
  };
}

/**
 * STEP 1: Intent Extraction using Gemini (single supported model gemini-2.0-flash).
 */
export const extractIntent = async (messages = [], existingFields = {}) => {
  const lastUserObj = [...messages].reverse().find((m) => m.sender === 'user' || m.role === 'user');
  const latestUserMsg = lastUserObj?.text || lastUserObj?.content || (typeof lastUserObj === 'string' ? lastUserObj : '');

  const fallback = heuristicExtract(latestUserMsg, existingFields);
  const ai = getGeminiClient();
  if (!ai) {
    return fallback;
  }

  const promptText = buildIntentPrompt(messages, existingFields);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: promptText,
      config: { responseMimeType: 'application/json', temperature: 0.1 },
    });
    const rawText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleaned = cleanJsonString(rawText);
    const parsed = JSON.parse(cleaned);

    return {
      company: parsed?.company !== undefined ? parsed.company : (existingFields.company || fallback.company),
      role: parsed?.role !== undefined ? parsed.role : (existingFields.role || fallback.role),
      experience: parsed?.experience !== undefined ? parsed.experience : (existingFields.experience || fallback.experience),
      skills: Array.isArray(parsed?.skills) ? parsed.skills : (existingFields.skills || fallback.skills),
      technologies: Array.isArray(parsed?.technologies) ? parsed.technologies : (existingFields.technologies || fallback.technologies),
      topics: Array.isArray(parsed?.topics) ? parsed.topics : (existingFields.topics || fallback.topics),
      difficulty: parsed?.difficulty || existingFields.difficulty || null,
      language: parsed?.language || existingFields.language || fallback.language,
      interviewType: parsed?.interviewType || existingFields.interviewType || null,
      confidence: parsed?.confidence || 0.95,
    };
  } catch (err) {
    console.warn('[extractIntent Gemini Error]:', err.message);
    return fallback;
  }
};

export const generateFollowUpQuestion = async (fields = {}, missingFields = []) => {
  const safeMissing = Array.isArray(missingFields) ? missingFields : [];
  if (!safeMissing.length) {
    return "Got it! Generating your custom interview preparation kit now!";
  }
  return `Could you please share your ${safeMissing.join(', ')}?`;
};

export const updateConversation = async (conversationId, messages = [], fields = {}, userId = null) => {
  const activeId = conversationId || `conv-${Date.now()}`;
  const db = getDb();

  const dataToSave = {
    userId: userId || null,
    conversationId: activeId,
    messages,
    chatHistory: messages,
    extractedFields: fields,
    fields,
    missingFields: [],
    completed: true,
    status: 'completed',
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (db && activeId) {
    try {
      const docRef = db.collection(COLLECTION_NAME).doc(activeId);
      const snap = await docRef.get();
      if (!snap.exists) {
        dataToSave.createdAt = FieldValue.serverTimestamp();
      }
      await docRef.set(dataToSave, { merge: true });
    } catch (err) {
      console.error('[Firestore updateConversation Error]:', err.message);
    }
  }

  return {
    id: activeId,
    conversationId: activeId,
    fields,
    completed: true,
    missingFields: [],
    status: 'completed',
    messages,
    chatHistory: messages,
  };
};

/**
 * CALL 2: AI RECOMMENDATION ENGINE
 * Passes User Profile, Coding Topics, Technical Topics, and the flat question list to Gemini.
 * Gemini categorizes, ranks, and assigns unique recommendation reasons per question.
 * ZERO JavaScript heuristics remain.
 */
export const recommendQuestions = async (conversationId, profile = {}, topicsInferred = {}, searchResults = []) => {
  if (!conversationId) {
    throw new Error('Conversation ID is required for AI analysis.');
  }

  const db = getDb();
  const ai = getGeminiClient();

  const errorResponse = {
    conversationId,
    summary: { company: profile.company || null, role: profile.role || null },
    dsaTopics: [],
    technicalTopics: [],
    topics: [],
    error: 'Unable to generate personalized recommendations.',
  };

  if (!ai) {
    return errorResponse;
  }

  const promptText = buildAnalysisPrompt(profile, topicsInferred, searchResults);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: promptText,
      config: { responseMimeType: 'application/json', temperature: 0.2 },
    });
    const rawText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleaned = cleanJsonString(rawText);
    const parsed = JSON.parse(cleaned);

    const dsaTopics = Array.isArray(parsed?.dsaTopics) ? parsed.dsaTopics : (Array.isArray(parsed?.codingTopics) ? parsed.codingTopics : []);
    const technicalTopics = Array.isArray(parsed?.technicalTopics) ? parsed.technicalTopics : [];

    const analysisPayload = {
      userId: profile.userId || null,
      conversationId,
      dsaTopics,
      technicalTopics,
      topics: [...dsaTopics, ...technicalTopics],
      summary: parsed?.summary || { company: profile.company || null, role: profile.role || null },
      learningRoadmap: Array.isArray(parsed?.learningRoadmap) ? parsed.learningRoadmap : [],
      companyInsights: Array.isArray(parsed?.companyInsights) ? parsed.companyInsights : [],
    };

    if (db && conversationId) {
      try {
        const docRef = db.collection(ANALYSIS_COLLECTION_NAME).doc(conversationId);
        await docRef.set({
          ...analysisPayload,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      } catch (dbErr) {
        console.error('[Firestore analysisResults Save Error]:', dbErr.message);
      }
    }

    return analysisPayload;
  } catch (err) {
    console.error('[recommendQuestions Gemini Error]:', err.message);
    return errorResponse;
  }
};

// Aliases for legacy exports
export const analyzeResults = recommendQuestions;
export const generateSearchQueries = async () => [];

export default {
  extractIntent,
  generateFollowUpQuestion,
  updateConversation,
  validateConversation,
  recommendQuestions,
  analyzeResults,
  generateSearchQueries,
};
