require('dotenv').config();

/**
 * Central place every other file reads config from — mirrors the @Value-injected
 * fields from the Spring Boot application.properties this replaces.
 */
module.exports = {
  port: process.env.PORT || 8080,

  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/newsnow',

  jwtSecret: process.env.JWT_SECRET || 'change-this-super-secret-key-min-32-chars-long-please',
  jwtExpirationMs: Number(process.env.JWT_EXPIRATION_MS || 86400000),

  googleNewsRssBaseUrl: process.env.GOOGLE_NEWS_RSS_BASE_URL || 'https://news.google.com/rss',

  // How often the scheduler refreshes every country's headlines (ms).
  refreshIntervalMs: Number(process.env.NEWS_REFRESH_INTERVAL_MS || 300000),
  // How many countries can be fetched concurrently in one scheduler burst.
  refreshConcurrency: Number(process.env.NEWS_REFRESH_CONCURRENCY || 15),
  refreshSoftCapMs: Number(process.env.NEWS_REFRESH_SOFT_CAP_MS || 20000),

  // Present for parity with the original config; not currently read by any code path
  // (kept as reserved/no-op flags, matching the uploaded project's state).
  schedulerApiDelayMs: Number(process.env.NEWS_SCHEDULER_API_DELAY_MS || 250),
  newsApiFallbackEnabled: (process.env.NEWSAPI_FALLBACK_ENABLED || 'true') === 'true',

  cacheTtlMinutes: Number(process.env.NEWS_CACHE_TTL_MINUTES || 5),

  corsAllowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:5173').split(','),
};
