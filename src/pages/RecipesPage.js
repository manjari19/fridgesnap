// src/pages/RecipesPage.js
import React, { useEffect, useMemo, useState } from "react";
import RecipeCard from "../components/RecipeCard";
import BottomNav from "../components/BottomNav";
import "../styles/RecipesPage.css";
import { generateRecipes } from "../utils/geminiApi";

function RecipesPage({
  ingredients = [],
  onSave,
  onViewSaved,
  onBack,
  onGoHome,
  onGoSearch,
  onGoAdd,
  onGoProfile,
}) {
  const [activeTab, setActiveTab] = useState("suggested");
  const [savedIds, setSavedIds] = useState(new Set());
  const [cookedIds, setCookedIds] = useState(new Set());
  const [ratings, setRatings] = useState({}); // { [recipeId]: number }
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const getMockRecipes = () => [
    {
      id: 1,
      name: "Chicken Spinach Wrap",
      time: "20 min",
      difficulty: "Easy",
      uses: ["chicken", "spinach", "tortillas"],
      optional: ["lemon", "garlic"],
    },
    {
      id: 2,
      name: "Cheesy Veggie Omelette",
      time: "15 min",
      difficulty: "Beginner",
      uses: ["eggs", "cheese", "tomatoes"],
      optional: ["onions"],
    },
    {
      id: 3,
      name: "Creamy Chicken Pasta",
      time: "30 min",
      difficulty: "Easy",
      uses: ["chicken", "yogurt", "cheese"],
      optional: ["spinach", "herbs"],
    },
  ];

  useEffect(() => {
    let cancelled = false;

    async function loadRecipes() {
      setLoading(true);
      try {
        const generated = await generateRecipes(ingredients);

        const formatted = (generated || []).map((r, index) => ({
          id: r?.id ?? `${index}-${r?.name || r?.title || "recipe"}`,
          name: r?.name || r?.title || "Untitled Recipe",
          time: r?.time || r?.cookTime || "20 min",
          difficulty: r?.difficulty || "Easy",
          uses: r?.ingredients || r?.uses || [],
          optional: r?.optional || [],
        }));

        if (!cancelled) setRecipes(formatted);
      } catch (e) {
        if (!cancelled) setRecipes(getMockRecipes());
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (ingredients?.length > 0) loadRecipes();
    else {
      setRecipes(getMockRecipes());
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [ingredients]);

  function toggleSave(recipe) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      const already = next.has(recipe.id);

      if (already) {
        next.delete(recipe.id);
      } else {
        next.add(recipe.id);
        onSave?.(recipe); // notify parent only on first save
      }
      return next;
    });
  }

  function markCooked(recipeId) {
    setCookedIds((prev) => {
      const next = new Set(prev);
      next.add(recipeId);
      return next;
    });
  }

  function setRecipeRating(recipeId, value) {
    const rating = Math.max(0, Math.min(5, Number(value) || 0));
    setRatings((prev) => ({ ...prev, [recipeId]: rating }));
  }

  // Temporary “Cook now” behavior:
  // 1) mark cooked
  // 2) optionally ask for rating (quick prompt for now)
  function handleCook(recipe) {
    markCooked(recipe.id);

    // quick minimal rating UX for now (replace later with a real star UI)
    const input = window.prompt(`You cooked "${recipe.name}". Rate it 1–5? (Cancel = skip)`);
    if (input !== null) {
      setRecipeRating(recipe.id, input);
    }
  }

  const shownRecipes = useMemo(() => {
    if (activeTab === "saved") {
      return recipes.filter((r) => savedIds.has(r.id));
    }

    if (activeTab === "cooked") {
      return recipes.filter((r) => cookedIds.has(r.id));
    }

    if (activeTab === "rated") {
      return recipes.filter((r) => (ratings[r.id] || 0) > 0);
    }

    // suggested
    return recipes;
  }, [activeTab, recipes, savedIds, cookedIds, ratings]);

  return (
    <div className="rp-screen">
      <header className="rp-header">
        <button className="rp-back" onClick={onBack} type="button" aria-label="Back">
          ←
        </button>
        <div className="rp-title">Recipe Suggestions</div>

        {/* leave your wave as-is for now */}
        <svg className="rp-wave" viewBox="0 0 390 90" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M0,55 C95,25 160,80 245,52 C315,30 350,38 390,28 L390,90 L0,90 Z"
            fill="rgba(255,255,255,0.18)"
          />
        </svg>
      </header>

      <div className="rp-body">
        <div className="rp-headline">
          Here’s what you can <span>make</span>
        </div>

        <div className="rp-tabs">
          <button
            className={activeTab === "suggested" ? "rp-tab active" : "rp-tab"}
            onClick={() => setActiveTab("suggested")}
            type="button"
          >
            Suggested
          </button>

          <button
            className={activeTab === "saved" ? "rp-tab active" : "rp-tab"}
            onClick={() => setActiveTab("saved")}
            type="button"
          >
            Saved
          </button>

          <button
            className={activeTab === "cooked" ? "rp-tab active" : "rp-tab"}
            onClick={() => setActiveTab("cooked")}
            type="button"
          >
            Cooked
          </button>

          <button
            className={activeTab === "rated" ? "rp-tab active" : "rp-tab"}
            onClick={() => setActiveTab("rated")}
            type="button"
          >
            Rated
          </button>
        </div>

        <main className="rp-list">
          {loading ? (
            <div className="rp-state">Generating recipes…</div>
          ) : shownRecipes.length === 0 ? (
            <div className="rp-state">
              {activeTab === "saved"
                ? "No saved recipes yet."
                : activeTab === "cooked"
                ? "No cooked recipes yet."
                : activeTab === "rated"
                ? "No rated recipes yet."
                : "No recipes found."}
            </div>
          ) : (
            shownRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onCook={handleCook}
                onToggleSave={toggleSave}
                isSaved={savedIds.has(recipe.id)}
              />
            ))
          )}
        </main>
      </div>

      <BottomNav
        active="recipes"
        onHome={onGoHome}
        onSearch={onGoSearch}
        onAdd={onGoAdd}
        onSaved={onViewSaved}
        onProfile={onGoProfile}
      />
    </div>
  );
}

export default RecipesPage;
