import React, { useState } from 'react';

export default function TrueDetectiveView() {
  const [isLoading, setIsLoading] = useState(true);
  const detectiveUrl = import.meta.env.VITE_TRUE_DETECTIVE_URL || 'https://truedetective-rfc7.onrender.com';

  return (
    <div className="container page-section" style={{ height: 'calc(100vh - 80px)', padding: 0, position: 'relative' }}>
      {/* Branded Loading Screen (Hides Render Spin Down Terminal) */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--paper, #14171C)',
            zIndex: 10,
            borderRadius: '8px'
          }}
        >
          <div className="spinner"></div>
          <p
            style={{
              marginTop: '16px',
              color: 'var(--ink-soft, #A6A196)',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.85rem',
              letterSpacing: '0.04em'
            }}
          >
            CONNECTING TO TRUE DETECTIVE AI ENGINE...
          </p>
        </div>
      )}

      {/* Embedded Streamlit Engine */}
      <iframe
        src={`${detectiveUrl}/?embed=true`}
        title="True Detective AI Fake News Engine"
        width="100%"
        height="100%"
        onLoad={() => setIsLoading(false)}
        style={{
          border: 'none',
          borderRadius: '8px',
          display: isLoading ? 'none' : 'block'
        }}
      />
    </div>
  );
}