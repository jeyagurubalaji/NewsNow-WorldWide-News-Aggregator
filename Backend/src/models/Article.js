const mongoose = require('mongoose');

// Mirrors the uploaded project's Article.java: articleId is the article's link
// (Google News RSS entries don't have a NewsData-style unique id), and there is no
// unique index on articleId — refreshFromProvider can insert duplicates for
// category/search refreshes, same as the Java version being replaced.
const articleSchema = new mongoose.Schema({
  articleId: { type: String },
  title: { type: String },
  description: { type: String },
  link: { type: String },
  imageUrl: { type: String },
  sourceName: { type: String },
  pubDate: { type: String },
  timestamp: { type: Number }, // epoch ms, for true chronological sorting
  country: { type: String },
  cachedAt: { type: Date, default: Date.now },
  content: { type: String, default: '' },
  sourceId: { type: String },
  language: { type: String, default: 'en' },
  categories: { type: [String], default: [] },
  keywords: { type: [String], default: [] },
});

module.exports = mongoose.model('Article', articleSchema, 'articles');
