import api from './axios'

// ---- Headlines & search ----

export const fetchHeadlines = (country, category) =>
  api
    .get(`/news/${country}`, { params: category ? { category } : {} })
    .then((r) => r.data)

export const searchNews = (query, country) =>
  api
    .get('/news/search', { params: { q: query, ...(country ? { country } : {}) } })
    .then((r) => r.data)

export const fetchSupportedCountries = () => api.get('/news/countries').then((r) => r.data)

// ---- Bookmarks ----
// Bookmarks live in this file (rather than a separate bookmarkApi.js) since they're
// really just a saved subset of news articles and share the same axios instance.

export const getBookmarks = () => api.get('/bookmarks').then((r) => r.data)

export const addBookmark = (articleId) => api.post('/bookmarks', { articleId }).then((r) => r.data)

export const removeBookmark = (articleId) =>
  api.delete(`/bookmarks`, { params: { articleId } }).then((r) => r.data)