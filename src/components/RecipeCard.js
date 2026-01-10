import React from 'react';

function RecipeCard({ recipe, onSave, isSaved }) {
  const handleSave = () => {
    onSave(recipe);
  };

  return (
    <div className="recipe-card card">
      <div className="recipe-image">
        <span className="recipe-emoji">{recipe.image}</span>
      </div>
      <div className="recipe-info">
        <h3 className="recipe-name">{recipe.name}</h3>
        <p className="recipe-time">{recipe.time} • {recipe.difficulty}</p>
        <div className="recipe-uses">
          <p className="uses-label">Uses: {recipe.uses.join(', ')}</p>
          {recipe.yogurt && <p className="uses-yogurt">yogurt</p>}
        </div>
        {recipe.optional && recipe.optional.length > 0 && (
          <p className="recipe-optional">Optional: {recipe.optional.join(', ')}</p>
        )}
      </div>
      <div className="recipe-actions">
        <button className="button button-secondary button-small">
          Cook now
        </button>
        <div className="save-button-container">
          <button 
            className={`button ${isSaved ? 'button-secondary' : 'button-outline'} button-small`}
            onClick={handleSave}
            style={{ position: 'relative' }}
          >
            {isSaved ? '✓ Saved' : 'Save'} ▼
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecipeCard;
