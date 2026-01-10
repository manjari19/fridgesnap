// src/components/BottomNav.js
import React from "react";
import "../styles/BottomNav.css";

const Icon = {
  Home: (props) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.5z" />
    </svg>
  ),
  Search: (props) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M10.5 18a7.5 7.5 0 1 1 5.1-13 7.5 7.5 0 0 1-5.1 13z" />
      <path d="M16.3 16.3 21 21" />
    </svg>
  ),
  Plus: (props) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Bookmark: (props) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M7 3h10a1 1 0 0 1 1 1v18l-6-4-6 4V4a1 1 0 0 1 1-1z" />
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
  active = "recipes",
  onHome,
  onSearch,
  onAdd,
  onSaved,
  onProfile,
}) {
  return (
    <div className="bn-wrap">
      <nav className="bn" aria-label="Bottom Navigation">
        <button className={active === "home" ? "bn-btn active" : "bn-btn"} onClick={onHome} type="button">
          <Icon.Home className="bn-ico" />
        </button>

        <button className={active === "search" ? "bn-btn active" : "bn-btn"} onClick={onSearch} type="button">
          <Icon.Search className="bn-ico" />
        </button>

        <button className="bn-fab" onClick={onAdd} type="button" aria-label="Add">
          <Icon.Plus className="bn-fab-ico" />
        </button>

        <button className={active === "saved" ? "bn-btn active" : "bn-btn"} onClick={onSaved} type="button">
          <Icon.Bookmark className="bn-ico" />
        </button>

        <button className={active === "profile" ? "bn-btn active" : "bn-btn"} onClick={onProfile} type="button">
          <Icon.User className="bn-ico" />
        </button>
      </nav>
    </div>
  );
}
