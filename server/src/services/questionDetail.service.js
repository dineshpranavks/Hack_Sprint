import { getGeminiClient } from '../config/gemini.js';
import { getDb, FieldValue } from '../config/db.js';
import { buildQuestionDetailPrompt } from '../prompts/questionDetail.prompt.js';

const QUESTION_EXPLANATIONS_COLLECTION = 'questionExplanations';

function cleanJsonString(str) {
  if (!str) return '';
  let cleaned = str.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
  }
  return cleaned.trim();
}

/**
 * Generate fallback question detail if Gemini API is unavailable or quota exceeded.
 */
function buildFallbackQuestionDetail(q = {}) {
  const title = q.title || 'Technical Coding Problem';
  const company = q.company || 'Tech Company';
  const role = q.role || 'Software Engineer';
  const category = q.category || 'Algorithms';

  return {
    id: q.id || `question-${Date.now()}`,
    title,
    difficulty: q.difficulty || 'Medium',
    category,
    topics: q.topics || q.tags || ['Data Structures', 'Algorithms'],
    company,
    estimatedInterviewFrequency: 'High',
    estimatedStudyTime: '45 mins',
    reasonRecommended: q.reasonRecommended || `High frequency question asked in ${company} ${role} technical rounds.`,
    problemExplanation: {
      whatProblemIsAsking: q.description || `Given input constraints, implement an efficient algorithmic solution targeting optimal time complexity for ${title}.`,
      keyObservations: [
        'Analyze space vs time tradeoff before implementation.',
        'Use appropriate data structures (e.g. HashMaps for O(1) lookups or Two Pointers for sorted input).',
        'Identify base cases and boundary constraints early.',
      ],
      commonMistakes: [
        'Off-by-one errors during array iterations.',
        'Null or undefined pointer dereferencing on empty input.',
        'Overlooking integer overflow or large input bounds.',
      ],
      interviewExpectations: `Candidates for ${role} roles are expected to communicate their thought process clearly, explain time complexity, and write clean, modular code.`,
    },
    workedExample: {
      input: 'Example Input: nums = [2, 7, 11, 15], target = 9',
      output: 'Example Output: [0, 1]',
      stepByStepExplanation: '1. Initialize hash map to store elements.\n2. Iterate through input list.\n3. Compute complement (target - current element).\n4. If complement exists in map, return indices [map.get(complement), current_index].\n5. Otherwise, store current element and index in map.',
    },
    testCases: [
      { input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0,1]', shortExplanation: 'Standard positive integer case', type: 'Standard' },
      { input: 'nums = [3,2,4], target = 6', expectedOutput: '[1,2]', shortExplanation: 'Unsorted array elements', type: 'Standard' },
      { input: 'nums = [3,3], target = 6', expectedOutput: '[0,1]', shortExplanation: 'Duplicate values test case', type: 'Corner Case' },
      { input: 'nums = [0,4,3,0], target = 0', expectedOutput: '[0,3]', shortExplanation: 'Zero values handling', type: 'Edge Case' },
      { input: 'nums = [-1,-8,9,2], target = 1', expectedOutput: '[0,3]', shortExplanation: 'Negative integer inputs', type: 'Edge Case' },
      { input: 'nums = [5], target = 5', expectedOutput: '[]', shortExplanation: 'Minimum single element array', type: 'Minimum Input' },
      { input: 'nums = [1..10000], target = 19999', expectedOutput: '[9998,9999]', shortExplanation: 'Large array boundary performance', type: 'Large Input' },
      { input: 'nums = [1000000000, 500000000], target = 1500000000', expectedOutput: '[0,1]', shortExplanation: 'Large integer values', type: 'Large Input' },
      { input: 'nums = [], target = 0', expectedOutput: '[]', shortExplanation: 'Empty array input boundary', type: 'Minimum Input' },
      { input: 'nums = [1, 2, 3, 4, 5], target = 100', expectedOutput: '[]', shortExplanation: 'No valid pair target match', type: 'Corner Case' },
    ],
    solutions: {
      java: {
        code: `public class Solution {\n    public int[] solve(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int diff = target - nums[i];\n            if (map.containsKey(diff)) {\n                return new int[] { map.get(diff), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}`,
        explanation: 'Single pass Hash Map lookup technique storing visited values.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
      },
      python: {
        code: `def solve(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []`,
        explanation: 'Dictionary key lookup providing linear time execution.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
      },
      javascript: {
        code: `function solve(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) {\n      return [map.get(diff), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
        explanation: 'JavaScript Map object implementation for O(1) average lookup.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
      },
    },
    hints: [
      { level: 1, hint: 'Can you solve this without checking every pair using a nested O(N^2) loop?' },
      { level: 2, hint: 'Consider what information you need when inspecting each element (the complement target - current).' },
      { level: 3, hint: 'Use a Hash Map or Dictionary to store previously visited elements and their indices.' },
    ],
    followUpQuestions: [
      { question: 'What if the input array is already sorted in ascending order?', rationale: 'Tests transition from Hash Map to Two-Pointer technique reducing space complexity to O(1).' },
      { question: 'How would you handle duplicate pairs if all unique combinations are required?', rationale: 'Evaluates sorting and duplicate skipping strategies.' },
      { question: 'What if the array cannot fit into memory on a single machine?', rationale: 'Evaluates distributed system design, MapReduce, and bucket partitioning.' },
      { question: 'How would you optimize if memory allocations are extremely restricted?', rationale: 'Evaluates memory-constrained binary search or bit manipulation approaches.' },
    ],
    similarQuestions: [
      { title: 'Two Sum II - Input Array Is Sorted', difficulty: 'Easy', reason: 'Direct two-pointer variant for sorted input.' },
      { title: '3Sum', difficulty: 'Medium', reason: 'Extension of two sum to triple combinations with sorting.' },
      { title: 'Subarray Sum Equals K', difficulty: 'Medium', reason: 'Prefix sum hashmap pattern variant.' },
      { title: '4Sum', difficulty: 'Medium', reason: 'Multi-variable target matching extension.' },
      { title: 'Two Sum BST', difficulty: 'Medium', reason: 'Tree traversal variation of the lookup problem.' },
    ],
    companyInsights: {
      whyAsked: `${company} evaluates candidate problem-solving speed, clean data structure usage, and ability to communicate complexity tradeoffs.`,
      evaluatedConcepts: ['Hash Table', 'Array Iteration', 'Time Complexity Analysis', 'Edge Case Handling'],
      typicalRound: 'Technical Phone Screen / Round 1 Coding Interview',
      relativeDifficulty: 'Standard problem for SDE-1 / SDE-2 candidates',
    },
    url: q.url || null,
  };
}

/**
 * Service method for getQuestionDetail():
 * 1. Checks Firestore cache 'questionExplanations' by questionId.
 * 2. If cached, returns instantly without calling Gemini.
 * 3. If missing, invokes Gemini, parses JSON, caches in Firestore, and returns payload.
 */
export const getQuestionDetail = async (questionData = {}) => {
  const questionId = questionData.id || questionData.slug || (questionData.title ? questionData.title.toLowerCase().replace(/\s+/g, '-') : null);
  if (!questionId) {
    throw new Error('Question ID or Title is required.');
  }

  const db = getDb();

  // Step 1: Check Firestore cache
  if (db) {
    try {
      const docSnap = await db.collection(QUESTION_EXPLANATIONS_COLLECTION).doc(questionId).get();
      if (docSnap.exists) {
        console.log(`[Cache Hit] Returning cached question explanation for ${questionId}`);
        return {
          id: questionId,
          ...docSnap.data(),
        };
      }
    } catch (e) {
      console.warn('[questionDetail Firestore cache check warning]:', e.message);
    }
  }

  // Step 2: On-demand Gemini call
  const ai = getGeminiClient();
  if (!ai) {
    console.warn('[questionDetail Note]: Gemini API client unavailable. Returning synthesized fallback.');
    const fallback = buildFallbackQuestionDetail({ id: questionId, ...questionData });
    await cacheQuestionDetailInFirestore(questionId, fallback);
    return fallback;
  }

  const promptText = buildQuestionDetailPrompt({ id: questionId, ...questionData });

  const attemptCall = async (modelName) => {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });
    const rawText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleaned = cleanJsonString(rawText);
    return JSON.parse(cleaned);
  };

  let parsed = null;
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash'];
  for (const modelName of models) {
    try {
      parsed = await attemptCall(modelName);
      if (parsed && parsed.problemExplanation) break;
    } catch (err) {
      console.warn(`[getQuestionDetail ${modelName} Note]:`, err.message);
    }
  }

  const resultPayload = {
    id: questionId,
    url: questionData.url || null,
    ...(parsed || buildFallbackQuestionDetail({ id: questionId, ...questionData })),
  };

  // Step 3: Cache in Firestore
  await cacheQuestionDetailInFirestore(questionId, resultPayload);

  return resultPayload;
};

async function cacheQuestionDetailInFirestore(questionId, payload) {
  const db = getDb();
  if (!db || !questionId) return;

  try {
    const docRef = db.collection(QUESTION_EXPLANATIONS_COLLECTION).doc(questionId);
    await docRef.set({
      ...payload,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error('[Firestore questionExplanations Save Error]:', err.message);
  }
}

export default {
  getQuestionDetail,
};
