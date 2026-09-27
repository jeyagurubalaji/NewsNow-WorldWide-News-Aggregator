import { useCallback, useEffect, useState } from 'react'
import { fetchHeadlines, searchNews } from '../api/newsApi'

const AUTO_REFRESH_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Fetches news either by (country, category) or by a keyword query
 * (optionally scoped to a country), and keeps itself fresh on an interval.
 *
 * Usage:
 *   useNews({ country: 'us', category: 'business' })   // headlines mode
 *   useNews({ query: 'election', country: 'us' })       // search mode (country optional)
 */
export function useNews({ country, category, query } = {}) {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const trimmedQuery = query?.trim()

  const load = useCallback(async () => {
    if (!trimmedQuery && !country) return

    setLoading(true)
    setError(null)
    try {
      const data = trimmedQuery
        ? await searchNews(trimmedQuery, country)
        : await fetchHeadlines(country, category)
      setArticles(data)
      setLastUpdated(new Date())
    } catch (err) {
      setError(
        err.response?.data?.message || 'Could not load news right now. Please try again shortly.'
      )
    } finally {
      setLoading(false)
    }
  }, [country, category, trimmedQuery])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const interval = setInterval(load, AUTO_REFRESH_MS)
    return () => clearInterval(interval)
  }, [load])

  return { articles, loading, error, lastUpdated, refresh: load }
}
