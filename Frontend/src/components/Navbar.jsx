import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
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

        {/* Center Item: True Detective AI Button */}
        <div className="navbar__detective">
          <NavLink
            to="/detective"
            className="navbar__link"
            style={({ isActive }) => ({
              backgroundColor: isActive ? '#dc2626' : '#ef4444',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '20px',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.9rem',
              transition: 'background-color 0.2s ease',
            })}
          >
            🕵️ True Detective AI
          </NavLink>
        </div>

        {/* Navigation Actions */}
        <nav className="navbar__nav">
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