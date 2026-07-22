import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const localCodeforcesCache = require('../data/codeforcesCache.json');

/**
 * Filter local Codeforces problem cache based on profile criteria (tags, rating, topics).
 * NEVER performs text queries or external web scraping.
 * Caps results at 20 items max.
 */
export const searchCodeforces = async (queries = [], profile = {}) => {
  const problems = Array.isArray(localCodeforcesCache) ? localCodeforcesCache : [];
  if (!problems.length) return [];

  // Determine target rating based on candidate experience / seniority
  const expStr = (profile.experience || '').toLowerCase();
  const seniorityStr = (profile.seniority || '').toLowerCase();

  let minRating = 800;
  let maxRating = 1600;

  if (expStr.includes('5') || expStr.includes('senior') || seniorityStr.includes('senior') || seniorityStr.includes('lead')) {
    minRating = 1400;
    maxRating = 2400;
  } else if (expStr.includes('2') || expStr.includes('3') || expStr.includes('mid') || seniorityStr.includes('sde-2')) {
    minRating = 1100;
    maxRating = 1800;
  } else {
    minRating = 800;
    maxRating = 1400;
  }

  // Extract skills/topics from profile
  const profileTags = [
    ...(profile.skills || []),
    ...(profile.technologies || []),
    ...(profile.interviewTypes || [])
  ].map(t => t.toLowerCase());

  // Filter problems by rating and tags/topics
  let filtered = problems.filter((p) => {
    const r = p.rating || 1000;
    return r >= minRating && r <= maxRating;
  });

  // If filtered set is too small, relax rating bounds slightly
  if (filtered.length < 5) {
    filtered = problems;
  }

  // Sort by topic overlap with profileTags if present
  if (profileTags.length > 0) {
    filtered.sort((a, b) => {
      const aMatch = (a.tags || []).some(t => profileTags.some(pt => t.toLowerCase().includes(pt) || pt.includes(t.toLowerCase())));
      const bMatch = (b.tags || []).some(t => profileTags.some(pt => t.toLowerCase().includes(pt) || pt.includes(t.toLowerCase())));
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });
  }

  // Map to normalized result structure
  const results = filtered.slice(0, 20).map((prob) => ({
    id: `codeforces-${prob.id || prob.slug}`,
    source: 'codeforces',
    title: prob.name,
    description: prob.description || `Codeforces problem rated ${prob.rating || 1200}`,
    url: prob.url || `https://codeforces.com/problemset/problem/${prob.id}/A`,
    company: profile.company || (prob.companies ? prob.companies[0] : null),
    role: profile.role || null,
    topics: prob.topics || prob.tags || ['Algorithms'],
    difficulty: prob.difficulty || (prob.rating > 1400 ? 'Hard' : prob.rating > 1000 ? 'Medium' : 'Easy'),
    tags: prob.tags || [],
    author: prob.author || 'Codeforces',
    createdAt: new Date().toISOString(),
    metadata: {
      rating: prob.rating || 1200,
      slug: prob.slug || prob.name.toLowerCase().replace(/\s+/g, '-'),
    },
  }));

  return results;
};

export default searchCodeforces;
