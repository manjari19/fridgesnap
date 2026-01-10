/**
 * Gemini API Integration Utility
 * - Image-based ingredient detection
 * - Recipe suggestions (tailored to cookingLevel + timeAvailable + dietFocus)
 * - "Cook now" full step-by-step recipe generation (tailored to the same)
 *
 * IMPORTANT SECURITY NOTE:
 * Using an API key directly in the browser exposes it to users. For production,
 * proxy Gemini through a backend/serverless function.
 */

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// Default model; can override with REACT_APP_GEMINI_MODEL
const GEMINI_MODEL = process.env.REACT_APP_GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}`;

function geminiHeaders() {
  return {
    "Content-Type": "application/json",
    ...(GEMINI_API_KEY ? { "x-goog-api-key": GEMINI_API_KEY } : {}),
  };
}

function geminiUrl(pathSuffix = "") {
  const keyQuery = GEMINI_API_KEY ? `?key=${encodeURIComponent(GEMINI_API_KEY)}` : "";
  return `${GEMINI_BASE_URL}${pathSuffix}${keyQuery}`;
}

/**
 * Detect ingredients from an image using Gemini Vision
 * @param {File | string} imageFile - The image file or base64 string
 * @returns {Promise<string[]>} - Array of detected ingredients
 */
export async function detectIngredientsFromImage(imageFile) {
  try {
    if (!GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not configured. Using mock data.");
      return getMockIngredients();
    }

    console.log("API Key available:", GEMINI_API_KEY ? "Yes" : "No");
    console.log("Starting ingredient detection...");

    let base64Image;
    if (typeof imageFile === "string") {
      base64Image = imageFile.split(",")[1] || imageFile;
    } else {
      base64Image = await fileToBase64(imageFile);
    }

    let mimeType = "image/jpeg";
    if (typeof imageFile !== "string" && imageFile.type) {
      mimeType = imageFile.type;
    }

    const response = await fetch(geminiUrl(":generateContent"), {
      method: "POST",
      headers: geminiHeaders(),
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Image,
                },
              },
              {
                text:
                  "Analyze this image and list all food ingredients you can see. " +
                  "Return ONLY a comma-separated list of ingredients with no other text. " +
                  "Example: eggs, milk, cheese, spinach",
              },
            ],
          },
        ],
      }),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error Response:", errorData);
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const ingredientsText = parts.map((p) => p.text).filter(Boolean).join(" ") || "";

    const ingredients = ingredientsText
      .split(",")
      .map((ing) => ing.trim().toLowerCase())
      .filter((ing) => ing.length > 0);

    console.log("Detected ingredients:", ingredients);
    return ingredients;
  } catch (error) {
    console.error("Error detecting ingredients:", error);
    return getMockIngredients();
  }
}

/**
 * Generate recipe suggestions based on ingredients + preferences
 * @param {string[]} ingredients
 * @param {Object} preferences
 * @param {string} preferences.cookingLevel  - "Beginner" | "Intermediate" | "Advanced"
 * @param {string} preferences.timeAvailable - e.g. "10 min" | "20 min" | "30 min" | "45+"
 * @param {string} preferences.dietFocus     - e.g. "Healthy" | "Comfort" | "High Protein" | "Vegetarian"
 * @returns {Promise<Object[]>}
 */
export async function generateRecipes(ingredients, preferences = {}) {
  try {
    if (!GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not configured. Using mock data.");
      return getMockRecipes();
    }

    const cookingLevel = preferences.cookingLevel || "Beginner";
    const timeAvailable = preferences.timeAvailable || "20 min";
    const dietFocus = preferences.dietFocus || "Healthy";

    const prompt = `
You are a cooking assistant.

Create 4 recipe suggestions using the user's ingredients and constraints.

Hard constraints:
- Recipes must be achievable within the user's time available: ${timeAvailable}
- Difficulty must match the user's cooking level: ${cookingLevel}
- Diet focus preference: ${dietFocus}

Available ingredients:
${(ingredients || []).join(", ")}

Return ONLY a JSON array.
Each element must have exactly these fields:
{
  "name": "Recipe Name",
  "time": "X min",
  "difficulty": "Beginner/Intermediate/Advanced",
  "ingredients": ["ingredient1", "ingredient2"],
  "optional": ["optional1", "optional2"]
}

Rules:
- Keep names short and realistic.
- "time" must be a reasonable number and must not exceed the user's time available.
- "difficulty" must be exactly one of: "Beginner", "Intermediate", "Advanced".
- "ingredients" should be primarily from the available ingredients; "optional" may include common pantry items.
`.trim();

    const response = await fetch(geminiUrl(":generateContent"), {
      method: "POST",
      headers: geminiHeaders(),
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error:", errorData);
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const raw = parts.map((p) => p.text).filter(Boolean).join("\n") || "[]";

    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const jsonString = jsonMatch ? jsonMatch[0] : raw;

    const recipes = JSON.parse(jsonString);
    if (!Array.isArray(recipes)) throw new Error("Gemini response was not a JSON array.");
    return recipes;
  } catch (error) {
    console.error("Error generating recipes:", error);
    return getMockRecipes();
  }
}

/**
 * Generate a full "Cook Now" recipe (step-by-step) tailored to preferences.
 * @param {Object} baseRecipe
 * @param {string} baseRecipe.name
 * @param {string[]} baseRecipe.uses
 * @param {string[]} baseRecipe.optional
 * @param {Object} preferences
 * @param {string} preferences.cookingLevel
 * @param {string} preferences.timeAvailable
 * @param {string} preferences.dietFocus
 * @param {string[]} preferences.pantry  - all detected fridge ingredients
 * @returns {Promise<{summary: string, ingredients: string[], steps: {step: string, minutes: number, tip: string}[]}>}
 */
export async function generateCookNowRecipe(baseRecipe, preferences = {}) {
  try {
    if (!baseRecipe?.name) throw new Error("Missing recipe name");

    if (!GEMINI_API_KEY) {
      return {
        summary: "Gemini key missing — showing a simple fallback recipe.",
        ingredients: [...(baseRecipe.uses || []), ...(baseRecipe.optional || [])].filter(Boolean),
        steps: [
          { step: "Prep ingredients.", minutes: 5, tip: "Wash and chop everything first." },
          { step: "Cook according to your preferred method.", minutes: 10, tip: "Keep heat medium to avoid burning." },
          { step: "Taste, adjust seasoning, and serve.", minutes: 2, tip: "Add salt/acid last." },
        ],
      };
    }

    const cookingLevel = preferences.cookingLevel || "Beginner";
    const timeAvailable = preferences.timeAvailable || "20 min";
    const dietFocus = preferences.dietFocus || "Healthy";
    const pantry = Array.isArray(preferences.pantry) ? preferences.pantry : [];

    const prompt = `
You are a cooking assistant. Create a complete, practical recipe the user can follow right now.

Base recipe name:
${baseRecipe.name}

Core ingredients to use (prioritize these):
${(baseRecipe.uses || []).join(", ")}

Optional ingredients:
${(baseRecipe.optional || []).join(", ")}

Other available fridge items:
${pantry.join(", ")}

Constraints:
- Cooking level: ${cookingLevel}
- Total time available: ${timeAvailable} (DO NOT exceed)
- Diet focus: ${dietFocus}

Return ONLY valid JSON with this exact structure:
{
  "summary": "1-2 sentences",
  "ingredients": ["quantity + ingredient", "..."],
  "steps": [
    { "step": "Do something", "minutes": 3, "tip": "short tip" }
  ]
}

Rules:
- Steps must be concrete and beginner-friendly if cooking level is Beginner.
- If Advanced, add technique tips (but still fit the time).
- Keep ingredients realistic (allow common pantry items like salt, pepper, oil).
- Ensure the sum of step minutes is <= the time available.
`.trim();

    const response = await fetch(geminiUrl(":generateContent"), {
      method: "POST",
      headers: geminiHeaders(),
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.6 },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error:", errorData);
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const raw = parts.map((p) => p.text).filter(Boolean).join("\n") || "{}";

    const objMatch = raw.match(/\{[\s\S]*\}/);
    const jsonString = objMatch ? objMatch[0] : raw;

    const recipe = JSON.parse(jsonString);
    return recipe;
  } catch (error) {
    console.error("Error generating cook-now recipe:", error);
    // safe fallback
    return {
      summary: "Could not generate a full recipe right now. Here is a fallback cooking flow.",
      ingredients: [...(baseRecipe?.uses || []), ...(baseRecipe?.optional || [])].filter(Boolean),
      steps: [
        { step: "Prep ingredients.", minutes: 5, tip: "Get everything chopped and ready first." },
        { step: "Cook the main components.", minutes: 10, tip: "Keep heat moderate and stir as needed." },
        { step: "Finish and serve.", minutes: 5, tip: "Taste and adjust seasoning at the end." },
      ],
    };
  }
}

/**
 * Convert File to Base64 string
 * @param {File} file
 * @returns {Promise<string>}
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
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
  return ["eggs", "spinach", "chicken", "yogurt", "cheese", "tomatoes"];
}

function getMockRecipes() {
  return [
    {
      name: "Chicken Spinach Wrap",
      time: "20 min",
      difficulty: "Beginner",
      ingredients: ["chicken", "spinach", "tortillas"],
      optional: ["lemon", "garlic"],
    },
    {
      name: "Cheesy Veggie Omelette",
      time: "15 min",
      difficulty: "Beginner",
      ingredients: ["eggs", "cheese", "tomatoes"],
      optional: ["onions"],
    },
    {
      name: "Creamy Chicken Pasta",
      time: "30 min",
      difficulty: "Intermediate",
      ingredients: ["chicken", "pasta", "yogurt"],
      optional: ["spinach", "herbs"],
    },
  ];
}
