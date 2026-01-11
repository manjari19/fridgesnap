import React, { useRef } from 'react';
import { Camera, Upload, Loader2} from 'lucide-react';
import logo from '../assets/favicon.PNG';
import cookingIllustration from '../assets/cooking.png'
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
          <h1 className="landing-title">
            <img src={logo} alt="FridgeSnap Logo" className="logo-img" />
            FridgeSnap</h1>
        </div>

        <div className="landing-illustration">
          <img
            src={cookingIllustration}
            alt="People cooking together"
            className="main-illustration"
            />
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
    {loading ? (
              <><Loader2 className="spinner" size={20} /> Processing...</>
            ) : (
              <><Camera size={22} strokeWidth={2.5} /> Take fridge photo</>
            )}
  </button>

  {/* Option 2: Upload Photo from Gallery */}
  <button
    className="button button-secondary button-large"
    onClick={handleUploadClick}
    disabled={loading}
    style={{ backgroundColor: 'white', color: '#5A8D8F', border: '2px solid #5A8D8F' }}
  >
   {loading ? (
              <><Loader2 className="spinner" size={20} /> Processing...</>
            ) : (
              <><Upload size={22} strokeWidth={2.5} /> Upload from gallery</>
            )}
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
