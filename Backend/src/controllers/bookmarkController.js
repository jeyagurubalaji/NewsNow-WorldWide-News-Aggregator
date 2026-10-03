const bookmarkService = require('../services/bookmarkService');

async function getBookmarks(req, res, next) {
  try {
    const bookmarks = await bookmarkService.getUserBookmarks(req.userEmail);
    res.json(bookmarks);
  } catch (err) {
    next(err);
  }
}

async function addBookmark(req, res, next) {
  try {
    let { articleId } = req.body;

    // Handle nested or object body fallback
    if (typeof articleId === 'object' && articleId !== null) {
      articleId = articleId.articleId || articleId.link || articleId.url;
    }

    if (!articleId) {
      const ApiError = require('../utils/ApiError');
      throw new ApiError(400, 'articleId is required');
    }

    const bookmark = await bookmarkService.addBookmark(req.userEmail, articleId);
    res.json(bookmark);
  } catch (err) {
    next(err);
  }
}

async function removeBookmark(req, res, next) {
  try {
    await bookmarkService.removeBookmark(req.userEmail, req.query.articleId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getBookmarks, addBookmark, removeBookmark };