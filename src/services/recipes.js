import slugify from 'slugify';

import { recipesCollection } from '../db/models/recipe.js';
import { UsersCollection } from '../db/models/user.js';

export const getAllRecipes = async ({ page = 1, limit = 10, query, category }) => {
  const skip = (page - 1) * limit;

  const filter = {
    isPublished: true,
  };

  if (category) {
    filter.category = category;
  }

  if (query) {
    filter.title = { $regex: query, $options: 'i' };
  }

  const recipes = await recipesCollection
    .find(filter)
    .populate('owner', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalItems = await recipesCollection.countDocuments(filter);

  return {
    data: recipes,
    page,
    limit,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
  };
};

export const ensureUniqueSlug = async (titleOrSlug) => {
  const base =
    slugify(String(titleOrSlug ?? 'recipe'), {
      lower: true,
      strict: true,
      trim: true,
    }) || 'recipe';

  let candidate = base;
  let n = 2;
  while (await recipesCollection.findOne({ slug: candidate })) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
};

export const getRecipeBySlug = async (slug, viewerUserId) => {
  const recipe = await recipesCollection
    .findOne({ slug })
    .populate('owner', 'name email');

  if (!recipe) {
    return null;
  }

  if (recipe.isPublished) {
    return recipe;
  }

  if (
    viewerUserId &&
    recipe.owner &&
    String(recipe.owner._id) === String(viewerUserId)
  ) {
    return recipe;
  }

  return null;
};

export const getMyRecipes = async (ownerId, { page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;

  const filter = { owner: ownerId };

  const recipes = await recipesCollection
    .find(filter)
    .populate('owner', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalItems = await recipesCollection.countDocuments(filter);

  return {
    data: recipes,
    page,
    limit,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
  };
};

export const getRecipesByCategory = async (category, { page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;

  const recipes = await recipesCollection
    .find({ category, isPublished: true })
    .populate('owner', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalItems = await recipesCollection.countDocuments({
    category,
    isPublished: true,
  });

  return {
    data: recipes,
    page,
    limit,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
  };
};

export const getRecipesByAuthor = async (
  authorId,
  { page = 1, limit = 10 } = {},
) => {
  const skip = (page - 1) * limit;

  const filter = {
    owner: authorId,
    isPublished: true,
  };

  const [recipes, totalItems, author] = await Promise.all([
    recipesCollection
      .find(filter)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    recipesCollection.countDocuments(filter),
    UsersCollection.findById(authorId).select('name email'),
  ]);

  return {
    data: recipes,
    page,
    limit,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    author,
  };
};

export const createRecipe = async (data, owner) => {
  return await recipesCollection.create({
    ...data,
    owner,
  });
};

export const updateRecipe = async (id, data, owner) => {
  return await recipesCollection.findOneAndUpdate(
    { _id: id, owner },
    data,
    {
      new: true,
      runValidators: true,
    },
  );
};

export const deleteRecipe = async (id, owner) => {
  return await recipesCollection.findOneAndDelete({ _id: id, owner });
};
