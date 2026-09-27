import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import NllbTranslate from './NllbTranslate'

export default function Layout() {
  return (
    <div className="page">
      {/* Hidden Google Translate script mounting point */}
      <NllbTranslate />
      
      <Navbar />
      <div className="page__body">
        <Outlet />
      </div>
      <footer className="footer">
        <div className="container footer__row">
          <span>NewsNow — wire desk for 195 countries.</span>
          <span>Headlines via https://news.google.com/rss Refreshes automatically.</span>
        </div>
      </footer>
    </div>
  )
}