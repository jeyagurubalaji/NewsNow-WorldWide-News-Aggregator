import React from 'react'

export default function TrueDetectiveView() {
  return (
    <div className="container page-section" style={{ height: 'calc(100vh - 80px)', padding: 0 }}>
      <iframe
        src="http://localhost:8501"
        title="True Detective AI Fake News Engine"
        width="100%"
        height="100%"
        style={{ border: 'none', borderRadius: '8px' }}
      />
    </div>
  )
}