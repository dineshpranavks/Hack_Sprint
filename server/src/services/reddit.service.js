import axios from 'axios';

/**
 * Service for fetching interview experiences & posts from Reddit API.
 * Caps results at 10 items max.
 */
export const searchReddit = async (queries = [], profile = {}) => {
  if (!queries || !queries.length) return [];

  const results = [];
  const headers = {
    'User-Agent': 'HackSprint-AI/1.0',
  };

  const selectedQueries = queries.slice(0, 2);

  for (const qObj of selectedQueries) {
    const searchString = typeof qObj === 'string' ? qObj : qObj.query;
    try {
      const response = await axios.get('https://www.reddit.com/r/cscareerquestions+leetcode/search.json', {
        params: {
          q: searchString,
          restrict_sr: 1,
          sort: 'relevance',
          limit: 5,
        },
        headers,
        timeout: 6000,
      });

      const children = response.data?.data?.children || [];
      for (const post of children) {
        if (results.length >= 10) break;
        const pData = post.data;
        if (!pData) continue;

        results.push({
          id: `reddit-${pData.id}`,
          source: 'reddit',
          title: pData.title,
          description: (pData.selftext || pData.title || 'Reddit interview discussion').slice(0, 280),
          url: pData.permalink ? `https://www.reddit.com${pData.permalink}` : pData.url,
          company: profile.company || null,
          role: profile.role || null,
          topics: [pData.subreddit || 'cscareerquestions'],
          difficulty: 'Medium',
          tags: [pData.subreddit || 'Reddit'],
          author: pData.author || 'reddit_user',
          createdAt: new Date((pData.created_utc || Date.now() / 1000) * 1000).toISOString(),
          metadata: {
            score: pData.score || 0,
            numComments: pData.num_comments || 0,
            subreddit: pData.subreddit || 'cscareerquestions',
          },
        });
      }
    } catch (err) {
      console.warn('[Reddit API Warning]:', err.message);
      // Fallback global Reddit search if subreddit search is restricted
      try {
        const globalRes = await axios.get('https://www.reddit.com/search.json', {
          params: {
            q: `${searchString} interview`,
            sort: 'relevance',
            limit: 3,
          },
          headers,
          timeout: 4000,
        });

        const globalChildren = globalRes.data?.data?.children || [];
        for (const post of globalChildren) {
          if (results.length >= 10) break;
          const pData = post.data;
          if (!pData) continue;

          results.push({
            id: `reddit-global-${pData.id}`,
            source: 'reddit',
            title: pData.title,
            description: (pData.selftext || pData.title || 'Reddit interview experience').slice(0, 280),
            url: pData.permalink ? `https://www.reddit.com${pData.permalink}` : pData.url,
            company: profile.company || null,
            role: profile.role || null,
            topics: ['Interview Experience'],
            tags: ['Reddit'],
            author: pData.author || 'reddit_user',
            createdAt: new Date((pData.created_utc || Date.now() / 1000) * 1000).toISOString(),
            metadata: {
              score: pData.score || 0,
              numComments: pData.num_comments || 0,
            },
          });
        }
      } catch (errGlobal) {
        console.warn('[Reddit Global Fallback Warning]:', errGlobal.message);
      }
    }

    if (results.length >= 10) break;
  }

  return results.slice(0, 10);
};

export default searchReddit;
