import React, { useEffect, useState } from 'react';
import '../styles/IngredientsPage.css';

function IngredientsPage({ ingredients, onConfirm, onBack }) {
  const [selectedIngredients, setSelectedIngredients] = useState(ingredients);
  const [newIngredient, setNewIngredient] = useState('');
  const [cookingLevel, setCookingLevel] = useState('Beginner');
  const [timeAvailable, setTimeAvailable] = useState('20 min');
  const [dietFocus, setDietFocus] = useState('Healthy');


  useEffect(() => {
  setSelectedIngredients(ingredients || []);
}, [ingredients]);


  //for editing existing ingredients/chips
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');

const startEditing = (index) => {
  setEditingIndex(index);
  setEditValue(selectedIngredients[index]);
};

const saveEditing = () => {
  const trimmed = editValue.trim();
  if (!trimmed) return;

  setSelectedIngredients((prev) =>
    prev.map((x, i) => (i === editingIndex ? trimmed : x))
  );

  setEditingIndex(null);
  setEditValue('');
};

const handleEditKeyDown = (e) => {
  if (e.key === 'Enter') saveEditing();
  if (e.key === 'Escape') {
    setEditingIndex(null);
    setEditValue('');
  }
};

  const handleRemoveIngredient = (index) => {
    setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim() && !selectedIngredients.includes(newIngredient.trim())) {
      setSelectedIngredients([...selectedIngredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const handleAddKeyDown = (e) => {
  if (e.key === 'Enter') handleAddIngredient();
  };


  const handleConfirm = () => {
    onConfirm({
      ingredients: selectedIngredients,
      cookingLevel,
      timeAvailable,
      dietFocus,
    });
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
            <div key={`${ingredient}-${index}`} className="chip">
              {editingIndex === index ? (
                <input
                  className="chip-edit-input"
                  value={editValue}
                  autoFocus
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  onBlur={saveEditing}
                  />
                 ) : (
                   <span className="chip-text">
                     {ingredient}
                   </span>
              )}
              <button
                type="button"
                className="chip-edit"
                onClick={() => startEditing(index)}
                aria-label={`Edit ${ingredient}`}
                title="Edit"
              >
                ✎
              </button>



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
              onKeyDown={handleAddKeyDown}

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
          <div className="prefs">
              <div className="pref-row">
                <div className="pref-label">Cooking level:</div>
                <div className="pref-options">
                  {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      className={`pill ${cookingLevel === level ? 'pill-active' : ''}`}
                      onClick={() => setCookingLevel(level)}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pref-row">
                <div className="pref-label">Time available:</div>
                <div className="pref-options">
                  {['10 min', '20 min', '30 min', '45+'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`pill ${timeAvailable === t ? 'pill-active' : ''}`}
                      onClick={() => setTimeAvailable(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pref-row">
                <div className="pref-label">Diet focus:</div>
                <div className="pref-options">
                  {['Healthy', 'Comfort', 'High Protein', 'Vegetarian'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`pill ${dietFocus === d ? 'pill-active' : ''}`}
                      onClick={() => setDietFocus(d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

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
