import { Navigate } from 'react-router-dom'
import { DEFAULT_COUNTRY } from '../constants/countries'

// Home just resolves to the reader's last-used (or default) country edition.
// The real page — selector, category tabs, grid — lives in CountryNews.jsx.
export default function Home() {
  const preferred = localStorage.getItem('newsnow_country') || DEFAULT_COUNTRY
  return <Navigate to={`/country/${preferred}`} replace />
}
