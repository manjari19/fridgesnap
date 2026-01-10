import React, { useState, useEffect } from 'react';
import RecipeCard from '../components/RecipeCard';
import '../styles/RecipesPage.css';
import { generateRecipes } from '../utils/geminiApi';

function RecipesPage({ ingredients, onSave, onViewSaved, onBack }) {
  const [activeTab, setActiveTab] = useState('suggested');
  const [savedIds, setSavedIds] = useState(new Set());
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecipes = async () => {
      setLoading(true);
      try {
        const generatedRecipes = await generateRecipes(ingredients);
        // Add IDs and format for display
        const formattedRecipes = generatedRecipes.map((recipe, index) => ({
          id: index + 1,
          name: recipe.name,
          time: recipe.time,
          difficulty: recipe.difficulty,
          image: getEmojiForRecipe(recipe.name),
          uses: recipe.ingredients || [],
          optional: recipe.optional || [],
        }));
        setRecipes(formattedRecipes);
      } catch (error) {
        console.error('Error loading recipes:', error);
        setRecipes(getMockRecipes());
      } finally {
        setLoading(false);
      }
    };

    if (ingredients.length > 0) {
      loadRecipes();
    }
  }, [ingredients]);

  const getMockRecipes = () => {
    return [
      {
        id: 1,
        name: 'Chicken Spinach Wrap',
        time: '20 min',
        difficulty: 'Easy',
        image: '🌯',
        uses: ['chicken', 'spinach', 'tortillas'],
        optional: ['lemon', 'garlic'],
      },
      {
        id: 2,
        name: 'Cheesy Veggie Omelette',
        time: '15 min',
        difficulty: 'Beginner',
        image: '🍳',
        uses: ['eggs', 'cheese', 'tomatoes'],
        optional: ['onions'],
      },
      {
        id: 3,
        name: 'Creamy Chicken Pasta',
        time: '30 min',
        difficulty: 'Intermediate',
        image: '🍝',
        uses: ['chicken', 'yogurt', 'cheese'],
        optional: ['spinach', 'herbs'],
      },
    ];
  };

  const getEmojiForRecipe = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('salad')) return '🥗';
    if (lower.includes('pasta')) return '🍝';
    if (lower.includes('soup')) return '🍲';
    if (lower.includes('rice')) return '🍚';
    if (lower.includes('sandwich') || lower.includes('wrap')) return '🌯';
    if (lower.includes('omelette') || lower.includes('egg')) return '🍳';
    if (lower.includes('pizza')) return '🍕';
    if (lower.includes('burger')) return '🍔';
    if (lower.includes('taco')) return '🌮';
    if (lower.includes('stir')) return '🍲';
    return '🍽️';
  };

  const handleSaveRecipe = (recipe) => {
    setSavedIds(new Set([...savedIds, recipe.id]));
    onSave(recipe);
  };

  const isSaved = (id) => savedIds.has(id);

  return (
    <div className="page-container recipes-page">
      <div className="header">
        <button className="header-back" onClick={onBack}>
          ←
        </button>
        <h1 className="header-title">Recipe Suggestions</h1>
      </div>

      <div className="recipes-tabs">
        <button
          className={`tab ${activeTab === 'suggested' ? 'active' : ''}`}
          onClick={() => setActiveTab('suggested')}
        >
          Suggested
        </button>
        <button
          className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          Saved
        </button>
        <button
          className={`tab ${activeTab === 'cooked' ? 'active' : ''}`}
          onClick={() => setActiveTab('cooked')}
        >
          Cooked
        </button>
        <button
          className={`tab ${activeTab === 'more' ? 'active' : ''}`}
          onClick={() => setActiveTab('more')}
        >
          ⋮
        </button>
      </div>

      <div className="recipes-content">
        {loading ? (
          <div className="loading-state">
            <p>🔍 Generating recipes for you...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="loading-state">
            <p>No recipes found. Try adding more ingredients!</p>
          </div>
        ) : (
          recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onSave={handleSaveRecipe}
              isSaved={isSaved(recipe.id)}
            />
          ))
        )}
      </div>

      <div className="bottom-nav">
        <button className="nav-item">🏠</button>
        <button className="nav-item">🔍</button>
        <button className="nav-item nav-item-plus">➕</button>
        <button className="nav-item" onClick={onViewSaved}>📑</button>
        <button className="nav-item">👤</button>
      </div>
    </div>
  );
}

export default RecipesPage;
