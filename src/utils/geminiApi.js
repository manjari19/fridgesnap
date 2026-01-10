/**
 * Gemini API Integration Utility
 * This file can be used to integrate Google Gemini API for:
 * - Image-based ingredient detection
 * - Recipe generation
 */

// IMPORTANT SECURITY NOTE:
// Using an API key directly in the browser will expose it to anyone who can open DevTools.
// For production, proxy this through a serverless function (Netlify/Vercel/Cloudflare) or your own backend.

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// Default to a current, broadly supported model. You can override with REACT_APP_GEMINI_MODEL.
// See model list: https://ai.google.dev/gemini-api/docs/models
const GEMINI_MODEL = process.env.REACT_APP_GEMINI_MODEL || 'gemini-2.5-flash';

const GEMINI_BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}`;

function geminiHeaders() {
  // Newer docs recommend the x-goog-api-key header. We'll also keep ?key= for compatibility.
  return {
    'Content-Type': 'application/json',
    ...(GEMINI_API_KEY ? { 'x-goog-api-key': GEMINI_API_KEY } : {}),
  };
}

function geminiUrl(pathSuffix = '') {
  // Some environments still accept key as query parameter.
  const keyQuery = GEMINI_API_KEY ? `?key=${encodeURIComponent(GEMINI_API_KEY)}` : '';
  return `${GEMINI_BASE_URL}${pathSuffix}${keyQuery}`;
}

/**
 * Detect ingredients from an image using Gemini Vision API
 * @param {File | string} imageFile - The image file or base64 string
 * @returns {Promise<string[]>} - Array of detected ingredients
 */
export async function detectIngredientsFromImage(imageFile) {
  try {
    if (!GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not configured. Using mock data.');
      return getMockIngredients();
    }

    console.log('API Key available:', GEMINI_API_KEY ? 'Yes' : 'No');
    console.log('Starting ingredient detection...');

    // Convert file to base64 if needed
    let base64Image;
    if (typeof imageFile === 'string') {
      base64Image = imageFile.split(',')[1] || imageFile;
    } else {
      base64Image = await fileToBase64(imageFile);
    }

    console.log('Base64 image prepared, sending to Gemini API...');

    // Detect MIME type from file
    let mimeType = 'image/jpeg';
    if (typeof imageFile !== 'string' && imageFile.type) {
      mimeType = imageFile.type;
    }

    const response = await fetch(geminiUrl(':generateContent'), {
      method: 'POST',
      headers: geminiHeaders(),
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                // REST uses snake_case field names.
                // See: https://ai.google.dev/api/generate-content
                inline_data: {
                  mime_type: mimeType,
                  data: base64Image,
                },
              },
              {
                text: 'Analyze this image and list all food ingredients you can see. Return ONLY a comma-separated list of ingredients with no other text. Example: eggs, milk, cheese, spinach',
              },
            ],
          },
        ],
      }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Response:', errorData);
      console.error('Full error:', JSON.stringify(errorData, null, 2));
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    
    // Depending on model output, text can be in parts[0] or later.
    const parts = data.candidates?.[0]?.content?.parts || [];
    const ingredientsText =
      parts.map((p) => p.text).filter(Boolean).join(' ') || '';
    const ingredients = ingredientsText
      .split(',')
      .map((ing) => ing.trim().toLowerCase())
      .filter((ing) => ing.length > 0);

    console.log('Detected ingredients:', ingredients);
    return ingredients;
  } catch (error) {
    console.error('Error detecting ingredients:', error);
    return getMockIngredients();
  }
}

/**
 * Generate recipes based on ingredients using Gemini API
 * @param {string[]} ingredients - Array of available ingredients
 * @param {Object} preferences - User preferences (skillLevel, timeAvailable, mealType)
 * @returns {Promise<Object[]>} - Array of recipe objects
 */
export async function generateRecipes(ingredients, preferences = {}) {
  try {
    if (!GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not configured. Using mock data.');
      return getMockRecipes();
    }

    const prompt = `You are a helpful cooking assistant. Given the following ingredients, suggest 3-4 delicious recipes.

Available ingredients: ${ingredients.join(', ')}
User preferences: 
- Skill level: ${preferences.skillLevel || 'any'}
- Time available: ${preferences.timeAvailable || 'any'}
- Meal type: ${preferences.mealType || 'any'}

For each recipe, provide a JSON object with these exact fields:
{
  "name": "Recipe Name",
  "time": "X min",
  "difficulty": "Easy/Intermediate/Advanced",
  "ingredients": ["ingredient1", "ingredient2"],
  "optional": ["optional1", "optional2"],
  "instructions": "Step-by-step instructions"
}

Return ONLY a JSON array of recipe objects, no other text.`;

    const response = await fetch(geminiUrl(':generateContent'), {
      method: 'POST',
      headers: geminiHeaders(),
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        // Best-effort: encourage valid JSON output.
        // (The exact field name varies across SDKs; the REST API ignores unknown fields.)
        generationConfig: {
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const raw = parts.map((p) => p.text).filter(Boolean).join('\n') || '[]';

    // Extract JSON from response (it might be wrapped in markdown code blocks)
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const jsonString = jsonMatch ? jsonMatch[0] : raw;

    const recipes = JSON.parse(jsonString);
    if (!Array.isArray(recipes)) throw new Error('Gemini response was not a JSON array.');
    return recipes;
  } catch (error) {
    console.error('Error generating recipes:', error);
    return getMockRecipes();
  }
}

/**
 * Convert File to Base64 string
 * @param {File} file - File object
 * @returns {Promise<string>} - Base64 encoded string
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Mock data for development
 */
function getMockIngredients() {
  return ['eggs', 'spinach', 'chicken', 'yogurt', 'cheese', 'tomatoes'];
}

function getMockRecipes() {
  return [
    {
      name: 'Chicken Spinach Wrap',
      time: '20 min',
      difficulty: 'Easy',
      ingredients: ['chicken', 'spinach', 'tortillas'],
      optional: ['lemon', 'garlic'],
      instructions: '1. Cook chicken. 2. Warm tortillas. 3. Assemble wrap with spinach.',
    },
    {
      name: 'Cheesy Veggie Omelette',
      time: '15 min',
      difficulty: 'Beginner',
      ingredients: ['eggs', 'cheese', 'tomatoes'],
      optional: ['onions'],
      instructions: '1. Beat eggs. 2. Heat pan. 3. Cook omelette. 4. Add cheese and vegetables.',
    },
  ];
}
