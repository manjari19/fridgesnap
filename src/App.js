import React, { useState, useEffect } from "react";
import "./index.css";
import LandingPage from "./pages/LandingPage";
import IngredientsPage from "./pages/IngredientsPage";
import RecipesPage from "./pages/RecipesPage";
import SavedRecipesPage from "./pages/SavedRecipesPage";
import ProfilePage from "./pages/ProfilePage"; // NEW
import { detectIngredientsFromImage } from "./utils/geminiApi";

function App() {
  const [currentPage, setCurrentPage] = useState("landing");

  const [detectedIngredients, setDetectedIngredients] = useState([]);
  const [cookingLevel, setCookingLevel] = useState("Beginner");
  const [timeAvailable, setTimeAvailable] = useState("20 min");
  const [dietFocus, setDietFocus] = useState("Healthy");

  // Saved recipes (wishlist)
  const [savedRecipes, setSavedRecipes] = useState([]);

  // NEW: cooked recipe ids + ratings at the app level so Profile can use them
  const [cookedIds, setCookedIds] = useState(() => new Set());
  const [ratings, setRatings] = useState({});

  const [loading, setLoading] = useState(false);

  // For now, hardcode a name (later: editable + persist in localStorage)
  const userFullName = "Jane Doe";

  useEffect(() => {
    console.log("App loaded. Checking Gemini API key...");
    console.log("API Key available:", process.env.REACT_APP_GEMINI_API_KEY ? "Yes" : "No");
  }, []);

  const handleImageUpload = async (file) => {
    setLoading(true);
    try {
      const ingredients = await detectIngredientsFromImage(file);
      setDetectedIngredients(Array.isArray(ingredients) ? ingredients : []);
      setCurrentPage("ingredients");
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error processing image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // IMPORTANT: IngredientsPage sends an object, not an array
  const handleConfirmIngredients = ({ ingredients, cookingLevel, timeAvailable, dietFocus }) => {
    setDetectedIngredients(Array.isArray(ingredients) ? ingredients : []);
    setCookingLevel(cookingLevel || "Beginner");
    setTimeAvailable(timeAvailable || "20 min");
    setDietFocus(dietFocus || "Healthy");
    setCurrentPage("recipes");
  };

  const handleSaveRecipe = (recipe) => {
    setSavedRecipes((prev) => {
      // avoid duplicates by id
      if (prev.some((r) => r.id === recipe.id)) return prev;
      return [...prev, { ...recipe }];
    });
  };

  const handleRateRecipe = (recipeId, rating) => {
    const safe = Math.max(0, Math.min(5, Number(rating) || 0));
    setRatings((prev) => ({ ...prev, [recipeId]: safe }));
  };

  // NEW: Called by RecipesPage when user hits Cook Now (or when you decide "cooked" should count)
  const handleMarkCooked = (recipeId) => {
    if (!recipeId) return;
    setCookedIds((prev) => {
      const next = new Set(prev);
      next.add(recipeId);
      return next;
    });
  };

  const handleCookAgain = () => {
    setCurrentPage("recipes");
  };

  const cookedCount = cookedIds.size;
  const wishlistCount = savedRecipes.length;

  return (
    <div className="app-container">
      {currentPage === "landing" && (
        <LandingPage onUpload={handleImageUpload} loading={loading} />
      )}

      {currentPage === "ingredients" && (
        <IngredientsPage
          ingredients={detectedIngredients}
          onConfirm={handleConfirmIngredients}
          onBack={() => setCurrentPage("landing")}
        />
      )}

      {currentPage === "recipes" && (
        <RecipesPage
          ingredients={detectedIngredients}
          cookingLevel={cookingLevel}
          timeAvailable={timeAvailable}
          dietFocus={dietFocus}
          onSave={handleSaveRecipe}
          onBack={() => setCurrentPage("ingredients")}
          onGoHome={() => setCurrentPage("landing")}
          onGoAdd={() => setCurrentPage("landing")}
          onGoProfile={() => setCurrentPage("profile")} // UPDATED
          // NEW: lift these so profile can reflect real counts and ratings persist across tabs
          onMarkCooked={handleMarkCooked}
          ratings={ratings}
          onRate={handleRateRecipe}
        />
      )}

      {/* Keep this page if you still use it somewhere else; otherwise, you can delete later */}
      {currentPage === "saved" && (
        <SavedRecipesPage
          recipes={savedRecipes.map((r) => ({ ...r, rating: ratings[r.id] || 0 }))}
          onRate={handleRateRecipe}
          onCookAgain={handleCookAgain}
          onBack={() => setCurrentPage("recipes")}
        />
      )}

      {currentPage === "profile" && (
        <ProfilePage
          fullName={userFullName}
          cookedCount={cookedCount}
          wishlistCount={wishlistCount}
          onBack={() => setCurrentPage("recipes")}
          onGoHome={() => setCurrentPage("landing")}
          onGoAdd={() => setCurrentPage("landing")}
          onGoProfile={() => setCurrentPage("profile")}
        />

      )}
    </div>
  );
}

export default App;
