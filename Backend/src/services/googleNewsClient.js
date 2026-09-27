const axios = require('axios');
const cheerio = require('cheerio');
const RSSParser = require('rss-parser');
const env = require('../config/env');
const { SUPPORTED_COUNTRIES } = require('../config/countries');

const rssParser = new RSSParser();

const CATEGORY_POSTERS = {
  politics: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80',
  business: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
  technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
  sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80',
  entertainment: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
  science: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800&auto=format&fit=crop&q=80',
  health: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80',
  world: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80',
};
const DEFAULT_POSTER = CATEGORY_POSTERS.world;

/**
 * Fetches headlines from Google News RSS search (no API key). Mirrors the uploaded
 * project's NewsDataApiClient.java: builds a search query from country name + optional
 * category/keyword, splits "Title - Source" out of the RSS entry title, strips HTML
 * from the description to get plain text + a thumbnail (first <img> in the snippet),
 * and falls back to a category poster image when Google didn't supply one.
 */
async function fetchNews(countryCode, category, query) {
  const results = [];

  try {
    const countryName = SUPPORTED_COUNTRIES[countryCode] || 'World';
    let searchTerm = query && query.trim() ? `${query.trim()} ${countryName}` : countryName;
    if (category && category.trim()) {
      searchTerm += ` ${category.trim()}`;
    }

    const rssUrl = `${env.googleNewsRssBaseUrl}/search?q=${encodeURIComponent(searchTerm)}&hl=en-US&gl=US&ceid=US:en`;

    // Fetch the raw feed ourselves (rather than rss-parser's parseURL) so we control
    // the timeout and User-Agent the same way the original's HttpURLConnection did.
    const response = await axios.get(rssUrl, {
      timeout: 8000,
      headers: { 'User-Agent': 'Mozilla/5.0', Connection: 'close' },
    });

    const feed = await rssParser.parseString(response.data);

    for (const entry of feed.items || []) {
      const article = {};

      const rawTitle = entry.title || '';
      const dashIndex = rawTitle.lastIndexOf(' - ');
      if (dashIndex !== -1) {
        article.title = rawTitle.slice(0, dashIndex).trim();
        article.sourceName = rawTitle.slice(dashIndex + 3).trim();
      } else {
        article.title = rawTitle;
        article.sourceName = countryName;
      }

      article.link = entry.link;

      const descriptionHtml = entry.content || entry.contentSnippet || entry.summary;
      if (descriptionHtml) {
        const $ = cheerio.load(descriptionHtml);
        article.description = $.root().text().trim();

        const img = $('img').first();
        const src = img.attr('src');
        if (src) {
          article.imageUrl = src.startsWith('//') ? `https:${src}` : src;
        }
      }

      if (!article.imageUrl) {
        const posterKey = category && category.trim() ? category.toLowerCase() : 'world';
        article.imageUrl = CATEGORY_POSTERS[posterKey] || DEFAULT_POSTER;
      }

      // Stored the same way the original does: a Date object's default string form,
      // NOT the feed's original RFC-822 string. NewsService's date parser below only
      // recognizes a handful of specific formats and this isn't one of them, so — as
      // in the uploaded project — articles end up timestamped at fetch time rather
      // than their true publish time. Preserved as-is per "don't change any features";
      // swap this for `entry.pubDate` directly if you'd rather have true chronological
      // sorting (parseDateToTimestamp in newsService.js already handles RFC-822 dates).
      if (entry.pubDate) {
        const parsed = new Date(entry.pubDate);
        if (!Number.isNaN(parsed.getTime())) {
          // Store the RSS feed's original date string as-is (not Date.toString()) —
          // newsService's date parser recognizes this exact format and can recover
          // the true publish time from it. The old .toString() version didn't match
          // any recognized format, so every article silently fell back to "now".
          article.pubDate = entry.pubDate;
        }
      }

      results.push(article);
    }
  } catch (ex) {
    console.warn(`[googleNewsClient] Fetch aborted for ${countryCode} to maintain speed limit: ${ex.message}`);
  }

  return results;
}

module.exports = { fetchNews, CATEGORY_POSTERS, DEFAULT_POSTER };
