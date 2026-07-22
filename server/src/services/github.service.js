import axios from 'axios';

/**
 * Curated fallback GitHub interview repositories if external API is restricted/rate-limited.
 */
function getFallbackGithubResults(profile = {}) {
  const company = profile.company || 'Tech';
  const role = profile.role || 'Software Engineer';

  return [
    {
      id: 'github-fallback-1',
      source: 'github',
      title: `${company} ${role} Interview Preparation Handbook`,
      description: `Curated list of real ${company} interview questions, system design guides, and coding solutions.`,
      url: 'https://github.com/jwasham/coding-interview-university',
      company,
      role,
      topics: ['DSA', 'System Design', 'Interview Prep'],
      difficulty: 'Medium',
      tags: ['Java', 'Python', 'Algorithms'],
      author: 'jwasham',
      createdAt: new Date().toISOString(),
      metadata: { stars: 300000, forks: 75000 },
    },
    {
      id: 'github-fallback-2',
      source: 'github',
      title: `${company} Tech Interview Cheat Sheet & Solutions`,
      description: 'Comprehensive repository covering data structure algorithms, object-oriented design, and system architecture.',
      url: 'https://github.com/yangshun/tech-interview-handbook',
      company,
      role,
      topics: ['Algorithms', 'System Design'],
      difficulty: 'Hard',
      tags: ['JavaScript', 'Python'],
      author: 'yangshun',
      createdAt: new Date().toISOString(),
      metadata: { stars: 120000, forks: 15000 },
    },
  ];
}

/**
 * Service for fetching interview content from GitHub Search API.
 * Caps results at 10 items max.
 */
export const searchGithub = async (queries = [], profile = {}) => {
  if (!queries || !queries.length) return getFallbackGithubResults(profile);

  const results = [];
  const headers = {
    'User-Agent': 'HackSprint-AI/1.0',
    'Accept': 'application/vnd.github.v3+json',
  };

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
        timeout: 4000,
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
          topics: item.topics && item.topics.length ? item.topics : ['Interview Prep'],
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
    }

    if (results.length >= 10) break;
  }

  return results.length > 0 ? results.slice(0, 10) : getFallbackGithubResults(profile);
};

export default searchGithub;
