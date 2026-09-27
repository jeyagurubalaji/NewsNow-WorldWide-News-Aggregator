const express = require('express');
const translateController = require('../controllers/translateController');

const router = express.Router();

// Public, like /api/news/** — translation doesn't need a logged-in user.
router.get('/languages', translateController.getLanguages);
router.get('/', translateController.translate);
router.post('/batch', translateController.translateBatch);

module.exports = router;
