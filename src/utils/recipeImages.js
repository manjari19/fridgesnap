// src/utils/recipeImages.js

import defaultImg from "../assets/default.png";
import saladImg from "../assets/salad.png";
import pastaImg from "../assets/pasta.png";
import soupImg from "../assets/soup.png";
import wrapImg from "../assets/wrap.png";
import omeletteImg from "../assets/omelette.png";
import sandwichImg from "../assets/sandwich.png";
import riceImg from "../assets/rice.png";
import dessertImg from "../assets/dessert.png";

/**
 * Category keyword map: recipe name/title → category
 */
const CATEGORY_KEYWORDS = {
  salad: ["salad", "caesar", "coleslaw", "slaw", "caprese"],
  pasta: ["pasta", "spaghetti", "penne", "alfredo", "lasagna", "mac", "noodle"],
  soup: ["soup", "broth", "ramen", "pho", "stew", "chowder"],
  wrap: ["wrap", "burrito", "taco", "quesadilla", "roll"],
  omelette: ["omelette", "omelet", "scramble", "scrambled", "frittata", "egg"],
  sandwich: ["sandwich", "sub", "burger", "slider", "panini", "toast"],
  rice: ["rice", "biryani", "fried rice", "risotto", "pilaf"],
  dessert: ["cake", "cookie", "brownie", "dessert", "pudding", "ice cream"],
};

/**
 * Category → image mapping
 */
const CATEGORY_IMAGE = {
  salad: saladImg,
  pasta: pastaImg,
  soup: soupImg,
  wrap: wrapImg,
  omelette: omeletteImg,
  sandwich: sandwichImg,
  rice: riceImg,
  dessert: dessertImg,
  default: defaultImg,
};

function normalize(value = "") {
  return String(value).toLowerCase().trim();
}

export function getRecipeCategory(nameOrTitle = "") {
  const text = normalize(nameOrTitle);

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return category;
    }
  }

  return "default";
}

export function getRecipeImage(nameOrTitle = "") {
  const category = getRecipeCategory(nameOrTitle);
  return CATEGORY_IMAGE[category] || CATEGORY_IMAGE.default;
}
