const express = require('express');
const cors = require('cors');
const { corsOptions } = require('./config/corsConfig');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const newsRoutes = require('./routes/newsRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const translateRoutes = require('./routes/translateRoutes');

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

app.get('/actuator/health', (req, res) => res.json({ status: 'UP' }));

app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/translate', translateRoutes);

// Must be registered last — Express only treats a 4-arg middleware as an error
// handler when nothing before it has already sent a response.
app.use(errorHandler);

module.exports = app;
