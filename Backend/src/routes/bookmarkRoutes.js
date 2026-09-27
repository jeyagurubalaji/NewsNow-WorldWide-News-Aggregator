const express = require('express');
const bookmarkController = require('../controllers/bookmarkController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);

router.get('/', bookmarkController.getBookmarks);
router.post('/', bookmarkController.addBookmark);
router.delete('/', bookmarkController.removeBookmark);

module.exports = router;