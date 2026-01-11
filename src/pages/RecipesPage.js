// src/pages/RecipesPage.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import RecipeCard from "../components/RecipeCard";
import BottomNav from "../components/BottomNav";
import "../styles/RecipesPage.css";
import "../styles/CookNowModal.css";
import { generateRecipes, generateCookNowRecipe } from "../utils/geminiApi";
import StarRating from "../components/StarRating";


function RecipesPage({
  ingredients = [],
  cookingLevel = "Beginner",
  timeAvailable = "20 min",
  dietFocus = "Healthy",
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
  const [ratings, setRatings] = useState({});
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cook Now modal state
  const [cookOpen, setCookOpen] = useState(false);
  const [cookBase, setCookBase] = useState(null);
  const [cookLoading, setCookLoading] = useState(false);
  const [cookError, setCookError] = useState("");
  const [cookRecipe, setCookRecipe] = useState(null);
  const lastSigRef = useRef("");
  const RATINGS_KEY = "fridgesnap:ratings:v1";

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(RATINGS_KEY) || "{}");
      if (saved && typeof saved === "object") setRatings(saved);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings || {}));
    } catch {}
  }, [ratings]);



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

    // Create a stable signature so the same inputs don't call Gemini repeatedly
    const sig = JSON.stringify({
      ingredients: (ingredients || []).slice().sort(),
      cookingLevel,
      timeAvailable,
      dietFocus,
    });

    // If we've already loaded for this exact signature, do nothing
    if (lastSigRef.current === sig) return;
    lastSigRef.current = sig;

    async function loadRecipes() {
      setLoading(true);
      try {
        const generated = await generateRecipes(ingredients, {
          cookingLevel,
          timeAvailable,
          dietFocus,
        });

        const formatted = (generated || []).map((r, index) => ({
          id: r?.id ?? `${index}-${r?.name || r?.title || "recipe"}`,
          name: r?.name || r?.title || "Untitled Recipe",
          time: r?.time || r?.cookTime || timeAvailable || "20 min",
          difficulty: r?.difficulty || cookingLevel || "Easy",
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
  }, [ingredients, cookingLevel, timeAvailable, dietFocus]);


  function toggleSave(recipe) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      const already = next.has(recipe.id);

      if (already) {
        next.delete(recipe.id);
      } else {
        next.add(recipe.id);
        onSave?.(recipe);
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

  async function handleCook(recipe) {
    markCooked(recipe.id);

    setCookOpen(true);
    setCookBase(recipe);
    setCookRecipe(null);
    setCookError("");
    setCookLoading(true);

    try {
      // Gemini generates a full, proper recipe based on cookingLevel + timeAvailable (+ dietFocus)
      const full = await generateCookNowRecipe(
        {
          name: recipe.name,
          uses: recipe.uses,
          optional: recipe.optional,
        },
        {
          cookingLevel,
          timeAvailable,
          dietFocus,
          pantry: ingredients,
        }
      );

      setCookRecipe(full);
    } catch (e) {
      console.error(e);
      setCookError("Could not generate cooking steps right now. Please try again.");
    } finally {
      setCookLoading(false);
    }
  }

  const shownRecipes = useMemo(() => {
    if (activeTab === "saved") return recipes.filter((r) => savedIds.has(r.id));
    if (activeTab === "cooked") return recipes.filter((r) => cookedIds.has(r.id));
    if (activeTab === "rated") return recipes.filter((r) => (ratings[r.id] || 0) > 0);
    return recipes;
  }, [activeTab, recipes, savedIds, cookedIds, ratings]);

  return (
    <div className="rp-screen">
      <header className="rp-header">
        <button className="rp-back" onClick={onBack} type="button" aria-label="Back">
          ←
        </button>
        <div className="rp-title">Recipe Suggestions</div>

        <svg className="rp-wave" viewBox="0 0 390 90" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M0,55 C95,25 160,80 245,52 C315,30 350,38 390,28 L390,90 L0,90 Z"
            fill="rgba(255,255,255,0.18)"
          />
        </svg>
      </header>

      <div className="rp-body">
        {activeTab === "suggested" && (
      <div className="rp-headline">
        Here’s what you can <span>make</span>
      </div>
         )}


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
              rating={ratings[recipe.id] || 0}
            />
          ))

          )}
        </main>
      </div>

      <BottomNav
        active="recipes"
        onHome={onGoHome}
        onAdd={onGoAdd}
        onProfile={onGoProfile}
      />

      {/* Cook Now Modal */}
      {cookOpen && (
        <div className="cn-overlay" role="dialog" aria-modal="true">
          <div className="cn-modal">
            <div className="cn-header">
              <button
                type="button"
                className="cn-close"
                onClick={() => {
                  setCookOpen(false);
                  setCookBase(null);
                  setCookRecipe(null);
                  setCookError("");
                  setCookLoading(false);
                }}
                aria-label="Close"
              >
                ←
              </button>
              <div className="cn-title">{cookBase?.name || "Cook now"}</div>
            </div>

            <div className="cn-sub">
              <span>{timeAvailable}</span>
              <span className="cn-dot">•</span>
              <span>{cookingLevel}</span>
              <span className="cn-dot">•</span>
              <span>{dietFocus}</span>
            </div>

            <div className="cn-body">
              {cookLoading ? (
                <div className="cn-state">Creating your step-by-step recipe…</div>
              ) : cookError ? (
                <div className="cn-state">{cookError}</div>
              ) : cookRecipe ? (
                <>
                  {cookRecipe.summary && <p className="cn-summary">{cookRecipe.summary}</p>}

                  {Array.isArray(cookRecipe.ingredients) && cookRecipe.ingredients.length > 0 && (
                    <>
                      <div className="cn-sectionTitle">Ingredients</div>
                      <ul className="cn-list">
                        {cookRecipe.ingredients.map((it, i) => (
                          <li key={i}>{it}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {Array.isArray(cookRecipe.steps) && cookRecipe.steps.length > 0 && (
                    <>
                      <div className="cn-sectionTitle">Steps</div>
                      <ol className="cn-steps">
                        {cookRecipe.steps.map((s, i) => (
                          <li key={i}>
                            <div className="cn-stepText">{s.step}</div>
                            {(s.minutes || s.tip) && (
                              <div className="cn-stepMeta">
                                {s.minutes ? <span>{s.minutes} min</span> : null}
                                {s.tip ? <span className="cn-tip">Tip: {s.tip}</span> : null}
                              </div>
                            )}
                          </li>
                        ))}
                      </ol>
                    </>
                  )}

                  <div className="cn-rateRow">
                    <div className="cn-rateLabel">Rate this recipe</div>

                    <StarRating
                      value={cookBase?.id ? ratings[cookBase.id] || 0 : 0}
                      onChange={(n) => {
                        if (!cookBase?.id) return;
                        setRecipeRating(cookBase.id, n);
                      }}
                      size="lg"
                    />

                    {cookBase?.id && (ratings[cookBase.id] || 0) > 0 && (
                      <div className="cn-rateHint">Saved</div>
                    )}
                  </div>

                </>
              ) : (
                <div className="cn-state">No recipe details.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipesPage;
