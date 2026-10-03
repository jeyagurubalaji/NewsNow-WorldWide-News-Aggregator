import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { addBookmark, removeBookmark } from '../api/newsApi'
import ShareModal from './ShareModal'

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

export default function NewsCard({ article, index, activeSpeechIndex, isSpeaking, onToggleSpeech }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookmarked, setBookmarked] = useState(article.bookmarked)
  const [busy, setBusy] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [showShareModal, setShowShareModal] = useState(false)

  // Determines if this specific card is currently playing
  const isCurrentlyPlaying = activeSpeechIndex === index && isSpeaking

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage('')
    }, 2500)
  }

  const handleSpeechClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleSpeech(index)
  }

  const openShareModal = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setShowShareModal(true)
  }

  const toggleBookmark = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    // 1. Guard against unauthenticated users
    if (!user) {
      alert('Please sign in to save articles to your bookmarks.')
      navigate('/login')
      return
    }

    if (busy) return
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

      // 2. Catch 401 Unauthorized / expired token specifically
      if (error.response?.status === 401) {
        alert('Your session has expired. Please sign in again.')
        navigate('/login')
      } else {
        alert(`Failed to update bookmark. Error Code: ${errCode}`)
      }
      console.error('Bookmark Error:', error)
    } finally {
      setBusy(false)
    }
  }

  // --- Strict Deduplication Logic ---
  const normalize = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '')

  const normTitle = normalize(article.title)
  const normDesc = normalize(article.description)

  const isDuplicateDesc =
    !normDesc ||
    normDesc === normTitle ||
    normDesc.startsWith(normTitle.slice(0, 15)) ||
    normTitle.startsWith(normDesc.slice(0, 15))

  return (
    <>
      <article
        className="news-card"
        style={{
          position: 'relative',
          border: isCurrentlyPlaying ? '2px solid #ef4444' : undefined,
        }}
      >
        {toastMessage && <div className="news-card__toast">{toastMessage}</div>}

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

          {!isDuplicateDesc && <p className="news-card__desc">{article.description}</p>}

          <div className="news-card__footer">
            <div className="news-card__tags">
              {(article.categories || []).slice(0, 2).map((cat) => (
                <span key={cat} className="news-card__tag">
                  {cat}
                </span>
              ))}
            </div>

            <div className="news-card__actions">
              <button
                type="button"
                className={`news-card__action-btn ${
                  isCurrentlyPlaying ? 'news-card__action-btn--active' : ''
                }`}
                onClick={handleSpeechClick}
                title={isCurrentlyPlaying ? 'Stop Listening' : 'Listen to Story'}
              >
                {isCurrentlyPlaying ? '⏹ Stop' : '🔊 Listen'}
              </button>

              <button
                type="button"
                className="news-card__action-btn"
                onClick={openShareModal}
                title="Share & QR Code"
              >
                🔗 Share
              </button>

              <button
                type="button"
                className={`news-card__bookmark ${
                  bookmarked ? 'news-card__bookmark--active' : ''
                }`}
                onClick={toggleBookmark}
                disabled={busy}
                aria-label={bookmarked ? 'Remove bookmark' : 'Save article'}
                title={bookmarked ? 'Remove bookmark' : 'Save article'}
              >
                {bookmarked ? '★' : '☆'}
              </button>
            </div>
          </div>
        </div>
      </article>

      {showShareModal && (
        <ShareModal
          article={{ title: article.title, url: article.link }}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  )
}