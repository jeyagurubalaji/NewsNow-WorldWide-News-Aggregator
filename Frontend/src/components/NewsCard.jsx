import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { addBookmark, removeBookmark } from '../api/newsApi'

function formatDateTime(pubDate) {
  if (!pubDate) return ''
  const parsed = new Date(pubDate)
  if (isNaN(parsed.getTime())) return pubDate

  const formattedDate = parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const formattedTime = parsed.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const seconds = Math.floor((Date.now() - parsed.getTime()) / 1000)
  let relative = ''
  if (seconds < 60) relative = 'just now'
  else if (seconds < 3600) relative = `${Math.floor(seconds / 60)}m ago`
  else if (seconds < 86400) relative = `${Math.floor(seconds / 3600)}h ago`
  else relative = `${Math.floor(seconds / 86400)}d ago`

  return `${formattedDate} ${formattedTime} (${relative})`
}

export default function NewsCard({ article }) {
  const { user } = useAuth()
  const [bookmarked, setBookmarked] = useState(article.bookmarked)
  const [busy, setBusy] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage('')
    }, 2500)
  }

  const toggleBookmark = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user || busy) return
    setBusy(true)

    const targetId = article.articleId || article.link

    try {
      if (bookmarked) {
        await removeBookmark(targetId)
        setBookmarked(false)
        showToast('Bookmark removed successfully')
      } else {
        await addBookmark(targetId)
        setBookmarked(true)
        showToast('Bookmark saved successfully!')
      }
    } catch (error) {
      const errCode = error.response ? error.response.status : error.message
      alert(`Failed to save! Error Code: ${errCode}`)
      console.error('Bookmark Error:', error)
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="news-card" style={{ position: 'relative' }}>
      {toastMessage && (
        <div className="news-card__toast">
          {toastMessage}
        </div>
      )}

      <a
        className="news-card__media"
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
      >
        {article.imageUrl ? (
          <img src={article.imageUrl} alt="" loading="lazy" />
        ) : (
          <div className="news-card__media news-card__media--placeholder">
            <span>N°</span>
          </div>
        )}
      </a>

      <div className="news-card__body">
        <div className="news-card__meta">
          <span className="news-card__source">{article.sourceName || 'Unknown source'}</span>
          <span className="news-card__dot">·</span>
          <span className="news-card__time">{formatDateTime(article.pubDate)}</span>
        </div>

        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="news-card__title"
        >
          {article.title}
        </a>

        {article.description && <p className="news-card__desc">{article.description}</p>}

        <div className="news-card__footer">
          <div className="news-card__tags">
            {(article.categories || []).slice(0, 2).map((cat) => (
              <span key={cat} className="news-card__tag">
                {cat}
              </span>
            ))}
          </div>

          {user && (
            <button
              className={`news-card__bookmark ${bookmarked ? 'news-card__bookmark--active' : ''}`}
              onClick={toggleBookmark}
              disabled={busy}
              aria-label={bookmarked ? 'Remove bookmark' : 'Save article'}
              title={bookmarked ? 'Remove bookmark' : 'Save article'}
            >
              {bookmarked ? '★' : '☆'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}