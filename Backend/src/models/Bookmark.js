const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  articleId: { type: String, required: true },
  // Snapshot of article fields so bookmarks still render even if the cached article expires
  title: { type: String },
  description: { type: String },
  link: { type: String },
  imageUrl: { type: String },
  sourceName: { type: String },
  pubDate: { type: String },
  country: { type: String },
  savedAt: { type: Date, default: Date.now },
});

bookmarkSchema.index({ userId: 1, articleId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema, 'bookmarks');
