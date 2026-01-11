// src/components/BottomNav.js
import React from "react";
import "../styles/BottomNav.css";

const Icon = {
  Home: (props) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.5z" />
    </svg>
  ),
  Plus: (props) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  User: (props) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  ),
};

export default function BottomNav({
  active = "home",
  onHome,
  onAdd,
  onProfile,
}) {
  return (
    <div className="bn-wrap">
      <nav className="bn" aria-label="Bottom Navigation">
        {/* Home */}
        <button
          className={active === "home" ? "bn-btn active" : "bn-btn"}
          onClick={onHome}
          type="button"
          aria-label="Home"
        >
          <Icon.Home className="bn-ico" />
        </button>

        {/* Floating Add Button */}
        <button
          className="bn-fab"
          onClick={onAdd}
          type="button"
          aria-label="Add"
        >
          <Icon.Plus className="bn-fab-ico" />
        </button>

        {/* Profile */}
        <button
          className={active === "profile" ? "bn-btn active" : "bn-btn"}
          onClick={onProfile}
          type="button"
          aria-label="Profile"
        >
          <Icon.User className="bn-ico" />
        </button>
      </nav>
    </div>
  );
}
