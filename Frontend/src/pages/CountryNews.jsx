import { useState, useEffect, useRef, useMemo } from 'react'
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

  // --- Article Deduplication Helper ---
  const uniqueArticles = useMemo(() => {
    const seenTitles = new Set()
    const seenLinks = new Set()

    return (articles || []).filter((article) => {
      const normTitle = (article.title || '').toLowerCase().replace(/[^a-z0-9]/g, '')
      const link = article.link || article.articleId

      if (!normTitle || seenTitles.has(normTitle) || (link && seenLinks.has(link))) {
        return false
      }

      seenTitles.add(normTitle)
      if (link) seenLinks.add(link)
      return true
    })
  }, [articles])

  // Speech controller states
  const [activeSpeechIndex, setActiveSpeechIndex] = useState(null)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Ref to access current deduplicated articles in speech handlers without stale closures
  const articlesRef = useRef(uniqueArticles)
  useEffect(() => {
    articlesRef.current = uniqueArticles
  }, [uniqueArticles])

  // Stop reading when changing countries, categories, or unmounting
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setActiveSpeechIndex(null)
    setIsSpeaking(false)
  }, [code, category])

  // Continuous speech reader (reads each article ONCE without duplicate titles/descriptions)
  const speakArticle = (index) => {
    const currentArticles = articlesRef.current
    if (!('speechSynthesis' in window) || !currentArticles || index >= currentArticles.length) {
      window.speechSynthesis.cancel()
      setActiveSpeechIndex(null)
      setIsSpeaking(false)
      return
    }

    const synth = window.speechSynthesis
    synth.cancel() // Stop currently playing track

    const article = currentArticles[index]

    // --- Deduplication Logic for Speech ---
    const normalize = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '')
    const normTitle = normalize(article.title)
    const normDesc = normalize(article.description)

    const isDuplicateDesc =
      !normDesc ||
      normDesc === normTitle ||
      normDesc.startsWith(normTitle.slice(0, 15)) ||
      normTitle.startsWith(normDesc.slice(0, 15))

    // Read ONLY the title if description is a duplicate/empty; otherwise read title + description
    const textToRead = isDuplicateDesc
      ? article.title
      : `${article.title}. ${article.description}`

    const utterance = new SpeechSynthesisUtterance(textToRead)
    utterance.rate = 1.0

    // Automatically trigger next article when current article finishes speaking
    utterance.onend = () => {
      const nextIndex = index + 1
      if (nextIndex < articlesRef.current.length) {
        speakArticle(nextIndex)
      } else {
        setActiveSpeechIndex(null)
        setIsSpeaking(false)
      }
    }

    utterance.onerror = () => {
      setActiveSpeechIndex(null)
      setIsSpeaking(false)
    }

    setActiveSpeechIndex(index)
    setIsSpeaking(true)
    synth.speak(utterance)
  }

  const handleToggleSpeech = (index) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-Speech is not supported in your browser.')
      return
    }

    if (activeSpeechIndex === index && isSpeaking) {
      window.speechSynthesis.cancel()
      setActiveSpeechIndex(null)
      setIsSpeaking(false)
    } else {
      speakArticle(index)
    }
  }

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
      ) : uniqueArticles.length ? (
        <div className="news-grid">
          {uniqueArticles.map((article, index) => (
            <NewsCard
              key={article.articleId || article.link || index}
              article={article}
              index={index}
              activeSpeechIndex={activeSpeechIndex}
              isSpeaking={isSpeaking}
              onToggleSpeech={handleToggleSpeech}
            />
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