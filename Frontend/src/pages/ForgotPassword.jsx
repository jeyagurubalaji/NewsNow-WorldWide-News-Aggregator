import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import LanguageSwitcher from '../components/LanguageSwitcher'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await api.post('/auth/forgot-password', { email })
      // Navigate to OTP entry page with email state
      navigate('/reset-password', { state: { email } })
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-lang-center skiptranslate">
          <LanguageSwitcher />
        </div>

        <p className="auth-card__eyebrow">RESET PASSWORD</p>
        <h1 className="auth-card__title">Forgot Password</h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: '0.85rem', marginBottom: '20px' }}>
          Enter your email to receive a 6-digit OTP code.
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? 'SENDING OTP…' : 'SEND RESET OTP'}
          </button>
        </form>

        <p className="auth-switch" style={{ marginTop: '20px' }}>
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}