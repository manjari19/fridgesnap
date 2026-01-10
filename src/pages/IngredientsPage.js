import React, { useState } from 'react';
import '../styles/IngredientsPage.css';

function IngredientsPage({ ingredients, onConfirm, onBack }) {
  const [selectedIngredients, setSelectedIngredients] = useState(ingredients);
  const [newIngredient, setNewIngredient] = useState('');

  const handleRemoveIngredient = (index) => {
    setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim() && !selectedIngredients.includes(newIngredient.trim())) {
      setSelectedIngredients([...selectedIngredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddIngredient();
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedIngredients);
  };

  return (
    <div className="page-container ingredients-page">
      <div className="header">
        <button className="header-back" onClick={onBack}>
          ← 
        </button>
        <h1 className="header-title">Ingredients Detected</h1>
      </div>

      <div className="ingredients-content">
        <p className="ingredients-intro">
          Here's what I found in your fridge
        </p>

        <div className="ingredients-chips">
          {selectedIngredients.map((ingredient, index) => (
            <div key={index} className="chip">
              <span>{ingredient}</span>
              <button
                className="chip-close"
                onClick={() => handleRemoveIngredient(index)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="add-ingredient-section">
          <div className="input-group">
            <input
              type="text"
              className="input-field"
              placeholder="Add ingredient..."
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button 
              className="button-add-ingredient"
              onClick={handleAddIngredient}
            >
              + Add ingredient
            </button>
          </div>
        </div>

        <p className="adjust-text">
          Adjust anything if you need to!
        </p>

        <button
          className="button button-primary button-large confirm-button"
          onClick={handleConfirm}
        >
          Confirm & generate recipes →
        </button>
      </div>
    </div>
  );
}

export default IngredientsPage;
