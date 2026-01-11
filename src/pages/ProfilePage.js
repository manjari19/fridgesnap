// src/pages/ProfilePage.js
import React from "react";
import "../styles/ProfilePage.css";
import BottomNav from "../components/BottomNav";
import profileImg from "../assets/profile.png";

export default function ProfilePage({
  fullName = "Samantha Smith",
  cookedCount = 0,
  wishlistCount = 0,
  onBack,

  // Bottom nav handlers
  onGoHome,
  onGoAdd,
  onGoProfile,
}) {
  return (
    <div className="pp-screen">
      <header className="pp-header">
        <button className="pp-back" onClick={onBack} type="button" aria-label="Back">
          ←
        </button>

        <div className="pp-title">Profile</div>

        <svg className="pp-wave" viewBox="0 0 390 90" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M0,55 C95,25 160,80 245,52 C315,30 350,38 390,28 L390,90 L0,90 Z"
            fill="rgba(255,255,255,0.18)"
          />
        </svg>
      </header>

      <main className="pp-body">
        <div className="pp-card">
          <img className="pp-avatar" src={profileImg} alt="Profile" />

          <div className="pp-name">{fullName}</div>

          <div className="pp-stats">
            <div className="pp-stat">
              <div className="pp-stat-value">{cookedCount}</div>
              <div className="pp-stat-label">Cooked</div>
            </div>

            <div className="pp-divider" />

            <div className="pp-stat">
              <div className="pp-stat-value">{wishlistCount}</div>
              <div className="pp-stat-label">Wishlist</div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav active="profile" onHome={onGoHome} onAdd={onGoAdd} onProfile={onGoProfile} />
    </div>
  );
}
