const Article = require('../models/Article');
const Bookmark = require('../models/Bookmark');
const ApiError = require('../utils/ApiError');

async function addBookmark(userId, articleId) {
  const existing = await Bookmark.findOne({ userId, articleId });
  if (existing) return existing;

  // Grab the first matching article and ignore any duplicates in Mongo — same fix
  // as the uploaded BookmarkService.java (articleId has no unique index; refreshes
  // for category/search results can create more than one row per link).
  const article = await Article.findOne({ articleId });
  if (!article) {
    throw new ApiError(404, `Article not found: ${articleId}`);
  }

  return Bookmark.create({
    userId,
    articleId: article.articleId,
    title: article.title,
    description: article.description,
    link: article.link,
    imageUrl: article.imageUrl,
    sourceName: article.sourceName,
    pubDate: article.pubDate,
    country: article.country,
  });
}

async function removeBookmark(userId, articleId) {
  await Bookmark.deleteOne({ userId, articleId });
}

async function getUserBookmarks(userId) {
  return Bookmark.find({ userId }).sort({ savedAt: -1 }).lean();
}

module.exports = { addBookmark, removeBookmark, getUserBookmarks };
