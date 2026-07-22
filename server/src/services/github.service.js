import axios from 'axios';

/**
 * Service for fetching interview content from GitHub Search API.
 * Caps results at 10 items max.
 */
export const searchGithub = async (queries = [], profile = {}) => {
  if (!queries || !queries.length) return [];

  const results = [];
  const headers = {
    'User-Agent': 'HackSprint-AI/1.0',
    'Accept': 'application/vnd.github.v3+json',
  };

  // Select top 2 queries for GitHub search
  const selectedQueries = queries.slice(0, 2);

  for (const qObj of selectedQueries) {
    const searchString = typeof qObj === 'string' ? qObj : qObj.query;
    try {
      const response = await axios.get('https://api.github.com/search/repositories', {
        params: {
          q: `${searchString} interview`,
          sort: 'stars',
          order: 'desc',
          per_page: 5,
        },
        headers,
        timeout: 6000,
      });

      const items = response.data?.items || [];
      for (const item of items) {
        if (results.length >= 10) break;
        results.push({
          id: `github-${item.id}`,
          source: 'github',
          title: item.full_name || item.name,
          description: (item.description || 'GitHub interview preparation repository').slice(0, 280),
          url: item.html_url,
          company: profile.company || null,
          role: profile.role || null,
          topics: item.topics || ['Interview Prep'],
          difficulty: 'Medium',
          tags: item.language ? [item.language] : ['GitHub'],
          author: item.owner?.login || 'github',
          createdAt: item.created_at || new Date().toISOString(),
          metadata: {
            stars: item.stargazers_count || 0,
            forks: item.forks_count || 0,
          },
        });
      }
    } catch (err) {
      console.warn('[GitHub Search API Warning]:', err.message);
      // Fallback search in issues/discussions if repo search rate limited
      try {
        const issueRes = await axios.get('https://api.github.com/search/issues', {
          params: {
            q: `${searchString} interview label:interview`,
            per_page: 3,
          },
          headers,
          timeout: 4000,
        });

        const issueItems = issueRes.data?.items || [];
        for (const item of issueItems) {
          if (results.length >= 10) break;
          results.push({
            id: `github-issue-${item.id}`,
            source: 'github',
            title: item.title,
            description: (item.body || 'GitHub interview discussion').slice(0, 280),
            url: item.html_url,
            company: profile.company || null,
            role: profile.role || null,
            topics: ['Discussion'],
            difficulty: 'Medium',
            tags: ['Issue'],
            author: item.user?.login || 'github',
            createdAt: item.created_at || new Date().toISOString(),
            metadata: {
              comments: item.comments || 0,
            },
          });
        }
      } catch (errIssue) {
        console.warn('[GitHub Issue Search Fallback Warning]:', errIssue.message);
      }
    }

    if (results.length >= 10) break;
  }

  return results.slice(0, 10);
};

export default searchGithub;
