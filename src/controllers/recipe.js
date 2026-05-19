import fs from 'fs/promises';

import * as recipeService from '../services/recipes.js';
import { generateRecipeFromImageBuffer } from '../services/openaiRecipe.js';

function getPublicBaseUrl(req) {
  const fromEnv = process.env.PUBLIC_BASE_URL;
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }
  return `${req.protocol}://${req.get('host')}`;
}

export const getAllRecipesController = async (req, res) => {
  const { page = 1, limit = 10, query, category } = req.query;

  const result = await recipeService.getAllRecipes({
    page: Number(page),
    limit: Number(limit),
    query,
    category,
  });

  res.json({
    status: 200,
    message: 'Successfully found recipes!',
    data: result,
  });
};

export const getMyRecipesController = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const result = await recipeService.getMyRecipes(req.user._id, {
    page: Number(page),
    limit: Number(limit),
  });

  res.json({
    status: 200,
    message: 'Successfully found your recipes!',
    data: result,
  });
};

export const getRecipesByAuthorController = async (req, res) => {
  const { authorId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const result = await recipeService.getRecipesByAuthor(authorId, {
    page: Number(page),
    limit: Number(limit),
  });

  res.json({
    status: 200,
    message: 'Successfully found recipes by author!',
    data: result,
  });
};

export const createRecipeFromImageController = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: 400,
      message: 'Image file is required',
    });
  }

  const filePath = req.file.path;

  try {
    const buffer = await fs.readFile(filePath);
    const generated = await generateRecipeFromImageBuffer(
      buffer,
      req.file.mimetype,
    );
    const slug = await recipeService.ensureUniqueSlug(generated.title);
    const imageUrl = `${getPublicBaseUrl(req)}/uploads/recipes/${req.file.filename}`;

    const recipe = await recipeService.createRecipe(
      {
        ...generated,
        slug,
        image: imageUrl,
        isPublished: false,
      },
      req.user._id,
    );

    res.status(201).json({
      status: 201,
      message: 'Successfully created a recipe from image!',
      data: recipe,
    });
  } catch (e) {
    await fs.unlink(filePath).catch(() => {});
    throw e;
  }
};

export const getRecipeBySlugController = async (req, res) => {
  const { slug } = req.params;

  const recipe = await recipeService.getRecipeBySlug(slug, req.user?._id);

  if (!recipe) {
    return res.status(404).json({
      message: 'Recipe not found',
    });
  }

  res.json({
    status: 200,
    message: 'Successfully found recipe!',
    data: recipe,
  });
};

export const getRecipesByCategoryController = async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const result = await recipeService.getRecipesByCategory(category, {
    page: Number(page),
    limit: Number(limit),
  });

  res.json({
    status: 200,
    message: 'Successfully found recipes by category!',
    data: result,
  });
};

export const createRecipeController = async (req, res) => {
  const recipe = await recipeService.createRecipe(req.body, req.user._id);

  res.status(201).json({
    status: 201,
    message: 'Successfully created a recipe!',
    data: recipe,
  });
};

export const updateRecipeController = async (req, res) => {
  const { id } = req.params;

  const recipe = await recipeService.updateRecipe(id, req.body, req.user._id);

  if (!recipe) {
    return res.status(404).json({
      message: 'Recipe not found or not allowed',
    });
  }

  res.json({
    status: 200,
    message: 'Successfully updated recipe!',
    data: recipe,
  });
};

export const deleteRecipeController = async (req, res) => {
  const { id } = req.params;

  const recipe = await recipeService.deleteRecipe(id, req.user._id);

  if (!recipe) {
    return res.status(404).json({
      message: 'Recipe not found or not allowed',
    });
  }

  res.status(204).send();
};
