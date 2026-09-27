import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import DarkModeToggle from './DarkModeToggle'
import SearchBar from './SearchBar'
import LanguageSwitcher from './LanguageSwitcher'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="container navbar__row">

        {/* Brand / Logo */}
        <Link to="/" className="navbar__brand">
          <span className="navbar__mark">N°</span>
          NewsNow
        </Link>

        {/* Search Bar */}
        <div className="navbar__search">
          <SearchBar />
        </div>

        {/* Navigation Actions */}
        <nav className="navbar__nav">
          <DarkModeToggle />
          <LanguageSwitcher />

          {user ? (
            <>
              <Link to="/" className="navbar__link">
                📅 Latest News
              </Link>

              <Link to="/bookmarks" className="navbar__link">
                ⭐ Bookmarks
              </Link>

              <div className="navbar__user">
                <span className="navbar__hello">{user.fullName?.split(' ')[0]}</span>
                <button className="navbar__link navbar__link--btn" onClick={handleLogout}>
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar__link">
                Sign in
              </Link>
              <Link to="/register" className="navbar__cta">
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}