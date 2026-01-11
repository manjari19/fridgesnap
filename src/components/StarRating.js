// src/components/StarRating.js
import React, { useMemo } from "react";
import "../styles/StarRating.css";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function StarRating({
  value = 0,
  onChange,
  size = "md", // "sm" | "md" | "lg"
  readonly = false,
  showValue = false,
  ariaLabel = "Rate this recipe",
}) {
  const v = clamp(Number(value) || 0, 0, 5);

  const starSize = useMemo(() => {
    if (size === "sm") return 18;
    if (size === "lg") return 26;
    return 22;
  }, [size]);

  function handleSet(n) {
    if (readonly) return;
    onChange?.(n);
  }

  return (
    <div className={`sr-wrap ${readonly ? "is-readonly" : ""}`} aria-label={ariaLabel}>
      <div className="sr-stars" role="radiogroup" aria-label={ariaLabel}>
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = n <= v;
          return (
            <button
              key={n}
              type="button"
              className={`sr-star ${filled ? "filled" : ""}`}
              onClick={() => handleSet(n)}
              onKeyDown={(e) => {
                if (readonly) return;
                if (e.key === "Enter" || e.key === " ") handleSet(n);
              }}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              aria-checked={filled}
              role="radio"
            >
              <svg
                width={starSize}
                height={starSize}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 17.3l-6.18 3.64 1.64-7.03L2 9.24l7.19-.61L12 2l2.81 6.63 7.19.61-5.46 4.67 1.64 7.03z" />
              </svg>
            </button>
          );
        })}
      </div>

      {showValue && <div className="sr-value">{v.toFixed(1)}</div>}
    </div>
  );
}
