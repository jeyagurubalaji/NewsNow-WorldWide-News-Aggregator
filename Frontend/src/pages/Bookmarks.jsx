import { useEffect, useState } from 'react'
import { getBookmarks, removeBookmark } from '../api/newsApi'

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getBookmarks()
      .then(setBookmarks)
      .catch(() => setError('Could not load your saved articles.'))
      .finally(() => setLoading(false))
  }, [])

  const handleRemove = async (articleId) => {
      // Optimistically remove from UI instantly
      setBookmarks((prev) => prev.filter((b) => b.articleId !== articleId))
      try {
        await removeBookmark(articleId)
      } catch (err) {
        console.error("Failed to delete bookmark permanently:", err)
        // Re-fetch if it failed so the UI stays in sync with the database
        getBookmarks().then(setBookmarks)
      }
  }

  return (
    <main className="container page-section">
      <h1 className="page-section__title">Saved articles</h1>

      {loading && <p className="status-message">Loading…</p>}
      {error && <p className="status-message">{error}</p>}

      {!loading && !error && bookmarks.length === 0 && (
        <p className="status-message">
          You haven't saved anything yet. Tap the ☆ on any story to keep it here.
        </p>
      )}

      <div className="bookmarks-list">
        {bookmarks.map((b) => (
          <div className="bookmark-row" key={b.articleId}>
            {b.imageUrl && <img src={b.imageUrl} alt="" className="bookmark-row__img" />}
            <div className="bookmark-row__body">
              <a
                href={b.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bookmark-row__title"
              >
                {b.title}
              </a>
              <p className="bookmark-row__meta">
                {b.sourceName} · {b.country?.toUpperCase()}
              </p>
            </div>
            <button
              className="bookmark-row__remove"
              onClick={() => handleRemove(b.articleId)}
              aria-label="Remove bookmark"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}
