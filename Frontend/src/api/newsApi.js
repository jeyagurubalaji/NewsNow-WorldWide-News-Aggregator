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

export const getBookmarks = () => api.get('/bookmarks').then((r) => r.data)

export const addBookmark = (article) => {
  // Extract string articleId whether 'article' is an object or string ID
  const articleId =
    typeof article === 'object' && article !== null
      ? article.articleId || article.link || article.url
      : article

  return api.post('/bookmarks', { articleId }).then((r) => r.data)
}

export const removeBookmark = (articleId) =>
  api.delete('/bookmarks', { params: { articleId } }).then((r) => r.data)