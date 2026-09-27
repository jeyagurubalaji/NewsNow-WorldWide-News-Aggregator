import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

/**
 * Global search box, used inside Navbar. Always navigates to /search?q=...
 * so results have their own shareable URL (see pages/SearchResults.jsx).
 */
export default function SearchBar() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [draft, setDraft] = useState(params.get('q') || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    const q = draft.trim()
    if (!q) return
    navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <input
        className="search-bar__input"
        type="text"
        placeholder="Search headlines…"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        aria-label="Search news"
      />
      <button type="submit" className="search-bar__submit">
        Search
      </button>
    </form>
  )
}
