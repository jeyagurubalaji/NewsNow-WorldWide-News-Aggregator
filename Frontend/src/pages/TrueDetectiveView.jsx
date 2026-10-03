import React from 'react';

export default function TrueDetectiveView() {
  const detectiveUrl = import.meta.env.VITE_TRUE_DETECTIVE_URL || 'https://truedetective-rfc7.onrender.com';

  return (
    <div className="container page-section" style={{ height: 'calc(100vh - 80px)', padding: 0 }}>
      <iframe
        src={`${detectiveUrl}/?embed=true`}
        title="True Detective AI Fake News Engine"
        width="100%"
        height="100%"
        style={{ border: 'none', borderRadius: '8px' }}
      />
    </div>
  );
}