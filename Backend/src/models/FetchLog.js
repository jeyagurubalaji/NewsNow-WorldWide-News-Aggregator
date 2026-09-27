const mongoose = require('mongoose');

// Tracks the last time a given (country, category, query) combination was fetched,
// keyed by a "country|category|query" cache key. Currently written on every refresh
// for parity with the original, though (as in the uploaded project) neither
// getHeadlines nor searchNews actually gate on staleness anymore — see newsService.js.
const fetchLogSchema = new mongoose.Schema({
  cacheKey: { type: String, required: true, unique: true },
  lastFetchedAt: { type: Date },
});

module.exports = mongoose.model('FetchLog', fetchLogSchema, 'fetch_log');
