# Copilot / AI Agent Instructions for FridgeSnap

Purpose: Help an AI coding agent become productive quickly by documenting architecture, key files, workflows, conventions, and integration points discovered in this Create React App project.

- **Big picture:** This is a single-page React app bootstrapped with Create React App. Navigation is handled in `src/App.js` via component state (no React Router). The main flow:
  - `LandingPage` accepts an image upload → calls `detectIngredientsFromImage` in `src/utils/geminiApi.js`.
  - Detected ingredients are stored in `App` state and passed to `IngredientsPage` → user can edit/confirm.
  - Confirming ingredients navigates to `RecipesPage`, which calls `generateRecipes` in `src/utils/geminiApi.js` to produce recipe objects.
  - Saved recipes are kept in-memory in `App` state (no backend persistence).

- **Key files to read and edit:**
  - `package.json` (scripts: `npm start`, `npm test`, `npm run build`)
  - `src/App.js` (app state, navigation, top-level handlers)
  - `src/utils/geminiApi.js` (Gemini image + recipe API integration, mock fallbacks)
  - `src/pages/IngredientsPage.js`, `src/pages/LandingPage.js`, `src/pages/RecipesPage.js`, `src/pages/SavedRecipesPage.js` (UI and data bindings)
  - `src/components/*` (reusable UI, e.g., `RecipeCard.js`, `StarRating.js`)

- **Environment / secrets:**
  - The Gemini integration reads `REACT_APP_GEMINI_API_KEY` and optionally `REACT_APP_GEMINI_MODEL`.
  - For local development, create a `.env` with:

    REACT_APP_GEMINI_API_KEY=your_key_here
    REACT_APP_GEMINI_MODEL=gemini-2.5-flash

  - `src/utils/geminiApi.js` explicitly warns about exposing keys client-side and falls back to mock data when the key is missing. Prefer adding a serverless proxy if implementing production usage.

- **API contract & expectations (important for modifications):**
  - `detectIngredientsFromImage(imageFile)` returns `Promise<string[]>` of lower-cased ingredient names. If key missing, returns mock array (see `getMockIngredients`).
  - `generateRecipes(ingredients, preferences)` must return a JSON array of recipe objects with exact fields: `name`, `time`, `difficulty`, `ingredients`, `optional`, `instructions`. The function parses the model output and throws/falls back to mock data if parsing fails.
  - When updating prompts or parsing, maintain strict JSON-array return handling (the code extracts the first JSON array it finds).

- **Patterns & conventions to follow:**
  - Functional React components using hooks (`useState`, `useEffect`) are used throughout.
  - Styling lives in `src/styles/*.css` and is imported by pages/components directly.
  - App-level state is lifted to `src/App.js`. New cross-page state should be added there rather than introducing a global store unless necessary.
  - Prefer small, focused changes: modify `geminiApi.js` for API/prompt logic; update pages for UI behavior and wiring.

- **Developer workflows / commands:**
  - Start development server: `npm start` (CRA default, opens on http://localhost:3000)
  - Run tests: `npm test` (CRA test runner)
  - Build production bundle: `npm run build`

- **Troubleshooting notes an agent should surface in PRs / patches:**
  - Never commit actual API keys. Suggest using `.env.local` or CI secrets for production.
  - If adding backend/proxy code, document how to wire the frontend to use it (replace `geminiUrl` or add a `REACT_APP_API_BASE` env var).
  - When changing `generateRecipes`, include unit tests or a dry-run to validate the model output parsing (the existing code accepts only a JSON array and will throw otherwise).

- **Examples to reference when generating or fixing code:**
  - Prompt/JSON contract used in `generateRecipes` (see `src/utils/geminiApi.js` prompt string and parsing logic).
  - Ingredient handling and confirmation flow: `src/pages/IngredientsPage.js` (adds/removes chips, confirms selection back to `App`).

- **When editing UX or navigation:**
  - Keep navigation logic in `App.js` (currentPage state). If you introduce React Router, update all page wiring in `App.js` accordingly and ensure tests and links still work.

If anything above is unclear, tell me which file or behavior you want clarified and I will expand the instruction with targeted examples or include small code snippets to follow project conventions.
