import React, { useState, useEffect } from "react";
import "./index.css";
import LandingPage from "./pages/LandingPage";
import IngredientsPage from "./pages/IngredientsPage";
import RecipesPage from "./pages/RecipesPage";
import SavedRecipesPage from "./pages/SavedRecipesPage";
import { detectIngredientsFromImage } from "./utils/geminiApi";

function App() {
  const [currentPage, setCurrentPage] = useState("landing");

  const [detectedIngredients, setDetectedIngredients] = useState([]);
  const [cookingLevel, setCookingLevel] = useState("Beginner");
  const [timeAvailable, setTimeAvailable] = useState("20 min");
  const [dietFocus, setDietFocus] = useState("Healthy");

  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("App loaded. Checking Gemini API key...");
    console.log(
      "API Key available:",
      process.env.REACT_APP_GEMINI_API_KEY ? "Yes" : "No"
    );
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
    setSavedRecipes((prev) => [...prev, { ...recipe, rating: 0 }]);
  };

  const handleRateRecipe = (recipeId, rating) => {
    setSavedRecipes((prev) =>
      prev.map((r) => (r.id === recipeId ? { ...r, rating } : r))
    );
  };

  const handleCookAgain = () => {
    setCurrentPage("recipes");
  };

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
          onViewSaved={() => setCurrentPage("saved")}
          onBack={() => setCurrentPage("ingredients")}
          onGoHome={() => setCurrentPage("landing")}
          onGoSearch={() => setCurrentPage("ingredients")}
          onGoAdd={() => setCurrentPage("landing")}
          onGoProfile={() => alert("Profile page coming soon")}
        />
      )}

      {currentPage === "saved" && (
        <SavedRecipesPage
          recipes={savedRecipes}
          onRate={handleRateRecipe}
          onCookAgain={handleCookAgain}
          onBack={() => setCurrentPage("recipes")}
        />
      )}
    </div>
  );
}

export default App;
