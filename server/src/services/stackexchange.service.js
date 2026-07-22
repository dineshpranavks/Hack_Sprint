import axios from 'axios';

/**
 * Service for fetching technical & interview questions from Stack Exchange / StackOverflow API.
 * Caps results at 10 items max.
 */
export const searchStackOverflow = async (queries = [], profile = {}) => {
  if (!queries || !queries.length) return [];

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
        timeout: 6000,
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

  return results.slice(0, 10);
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
