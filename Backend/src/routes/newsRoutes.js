const express = require('express');
const newsController = require('../controllers/newsController');
const { optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// All of /api/news/** is public (matches SecurityConfig.java's permitAll on GET
// /api/news/**), but optionalAuth still resolves req.userEmail when a token IS
// present, so the per-article "bookmarked" flag works for logged-in readers.
router.use(optionalAuth);

router.get('/countries', newsController.getSupportedCountries);
router.get('/categories', newsController.getCategories);
router.get('/search', newsController.search);
router.get('/:country', newsController.getHeadlines);

module.exports = router;
