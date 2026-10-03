import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SearchBar from './SearchBar'
import LanguageSwitcher from './LanguageSwitcher'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = () => setMenuOpen(!menuOpen)
  const closeMenu = () => setMenuOpen(false)

  const handleLogout = () => {
    logout()
    closeMenu()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="container navbar__row">

        {/* Brand / Logo */}
        <Link to="/" className="navbar__brand" onClick={closeMenu}>
          <span className="navbar__mark">N°</span>
          NewsNow
        </Link>

        {/* Search Bar */}
        <div className="navbar__search">
          <SearchBar />
        </div>

        {/* Center Item: True Detective AI Button (Always Visible) */}
        <div className="navbar__detective">
          <NavLink
            to="/detective"
            className="navbar__link"
            onClick={closeMenu}
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

        {/* Hamburger Three-Bar Icon (Mobile Only) */}
        <button
          className="navbar__hamburger"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-bar ${menuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-bar ${menuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-bar ${menuOpen ? 'open' : ''}`}></span>
        </button>

        {/* Navigation Actions (Row on Desktop, Collapsible Drawer on Mobile) */}
        <nav className={`navbar__nav ${menuOpen ? 'navbar__nav--open' : ''}`}>
          <div onClick={closeMenu}>
            <LanguageSwitcher />
          </div>

          {user ? (
            <>
              <Link to="/" className="navbar__link" onClick={closeMenu}>
                📅 Latest News
              </Link>

              <Link to="/bookmarks" className="navbar__link" onClick={closeMenu}>
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
              <Link to="/login" className="navbar__link" onClick={closeMenu}>
                Sign in
              </Link>
              <Link to="/register" className="navbar__cta" onClick={closeMenu}>
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}