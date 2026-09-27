const { SUPPORTED_COUNTRIES, CATEGORIES } = require('../config/countries');
const newsService = require('../services/newsService');

function getSupportedCountries(req, res) {
  res.json(SUPPORTED_COUNTRIES);
}

function getCategories(req, res) {
  res.json(CATEGORIES);
}

async function getHeadlines(req, res, next) {
  try {
    const country = req.params.country.toLowerCase();
    const { category } = req.query;
    const articles = await newsService.getHeadlines(country, category, req.userEmail);
    res.json(articles);
  } catch (err) {
    next(err);
  }
}

async function search(req, res, next) {
  try {
    const { q, country } = req.query;
    const normalizedCountry = country ? country.toLowerCase() : null;
    const articles = await newsService.searchNews(normalizedCountry, q, req.userEmail);
    res.json(articles);
  } catch (err) {
    next(err);
  }
}

module.exports = { getSupportedCountries, getCategories, getHeadlines, search };
