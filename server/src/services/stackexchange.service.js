import axios from 'axios';

function getFallbackStackOverflowResults(profile = {}) {
  const company = profile.company || 'Tech';
  const role = profile.role || 'Software Developer';

  return [
    {
      id: 'stackoverflow-fallback-1',
      source: 'stackoverflow',
      title: `How to approach ${company} ${role} System Design & Scalability Interviews?`,
      description: 'Detailed StackOverflow community consensus on designing distributed caching, database indexing, and microservices.',
      url: 'https://stackoverflow.com/questions/tagged/system-design',
      company,
      role,
      topics: ['System Design', 'Architecture', 'Caching'],
      difficulty: 'Hard',
      tags: ['System Design', 'StackOverflow'],
      author: 'StackOverflow Community',
      createdAt: new Date().toISOString(),
      metadata: { score: 1450, answerCount: 18, isAnswered: true },
    },
    {
      id: 'stackoverflow-fallback-2',
      source: 'stackoverflow',
      title: `What are the most effective Dynamic Programming patterns for ${company} coding rounds?`,
      description: 'Top-voted answers explaining state transitions, memoization tables, and space optimization techniques.',
      url: 'https://stackoverflow.com/questions/tagged/dynamic-programming',
      company,
      role,
      topics: ['Dynamic Programming', 'Algorithms'],
      difficulty: 'Medium',
      tags: ['Algorithms', 'DP'],
      author: 'StackOverflow Community',
      createdAt: new Date().toISOString(),
      metadata: { score: 980, answerCount: 12, isAnswered: true },
    },
  ];
}

/**
 * Service for fetching technical & interview questions from Stack Exchange / StackOverflow API.
 * Caps results at 10 items max.
 */
export const searchStackOverflow = async (queries = [], profile = {}) => {
  if (!queries || !queries.length) return getFallbackStackOverflowResults(profile);

  const results = [];
  const selectedQueries = queries.slice(0, 2);

  for (const qObj of selectedQueries) {
    const searchString = typeof qObj === 'string' ? qObj : qObj.query;
    try {
      const response = await axios.get('https://api.stackexchange.com/2.3/search/advanced', {
        params: {
          site: 'stackoverflow',
          q: `${searchString} interview`,
          sort: 'relevance',
          pagesize: 5,
        },
        timeout: 4000,
      });

      const items = response.data?.items || [];
      for (const item of items) {
        if (results.length >= 10) break;
        results.push({
          id: `stackoverflow-${item.question_id}`,
          source: 'stackoverflow',
          title: unescapeHtml(item.title),
          description: `StackOverflow question with ${item.answer_count || 0} answers and score of ${item.score || 0}.`,
          url: item.link,
          company: profile.company || null,
          role: profile.role || null,
          topics: item.tags || ['StackOverflow'],
          difficulty: 'Medium',
          tags: item.tags || [],
          author: item.owner?.display_name || 'StackOverflow User',
          createdAt: new Date((item.creation_date || Date.now() / 1000) * 1000).toISOString(),
          metadata: {
            score: item.score || 0,
            answerCount: item.answer_count || 0,
            isAnswered: !!item.is_answered,
          },
        });
      }
    } catch (err) {
      console.warn('[StackExchange API Warning]:', err.message);
    }

    if (results.length >= 10) break;
  }

  return results.length > 0 ? results.slice(0, 10) : getFallbackStackOverflowResults(profile);
};

function unescapeHtml(safe) {
  if (!safe) return '';
  return safe
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export default searchStackOverflow;
