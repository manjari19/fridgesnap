import React, { useRef } from 'react';
import '../styles/LandingPage.css';

function LandingPage({ onUpload, loading }) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="page-container landing-page">
      <div className="landing-content">
        <div className="landing-header">
          <h1 className="landing-title">🧊 FridgeSnap</h1>
        </div>

        <div className="landing-illustration">
          <svg viewBox="0 0 300 250" className="illustration-svg">
            {/* Background yellow shape */}
            <path
              d="M 40 20 Q 200 0 220 100 L 220 140 Q 200 150 40 150 Z"
              fill="#F5C842"
              opacity="0.3"
            />

            {/* Left person */}
            <circle cx="70" cy="90" r="18" fill="#D4A574" />
            <rect x="55" y="115" width="30" height="35" fill="#4A7A5F" />
            <rect x="50" y="110" width="8" height="25" fill="#D4A574" />
            <rect x="72" y="110" width="8" height="25" fill="#D4A574" />
            <polygon points="65,100 75,100 75,115 65,115" fill="#F4B8A0" />

            {/* Right person */}
            <circle cx="180" cy="100" r="18" fill="#D4A574" />
            <rect x="165" y="125" width="30" height="35" fill="#D4A87F" />
            <rect x="160" y="120" width="8" height="25" fill="#D4A574" />
            <rect x="182" y="120" width="8" height="25" fill="#D4A574" />
            <polygon points="175,110 185,110 185,125 175,125" fill="#F4B8A0" />

            {/* Pot/Pan */}
            <ellipse cx="120" cy="130" rx="25" ry="20" fill="#FFB6C1" opacity="0.4" />
            <path d="M 95 130 Q 95 145 145 145 Q 145 145 145 130" fill="none" stroke="#999" strokeWidth="2" />

            {/* Plant */}
            <ellipse cx="50" cy="160" rx="12" ry="15" fill="#6B8E6F" />
            <rect x="48" y="160" width="4" height="20" fill="#8B7355" />
            <ellipse cx="44" cy="150" rx="6" ry="8" fill="#7A9D76" />
            <ellipse cx="56" cy="150" rx="6" ry="8" fill="#7A9D76" />
          </svg>
        </div>

        <div className="landing-text">
          <h2 className="landing-heading">What's in your fridge?</h2>
          <p className="landing-description">
            Snap or upload a photo, and we'll find recipes you can cook now.
          </p>
        </div>

        <div className="landing-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
  {/* Option 1: Take Photo With Camera */}
  <button
    className="button button-primary button-large"
    onClick={() => cameraInputRef.current?.click()}
    disabled={loading}
  >
    {loading ? '⏳ Processing...' : '📸 Take fridge photo'}
  </button>

  {/* Option 2: Upload Photo from Gallery */}
  <button
    className="button button-secondary button-large"
    onClick={handleUploadClick}
    disabled={loading}
    style={{ backgroundColor: 'white', color: '#5A8D8F', border: '2px solid #5A8D8F' }}
  >
    {loading ? '⏳ Processing...' : '📁 Upload from gallery'}
  </button>

  {/* Hidden Inputs */}
  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    onChange={handleFileChange}
    style={{ display: 'none' }} // Added this to keep UI clean
  />
  <input
    ref={cameraInputRef}
    type="file"
    accept="image/*"
    capture="environment"
    onChange={handleFileChange}
    style={{ display: 'none' }}
      />
    </div>
        {/* Carousel dots */}
        <div className="carousel-dots">
          <span className="dot active"></span>
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <svg className="wave-decoration" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path
          d="M0,60 Q300,10 600,60 T1200,60 L1200,120 L0,120 Z"
          fill="#5A8D8F"
          opacity="0.15"
        />
      </svg>
    </div>
  );
}

export default LandingPage;
