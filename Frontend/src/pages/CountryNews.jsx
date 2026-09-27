import { useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useNews } from '../hooks/useNews'
import { COUNTRIES } from '../constants/countries'
import CountrySelector from '../components/CountrySelector'
import CategoryTabs from '../components/CategoryTabs'
import LoadingSpinner from '../components/LoadingSpinner'
import NewsCard from '../components/NewsCard'

export default function CountryNews() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || ''

  const isSupported = COUNTRIES.some((c) => c.code === code)
  const { articles, loading, error, lastUpdated, refresh } = useNews({
    country: isSupported ? code : undefined,
    category,
  })

  // Remember the reader's last-viewed country so Home.jsx can redirect here next visit.
  useEffect(() => {
    if (isSupported) localStorage.setItem('newsnow_country', code)
  }, [code, isSupported])

  if (!isSupported) {
    return (
      <main className="container page-section">
        <p className="status-message">
          "{code}" isn't one of NewsNow's 15 supported countries.{' '}
          <button className="link-button" onClick={() => navigate('/country/us')}>
            Go to United States
          </button>
        </p>
      </main>
    )
  }

  return (
    <main className="container page-section">
      <div className="page-section__controls">
        <CountrySelector value={code} onChange={(newCode) => navigate(`/country/${newCode}`)} />

        {lastUpdated && (
          <span className="last-updated">
            {loading ? 'Refreshing…' : `Updated ${formatTimeAgo(lastUpdated)}`}
          </span>
        )}
      </div>

      <CategoryTabs
        value={category}
        onChange={(newCategory) => {
          if (newCategory) {
            setSearchParams({ category: newCategory })
          } else {
            setSearchParams({})
          }
        }}
      />

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button className="error-banner__retry" onClick={refresh}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner label={`Fetching ${code.toUpperCase()} headlines…`} />
      ) : articles.length ? (
        <div className="news-grid">
          {articles.map((article) => (
            <NewsCard key={article.articleId} article={article} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </main>
  )
}

function EmptyState() {
  return (
    <div className="empty-state">
      <p className="empty-state__title">No stories on the wire yet.</p>
      <p className="empty-state__sub">Try a different country or category.</p>
    </div>
  )
}

function formatTimeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}
