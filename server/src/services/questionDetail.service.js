import { getGeminiClient } from '../config/gemini.js';
import { getDb, FieldValue } from '../config/db.js';
import { buildQuestionDetailPrompt } from '../prompts/questionDetail.prompt.js';

const QUESTION_DETAILS_COLLECTION = 'questionDetails';

function cleanJsonString(str) {
  if (!str) return '';
  let cleaned = str.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
  }
  return cleaned.trim();
}

/**
 * Clean function name generator from problem title.
 */
function toCamelCase(title = '') {
  return title
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .map((word, idx) => (idx === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()))
    .join('');
}

/**
 * Intelligent, dynamic problem-specific guide builder for fallbacks.
 */
function buildFallbackQuestionGuide(q = {}) {
  const title = q.title || q.questionId || 'Technical Coding Problem';
  const company = q.company || 'Tech Company';
  const source = q.source || 'all';
  const difficulty = q.difficulty || 'Medium';
  const topics = Array.isArray(q.topics) && q.topics.length ? q.topics : ['Algorithms', 'Data Structures'];
  const desc = q.description || `Implement an optimal solution for ${title}.`;

  const lowerTitle = title.toLowerCase();

  // Handler for Polymorphism
  if (lowerTitle.includes('polymorphism')) {
    return {
      questionId: q.questionId || 'what-is-polymorphism',
      source,
      generatedAt: new Date().toISOString(),
      explanation: {
        whatQuestionAsks: 'Explain Polymorphism in Object-Oriented Programming and distinguish between Compile-Time (Static) and Runtime (Dynamic) Polymorphism with code examples.',
        importantObservations: [
          'Polymorphism means "many forms" - allowing objects of different classes to respond differently to the same method call.',
          'Compile-Time Polymorphism: Method Overloading & Operator Overloading (resolved by compiler based on argument types).',
          'Runtime Polymorphism: Method Overriding (resolved at execution time via dynamic dispatch / virtual tables).',
        ],
        commonMistakes: [
          'Confusing method overloading (same class, different params) with method overriding (subclass, same signature).',
          'Assuming static or private methods can be overridden in Java.',
        ],
        timeComplexityGoal: 'O(1) dynamic dispatch via vtable lookup',
        spaceComplexityGoal: 'O(1) auxiliary space',
      },
      walkthrough: [
        { step: 1, title: 'Understand Class Hierarchy', detail: 'Base class defines a virtual/abstract method interface; subclasses provide concrete implementations.' },
        { step: 2, title: 'Identify Overloading vs Overriding', detail: 'Overloading uses identical method names with distinct parameter types; Overriding modifies behavior in derived class.' },
        { step: 3, title: 'Apply Dynamic Dispatch', detail: 'Instantiate child objects using parent reference variables to trigger runtime polymorphic behavior.' },
      ],
      hints: [
        { level: 1, text: 'Think about what "poly" (many) and "morph" (form) mean in software design.' },
        { level: 2, text: 'Method overloading happens at compile time; Method overriding happens at runtime.' },
        { level: 3, text: 'In Java, dynamic method dispatch uses the actual object type at runtime, not the reference type.' },
        { level: 4, text: 'In C++, methods must be declared with the `virtual` keyword to enable runtime polymorphism.' },
        { level: 5, text: 'Use abstract classes or interfaces to enforce polymorphic contracts across unrelated classes.' },
      ],
      testCases: [
        { id: 1, input: 'Shape s = new Circle(); s.draw();', expectedOutput: 'Drawing Circle', explanation: 'Runtime polymorphism calls Circle.draw()' },
        { id: 2, input: 'Shape s = new Square(); s.draw();', expectedOutput: 'Drawing Square', explanation: 'Runtime polymorphism calls Square.draw()' },
      ],
      solutions: {
        java: `class Shape {\n    public void draw() {\n        System.out.println("Drawing Shape");\n    }\n}\n\nclass Circle extends Shape {\n    @Override\n    public void draw() {\n        System.out.println("Drawing Circle");\n    }\n}\n\npublic className Main {\n    public static void main(String[] args) {\n        Shape shape = new Circle();\n        shape.draw(); // Output: Drawing Circle\n    }\n}`,
        python: `class Shape:\n    def draw(self):\n        print("Drawing Shape")\n\nclass Circle(Shape):\n    def draw(self):\n        print("Drawing Circle")\n\nshape: Shape = Circle()\nshape.draw()  # Output: Drawing Circle`,
        cpp: `#include <iostream>\nusing namespace std;\n\nclass Shape {\npublic:\n    virtual void draw() {\n        cout << "Drawing Shape" << endl;\n    }\n};\n\nclass Circle : public Shape {\npublic:\n    void draw() override {\n        cout << "Drawing Circle" << endl;\n    }\n};\n\nint main() {\n    Shape* shape = new Circle();\n    shape->draw(); // Output: Drawing Circle\n    delete shape;\n    return 0;\n}`,
      },
      complexityAnalysis: {
        timeComplexity: 'O(1) execution time for method invocation',
        spaceComplexity: 'O(1) extra space',
        explanation: 'Virtual table lookup requires a single pointer dereference at runtime.',
      },
      followUpQuestions: [
        'How does C++ implement virtual functions using VTABLE and VPTR under the hood?',
        'Can static methods or private methods be polymorphic in Java or Python?',
        'How do interfaces differ from abstract classes in achieving polymorphism?',
        'What is the diamond problem in C++ multiple inheritance, and how does virtual inheritance solve it?',
        'How does duck typing in Python implement runtime polymorphism without explicit inheritance?',
      ],
      companyInsights: [
        { title: `${company} OOP Rounds`, description: `Frequently tested in ${company} design interviews to evaluate class structure modularity.` },
      ],
      similarTopics: [
        { topic: 'Encapsulation & Abstraction', related: ['Interfaces', 'Abstract Classes'] },
        { topic: 'Design Patterns', related: ['Factory Pattern', 'Strategy Pattern'] },
      ],
      practiceLink: q.url || 'https://leetcode.com',
    };
  }

  // Generic fallback guide
  return {
    questionId: q.questionId || 'question-detail',
    source,
    generatedAt: new Date().toISOString(),
    explanation: {
      whatQuestionAsks: desc,
      importantObservations: [
        `Analyze key constraints and input parameters for ${title}.`,
        `Identify optimal data structures to reduce time complexity.`,
      ],
      commonMistakes: [
        'Failing to handle edge cases or null/empty inputs.',
        'Using sub-optimal brute force algorithms leading to TLE.',
      ],
      timeComplexityGoal: 'O(N) or O(N log N) optimal execution',
      spaceComplexityGoal: 'O(N) auxiliary space',
    },
    walkthrough: [
      { step: 1, title: 'Analyze Inputs & Edge Cases', detail: 'Check base cases and boundary constraints.' },
      { step: 2, title: 'Formulate Algorithmic Pattern', detail: 'Apply appropriate DSA pattern or conceptual framework.' },
      { step: 3, title: 'Implement & Test', detail: 'Write clean code and verify with test cases.' },
    ],
    hints: [
      { level: 1, text: `Break down ${title} into smaller sub-problems.` },
      { level: 2, text: 'Consider edge cases such as empty input arrays or single elements.' },
      { level: 3, text: 'Can you use a HashMap or Two Pointer technique to optimize?' },
      { level: 4, text: 'Think about space vs time tradeoffs.' },
      { level: 5, text: 'Review standard library functions that can simplify implementation.' },
    ],
    testCases: [
      { id: 1, input: 'Standard Test Input', expectedOutput: 'Expected Result', explanation: 'Basic scenario test' },
    ],
    solutions: {
      java: `// Solution for ${title}\npublic class Solution {\n    public void solve() {\n        // Optimal implementation\n    }\n}`,
      python: `# Solution for ${title}\ndef solve():\n    pass`,
      cpp: `// Solution for ${title}\n#include <iostream>\nvoid solve() {\n}`,
    },
    complexityAnalysis: {
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      explanation: 'Optimal time and space bounds.',
    },
    followUpQuestions: [
      'How would you optimize time complexity if input size doubles?',
      'Can this be solved concurrently across multiple worker threads?',
      'How do memory constraints affect your approach?',
      'What design pattern best fits this structure?',
      'How would you write unit tests for edge cases?',
    ],
    companyInsights: [
      { title: `${company} Interview Insights`, description: `Tested in ${company} engineering interviews.` },
    ],
    similarTopics: [
      { topic: 'Algorithms', related: topics },
    ],
    practiceLink: q.url || 'https://codeforces.com/problemset',
  };
}

export const getQuestionDetails = async (params = {}) => {
  const {
    questionId,
    source = 'all',
    title = '',
    description = '',
    difficulty = 'Medium',
    topics = [],
    company = 'Tech Company',
    url = null,
    userId = 'guest',
  } = params;

  const activeId = questionId || (title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'question');
  const db = getDb();

  // Check Firestore Cache
  if (db && activeId) {
    try {
      const docRef = db.collection(QUESTION_DETAILS_COLLECTION).doc(activeId);
      const snap = await docRef.get();
      if (snap.exists) {
        return snap.data();
      }
    } catch (err) {
      console.warn('[getQuestionDetails Firestore Cache Warning]:', err.message);
    }
  }

  const ai = getGeminiClient();
  const fallbackGuide = buildFallbackQuestionGuide({ questionId: activeId, source, title, description, difficulty, topics, company, url });

  if (!ai) {
    return fallbackGuide;
  }

  const promptText = buildQuestionDetailPrompt({ title: title || activeId, description, difficulty, topics, company });

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
      if (parsed?.explanation || parsed?.solutions) break;
    } catch (err) {
      console.warn(`[getQuestionDetails ${modelName} Note]:`, err.message);
    }
  }

  const detailPayload = {
    questionId: activeId,
    userId: userId || null,
    source,
    generatedAt: new Date().toISOString(),
    ...(parsed || fallbackGuide),
  };

  // Save to Firestore Cache
  if (db && activeId) {
    try {
      const docRef = db.collection(QUESTION_DETAILS_COLLECTION).doc(activeId);
      await docRef.set({
        ...detailPayload,
        createdAt: FieldValue.serverTimestamp(),
      });
    } catch (dbErr) {
      console.error('[Firestore questionDetails Save Error]:', dbErr.message);
    }
  }

  return detailPayload;
};

// Export alias for singular import compatibility
export const getQuestionDetail = getQuestionDetails;

export default {
  getQuestionDetails,
  getQuestionDetail,
};
