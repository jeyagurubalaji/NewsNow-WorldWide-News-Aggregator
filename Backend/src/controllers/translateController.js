const { translateText, SUPPORTED_LANGUAGES } = require('../utils/translate');
const ApiError = require('../utils/ApiError');

function getLanguages(req, res) {
  res.json(SUPPORTED_LANGUAGES);
}

// GET /api/translate?text=...&target=fr&source=auto
async function translate(req, res, next) {
  try {
    const { text, target, source } = req.query;
    if (!text) throw new ApiError(400, "Query param 'text' is required");
    if (!target) throw new ApiError(400, "Query param 'target' is required");

    const result = await translateText(text, target, source || 'auto');
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// POST /api/translate/batch { texts: string[], target: 'fr', source?: 'auto' }
// Translates a batch (e.g. a page of article titles) with limited concurrency so a
// large batch doesn't fire dozens of simultaneous requests at Google at once.
async function translateBatch(req, res, next) {
  try {
    const { texts, target, source } = req.body;
    if (!Array.isArray(texts) || texts.length === 0) {
      throw new ApiError(400, "Body field 'texts' must be a non-empty array");
    }
    if (!target) throw new ApiError(400, "Body field 'target' is required");

    const pLimit = require('p-limit');
    const limit = pLimit(5);
    const results = await Promise.all(
      texts.map((text) => limit(() => translateText(text, target, source || 'auto')))
    );

    res.json(results);
  } catch (err) {
    next(err);
  }
}

module.exports = { getLanguages, translate, translateBatch };
