import React, { useState, useEffect, useRef } from 'react';

export default function TrueDetectiveView() {
  const [showPopup, setShowPopup] = useState(true);
  const [canDismiss, setCanDismiss] = useState(false);
  const iframeLoaded = useRef(false);

  const detectiveUrl = import.meta.env.VITE_TRUE_DETECTIVE_URL || 'https://truedetective-rfc7.onrender.com';

  useEffect(() => {
    // 10-second timer guarantee
    const timer = setTimeout(() => {
      setCanDismiss(true);
      // Auto-close if the iframe has already finished loading
      if (iframeLoaded.current) {
        setShowPopup(false);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleIframeLoad = () => {
    iframeLoaded.current = true;
    // Only dismiss automatically if the 10-second threshold has passed
    if (canDismiss) {
      setShowPopup(false);
    }
  };

  return (
    <div className="container page-section" style={{ height: 'calc(100vh - 80px)', padding: 0, position: 'relative' }}>

      {/* Dynamic Pop-up Modal */}
      {showPopup && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--surface, #1C2027)',
              border: '1px solid var(--accent-wire, #E0574A)',
              borderRadius: '8px',
              padding: '28px 24px',
              maxWidth: '420px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
              color: 'var(--ink, #E8E5DC)'
            }}
          >
            <div style={{ fontSize: '2.2rem', marginBottom: '12px' }}>🕵‍♂️</div>
            <h3
              style={{
                fontFamily: 'var(--font-display, Georgia, serif)',
                margin: '0 0 10px',
                fontSize: '1.4rem'
              }}
            >
              True Detective AI
            </h3>
            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--ink-soft, #A6A196)',
                margin: '0 0 20px',
                lineHeight: 1.5
              }}
            >
              Connecting to the global verification engine. Please wait while the AI initializes...
            </p>

            <div className="spinner-wrap" style={{ padding: '10px 0 20px' }}>
              <div className="spinner"></div>
            </div>

            <button
              onClick={() => setShowPopup(false)}
              disabled={!canDismiss}
              style={{
                backgroundColor: canDismiss ? 'var(--accent-wire, #E0574A)' : 'var(--rule, #33373F)',
                color: canDismiss ? '#FFFFFF' : 'var(--ink-soft, #A6A196)',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.78rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                cursor: canDismiss ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease'
              }}
            >
              {canDismiss ? 'Continue to Engine' : 'Initializing (10s)...'}
            </button>
          </div>
        </div>
      )}

      {/* Embedded Streamlit Application */}
      <iframe
        src={`${detectiveUrl}/?embed=true`}
        title="True Detective AI Fake News Engine"
        width="100%"
        height="100%"
        onLoad={handleIframeLoad}
        style={{ border: 'none', borderRadius: '8px' }}
      />
    </div>
  );
}