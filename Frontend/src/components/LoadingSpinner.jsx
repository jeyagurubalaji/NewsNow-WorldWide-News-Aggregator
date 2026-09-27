export default function LoadingSpinner({ label = 'Loading the wire…' }) {
  return (
    <div className="spinner-wrap" role="status" aria-live="polite">
      <span className="spinner" />
      <span className="spinner-wrap__label">{label}</span>
    </div>
  )
}
