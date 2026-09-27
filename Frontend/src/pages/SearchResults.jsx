import { useSearchParams } from 'react-router-dom'
import { useNews } from '../hooks/useNews'
import CountrySelector from '../components/CountrySelector'
import LoadingSpinner from '../components/LoadingSpinner'
import NewsCard from '../components/NewsCard'

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const country = searchParams.get('country') || ''

  const { articles, loading, error, refresh } = useNews({
    query,
    country: country || undefined,
  })

  const handleCountryChange = (newCountry) => {
    const next = new URLSearchParams(searchParams)
    if (newCountry) {
      next.set('country', newCountry)
    } else {
      next.delete('country')
    }
    setSearchParams(next)
  }

  if (!query) {
    return (
      <main className="container page-section">
        <p className="status-message">Type something in the search box above to get started.</p>
      </main>
    )
  }

  return (
    <main className="container page-section">
      <h1 className="page-section__title">
        Results for <span className="page-section__title-accent">"{query}"</span>
      </h1>

      <div className="page-section__controls">
        <CountrySelector value={country} onChange={handleCountryChange} allowAll />
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button className="error-banner__retry" onClick={refresh}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner label="Searching the wire…" />
      ) : articles.length ? (
        <div className="news-grid">
          {articles.map((article) => (
            <NewsCard key={article.articleId} article={article} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p className="empty-state__title">No stories matched "{query}".</p>
          <p className="empty-state__sub">Try a broader term or clear the country filter.</p>
        </div>
      )}
    </main>
  )
}
