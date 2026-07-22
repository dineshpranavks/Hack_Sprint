import scrapeLeetCode from './leetcode.js';
import scrapeGFG from './gfg.js';
import scrapeHackerRank from './hackerrank.js';
import scrapeInterviewBit from './interviewbit.js';

/**
 * Scraper Job Scheduler Module
 */

// TODO: Configure node-cron / scheduled execution for platform scrapers
export const startScraperScheduler = () => {
  console.log('[Scraper Scheduler] Initialized scraper cron jobs placeholder.');
};

export const runAllScrapers = async () => {
  console.log('[Scraper Scheduler] Triggering manual scrape across all platforms...');
  await Promise.all([
    scrapeLeetCode('all'),
    scrapeGFG('all'),
    scrapeHackerRank('all'),
    scrapeInterviewBit('all'),
  ]);
};

export default {
  startScraperScheduler,
  runAllScrapers,
};
