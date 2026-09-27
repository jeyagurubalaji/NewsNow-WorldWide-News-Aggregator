import { COUNTRIES } from '../constants/countries'

/**
 * Controlled country dropdown.
 * Renders clean text nodes inside <option> elements to allow full DOM translation.
 */
export default function CountrySelector({ value, onChange, allowAll = false }) {
  return (
    <div className="country-selector">
      <label htmlFor="country-select" className="country-selector__label">
        Dateline
      </label>
      <select
        id="country-select"
        className="country-selector__select"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      >
        {allowAll && <option value="">All countries</option>}
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  )
}