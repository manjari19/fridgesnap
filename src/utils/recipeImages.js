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
import chickenImg from "../assets/chicken.png";
import fishImg from "../assets/fish.png";
import steakImg from "../assets/steak.png";
import drinkImg from "../assets/drink.png";
import stirfryImg from "../assets/stirfry.png";
import bowlImg from "../assets/bowl.png";


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

  chicken: ["chicken", "tikka", "wings", "drumstick", "tandoori"],
  fish: ["fish", "salmon", "tuna", "cod", "tilapia", "shrimp"],
  steak: ["steak", "beef", "sirloin", "ribeye", "filet", "flank"],
  drink: ["drink", "smoothie", "shake", "juice", "latte", "coffee", "tea"],
  stirfry: ["stir fry", "stir-fry", "saute", "sauté", "wok"],
  bowl: ["bowl", "poke", "buddha", "protein bowl", "rice bowl"],

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

  chicken: chickenImg,
  fish: fishImg,
  steak: steakImg,
  drink: drinkImg,
  stirfry: stirfryImg,
  bowl: bowlImg,

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
