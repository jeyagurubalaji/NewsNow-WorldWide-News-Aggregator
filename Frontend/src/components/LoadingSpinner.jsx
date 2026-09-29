export default function LoadingSpinner({ label = 'Loading the wire…' }) {
  return (
    <div className="spinner-wrap" role="status" aria-live="polite">
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '1.5rem 2rem',
          textAlign: 'center',
          maxWidth: '420px',
          margin: '0 auto',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
        }}
      >
        <span className="spinner" style={{ display: 'block', margin: '0 auto 12px auto' }} />
        <span
          className="spinner-wrap__label"
          style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}
        >
          {label}
        </span>
        <p style={{ fontSize: '0.85rem', opacity: 0.8, margin: 0, lineHeight: 1.4 }}>
          Please be patient. Google News RSS takes time because we gather data from 195 countries!
        </p>
      </div>
    </div>
  )
}