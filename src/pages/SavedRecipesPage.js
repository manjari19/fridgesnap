import React, { useState } from 'react';
import StarRating from '../components/StarRating';
import '../styles/SavedRecipesPage.css';

function SavedRecipesPage({ recipes, onRate, onCookAgain, onBack }) {
  const [activeTab, setActiveTab] = useState('saved');

  const filteredRecipes = recipes.filter((recipe) => {
    if (activeTab === 'saved') return true;
    if (activeTab === 'cooked') return recipe.cooked;
    if (activeTab === 'rated') return recipe.rating > 0;
    return true;
  });

  return (
    <div className="page-container saved-recipes-page">
      <div className="saved-header">
        <h1 className="header-title-saved">Saved Recipes</h1>
        <button className="menu-button">⋮</button>
      </div>

      <div className="saved-tabs">
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
          className={`tab ${activeTab === 'rated' ? 'active' : ''}`}
          onClick={() => setActiveTab('rated')}
        >
          Rated
        </button>
        <button
          className={`tab ${activeTab === 'more' ? 'active' : ''}`}
          onClick={() => setActiveTab('more')}
        >
          ⋮
        </button>
      </div>

      <div className="saved-content">
        {filteredRecipes.length === 0 ? (
          <p className="no-recipes">No recipes here yet. Save some recipes to get started!</p>
        ) : (
          filteredRecipes.map((recipe) => (
            <div key={recipe.id} className="card saved-recipe-card">
              <div className="recipe-image-saved">
                <span className="recipe-emoji">{recipe.image}</span>
              </div>
              <div className="recipe-info-saved">
                <h3 className="recipe-name">{recipe.name}</h3>
                <p className="recipe-time">{recipe.time} • {recipe.difficulty}</p>
                <p className="recipe-uses">Uses: {recipe.uses.join(', ')}</p>
                {recipe.optional && recipe.optional.length > 0 && (
                  <p className="recipe-optional">Optional: {recipe.optional.join(', ')}</p>
                )}
              </div>
              <div className="recipe-actions-saved">
                <StarRating
                  rating={recipe.rating}
                  onChange={(newRating) => onRate(recipe.id, newRating)}
                />
                <button
                  className="button button-secondary button-small"
                  onClick={() => onCookAgain(recipe)}
                >
                  Cook again
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bottom-nav-saved">
        <button className="nav-item-saved">🏠</button>
        <button className="nav-item-saved">🔍</button>
        <button className="nav-item-saved nav-item-plus-saved">➕</button>
        <button className="nav-item-saved">📑</button>
        <button className="nav-item-saved">👤</button>
      </div>
    </div>
  );
}

export default SavedRecipesPage;
