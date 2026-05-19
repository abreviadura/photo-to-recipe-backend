import Joi from 'joi';

import { RECIPE_CATEGORIES } from '../constants/recipeCategories.js';

export const createRecipeSchema = Joi.object({
  slug: Joi.string().required(),
  title: Joi.string().required(),
  image: Joi.string().uri().required(),
  shortDescription: Joi.string().required(),
  ingredients: Joi.array().items(Joi.string()).min(1).required(),
  steps: Joi.array().items(Joi.string()).min(1).required(),
  category: Joi.string().valid(...RECIPE_CATEGORIES).required(),
  cookingTime: Joi.string().required(),
  isPublished: Joi.boolean(),
});

export const updateRecipeSchema = Joi.object({
  slug: Joi.string(),
  title: Joi.string(),
  image: Joi.string().uri(),
  shortDescription: Joi.string(),
  ingredients: Joi.array().items(Joi.string()).min(1),
  steps: Joi.array().items(Joi.string()).min(1),
  category: Joi.string().valid(...RECIPE_CATEGORIES),
  cookingTime: Joi.string(),
  isPublished: Joi.boolean(),
}).min(1);
