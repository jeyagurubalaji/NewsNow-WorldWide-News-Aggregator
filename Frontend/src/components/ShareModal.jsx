import React from 'react'
import { QRCodeSVG } from 'qrcode.react'

export default function ShareModal({ article, onClose }) {
  if (!article) return null

  const shareUrl = encodeURIComponent(article.url || window.location.href)
  const shareTitle = encodeURIComponent(article.title || 'Check out this news on NewsNow!')

  const shareLinks = [
    {
      name: 'WhatsApp',
      url: `https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`,
      color: '#25D366',
    },
    {
      name: 'X (Twitter)',
      url: `https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`,
      color: '#1DA1F2',
    },
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      color: '#0A66C2',
    },
    {
      name: 'Reddit',
      url: `https://www.reddit.com/submit?url=${shareUrl}&title=${shareTitle}`,
      color: '#FF4500',
    },
  ]

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h3>Share Article</h3>
          <button className="share-modal-close" onClick={onClose}>&times;</button>
        </div>

        <p className="share-modal-title">{article.title}</p>

        {/* Social Sharing Buttons */}
        <div className="share-buttons-grid">
          {shareLinks.map((platform) => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="share-btn"
              style={{ borderColor: platform.color, color: platform.color }}
            >
              {platform.name}
            </a>
          ))}
        </div>

        {/* QR Code Section */}
        <div className="share-qr-section">
          <p className="share-qr-label">Scan QR Code for Mobile Reading</p>
          <div className="share-qr-box">
            <QRCodeSVG value={article.url || window.location.href} size={150} />
          </div>
        </div>
      </div>
    </div>
  )
}