// src/components/RecipeCard.js
import React from "react";
import "../styles/RecipeCard.css";
import { getRecipeImage } from "../utils/recipeImages";
import { Heart } from "lucide-react";
import StarRating from "./StarRating";

function toArray(v) {
  if (Array.isArray(v)) return v.filter(Boolean);
  if (typeof v === "string" && v.trim()) return [v.trim()];
  return [];
}

export default function RecipeCard({
  recipe,
  isSaved = false,
  onToggleSave,
  onCook,
  rating = 0, // NEW
}) {
  const title = recipe?.name || "Untitled Recipe";
  const time = recipe?.time || "—";
  const difficulty = recipe?.difficulty || "—";
  const uses = toArray(recipe?.uses || recipe?.ingredients);
  const optional = toArray(recipe?.optional);

  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <div className="rc-card">
      <img className="rc-img" src={getRecipeImage(title)} alt={title} />

      <div className="rc-body">
        <div className="rc-title">{title}</div>

        <div className="rc-meta">
          <span>{time}</span>
          <span className="rc-dot">•</span>
          <span>{difficulty}</span>
        </div>

        {/* NEW: show rating on the card */}
        {safeRating > 0 && (
          <div className="rc-ratingRow" aria-label={`Rated ${safeRating} out of 5`}>
            <StarRating value={safeRating} readonly size="sm" />
            <span className="rc-ratingText">{safeRating}/5</span>
          </div>
        )}

        <div className="rc-lines">
          <div className="rc-line">
            <span className="rc-bullet">•</span>
            <span className="rc-key">Uses:</span>
          </div>

          <div className="rc-pills">
            {uses.length ? (
              uses.map((u, i) => (
                <span className="rc-pill" key={`${u}-${i}`}>
                  {u}
                </span>
              ))
            ) : (
              <span className="rc-val">—</span>
            )}
          </div>

          {optional.length > 0 && (
            <div className="rc-optional">
              <span className="rc-opt-label">Optional:</span>{" "}
              <span className="rc-opt-val">{optional.join(", ")}</span>
            </div>
          )}
        </div>

        <div className="rc-actions">
          <button type="button" className="rc-btn rc-primary" onClick={() => onCook?.(recipe)}>
            Cook now
          </button>

          <button
            type="button"
            className={isSaved ? "rc-like saved" : "rc-like"}
            onClick={() => onToggleSave?.(recipe)}
            aria-label={isSaved ? "Unsave recipe" : "Save recipe"}
          >
            <Heart className="rc-likeIcon" />
          </button>
        </div>
      </div>
    </div>
  );
}
