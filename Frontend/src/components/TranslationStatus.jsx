// frontend/src/components/TranslationStatus.jsx
import { useEffect, useState } from 'react'
import { subscribeTranslationStatus } from './NllbTranslate.jsx'

export default function TranslationStatus() {
  const [status, setStatus] = useState({ loading: false, error: null })

  useEffect(() => subscribeTranslationStatus(setStatus), [])

  if (!status.loading && !status.error) return null

  const statusClass = status.error
    ? 'newsnow-translation-status newsnow-translation-status--error'
    : 'newsnow-translation-status newsnow-translation-status--loading'

  return (
    <div
      role="status"
      aria-live="polite"
      data-no-translate
      className={statusClass}
    >
      {status.loading ? 'Translating NewsNow…' : status.error}
    </div>
  )
}