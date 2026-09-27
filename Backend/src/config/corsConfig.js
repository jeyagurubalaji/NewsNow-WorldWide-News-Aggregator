const env = require('./env');

// Mirrors CorsConfig.java: allow the configured origins, standard methods, all
// headers, and credentials (so the frontend's Authorization header gets through).
const corsOptions = {
  origin: env.corsAllowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['*'],
  credentials: true,
};

module.exports = { corsOptions };
