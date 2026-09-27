const { SUPPORTED_COUNTRIES } = require('../config/countries');
const Article = require('../models/Article');
const Bookmark = require('../models/Bookmark');
const FetchLog = require('../models/FetchLog');
const googleNewsClient = require('./googleNewsClient');
const env = require('../config/env');

//const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/** Top headlines for a country, category optional. Ported from NewsService.java:
 *  kicks off a background refresh and returns whatever's already cached immediately
 *  (stale-while-revalidate) rather than waiting on the network. */
async function getHeadlines(country, category, userIdOrNull) {
  validateCountry(country);
  const cacheKey = buildCacheKey(country, category, null);

  const query = category
    ? { country, categories: category }
    : { country };

  const hasCachedArticles = await Article.exists(query);

  if (hasCachedArticles) {
    // Already have something to show — refresh in the background and return
    // immediately (stale-while-revalidate), same as before.
    refreshFromProvider(country, category, null, cacheKey).catch((err) =>
      console.error(`[newsService] Background refresh failed for ${cacheKey}: ${err.message}`)
    );
  } else {
    // Nothing cached yet (e.g. right after the startup wipe, or the scheduler
    // just hasn't reached this country) — wait for the real fetch instead of
    // handing back an empty list.
    await refreshFromProvider(country, category, null, cacheKey);
  }

  const articles = await Article.find(query).sort({ timestamp: -1 }).lean();
  return toDtoList(articles, userIdOrNull);
}

/** Keyword search, optionally scoped to a country. Always refreshes synchronously first. */
async function searchNews(country, searchQuery, userIdOrNull) {
  if (!searchQuery || !searchQuery.trim()) {
    const err = new Error("Search query 'q' must not be empty");
    err.status = 400;
    throw err;
  }
  const normalizedCountry = country && country.trim() ? country : null;
  if (normalizedCountry) validateCountry(normalizedCountry);

  const cacheKey = buildCacheKey(normalizedCountry, null, searchQuery);
  await refreshFromProvider(normalizedCountry, null, searchQuery, cacheKey);

  const titleRegex = new RegExp(escapeRegex(searchQuery), 'i');
  const mongoQuery = normalizedCountry
    ? { country: normalizedCountry, title: titleRegex }
    : { title: titleRegex };
  const articles = await Article.find(mongoQuery).sort({ timestamp: -1 }).lean();

  return toDtoList(articles, userIdOrNull);
}

/** Used by the scheduler to proactively refresh one country's general headlines. */
async function refreshCountryHeadlines(country) {
  const cacheKey = buildCacheKey(country, null, null);
  await refreshFromProvider(country, null, null, cacheKey);
}

async function refreshFromProvider(country, category, searchQuery, cacheKey) {
  try {
    const fetched = await googleNewsClient.fetchNews(country, category, searchQuery);

    if (fetched.length === 0) {
      console.warn(`[newsService] No articles returned for ${cacheKey}. Skipping cache update.`);
      return;
    }

    const targetCountry = country && country.trim() ? country.toLowerCase() : 'world';

    // Only wipe the country's articles on a general refresh (no category, no search
    // query) — category/search refreshes append instead, same as the original.
    if (!searchQuery && !category) {
      await Article.deleteMany({ country: targetCountry });
    }

    const batch = [];

    for (const na of fetched) {
      if (!na.link || !na.title) continue;

      const timestamp = parseDateToTimestamp(na.pubDate);

      batch.push({
        articleId: na.link,
        title: na.title,
        description: na.description,
        link: na.link,
        imageUrl: na.imageUrl,
        sourceName: na.sourceName,
        pubDate: na.pubDate,
        timestamp,
        country: targetCountry,
        cachedAt: new Date(),
        content: '',
        sourceId: na.sourceName,
        language: 'en',
        categories: category ? [category] : [],
        keywords: [],
      });
    }

    if (batch.length > 0) {
      await Article.insertMany(batch);
    }

    await FetchLog.findOneAndUpdate(
      { cacheKey },
      { cacheKey, lastFetchedAt: new Date() },
      { upsert: true }
    );
  } catch (ex) {
    console.error(`[newsService] Refresh failed for cacheKey=${cacheKey}: ${ex.message}`);
  }
}

/** Ported from NewsService.java's parseDateToTimestamp — same four format attempts,
 *  in the same order, same fallback to "now" if none match. */
function parseDateToTimestamp(dateStr) {
  if (!dateStr || !dateStr.trim()) return Date.now();
  const clean = dateStr.trim();

  // 1. Strict ISO-8601 with Z (e.g. "2026-09-22T12:30:00Z")
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(clean)) {
    const t = Date.parse(clean);
    if (!Number.isNaN(t)) return t;
  }

  // 2. "yyyy-MM-dd HH:mm:ss" (no 'T', assumed UTC)
  const dbMatch = clean.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
  if (dbMatch) {
    const [, y, mo, d, h, mi, s] = dbMatch.map(Number);
    const t = Date.UTC(y, mo - 1, d, h, mi, s);
    if (!Number.isNaN(t)) return t;
  }

  // 3. RFC-1123 / RSS date format (e.g. "Thu, 23 Jul 2026 12:30:00 GMT")
  if (/^[A-Za-z]{3},\s\d{1,2}\s[A-Za-z]{3}\s\d{4}\s\d{2}:\d{2}:\d{2}\s/.test(clean)) {
    const t = Date.parse(clean);
    if (!Number.isNaN(t)) return t;
  }

  // Fallback: unparsable -> "now", so it doesn't get incorrectly filtered out as stale.
  return Date.now();
}

function isStale(cacheKey) {
  // Present for parity with the original's isStale()/cacheTtlMinutes — declared but,
  // as in the uploaded project, not actually called from getHeadlines/searchNews
  // anymore (both always refresh instead of checking staleness first).
  return FetchLog.findOne({ cacheKey }).then((log) => {
    if (!log) return true;
    return Date.now() - log.lastFetchedAt.getTime() > env.cacheTtlMinutes * 60 * 1000;
  });
}

function buildCacheKey(country, category, searchQuery) {
  return `${country ? country.toLowerCase() : '*'}|${category ? category.toLowerCase() : '*'}|${
    searchQuery ? searchQuery.toLowerCase() : ''
  }`;
}

function validateCountry(country) {
  if (!SUPPORTED_COUNTRIES[country]) {
    const err = new Error(`Unsupported country code: ${country}`);
    err.status = 400;
    throw err;
  }
}

async function toDtoList(articles, userIdOrNull) {
  const dtos = articles.map((a) => ({
    articleId: a.articleId,
    title: a.title,
    description: a.description,
    link: a.link,
    imageUrl: a.imageUrl,
    sourceName: a.sourceName,
    pubDate: a.pubDate,
    country: a.country,
    categories: a.categories || [],
    language: a.language,
    bookmarked: false,
  }));

  if (userIdOrNull) {
    const articleIds = dtos.map((d) => d.articleId);
    const bookmarked = await Bookmark.find(
      { userId: userIdOrNull, articleId: { $in: articleIds } },
      { articleId: 1 }
    ).lean();
    const bookmarkedSet = new Set(bookmarked.map((b) => b.articleId));
    dtos.forEach((d) => {
      d.bookmarked = bookmarkedSet.has(d.articleId);
    });
  }

  return dtos;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  getHeadlines,
  searchNews,
  refreshCountryHeadlines,
  isStale,
};
