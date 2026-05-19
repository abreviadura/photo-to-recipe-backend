import { Router } from 'express';
import {
  getAllRecipesController,
  getMyRecipesController,
  getRecipesByAuthorController,
  getRecipeBySlugController,
  getRecipesByCategoryController,
  createRecipeController,
  createRecipeFromImageController,
  updateRecipeController,
  deleteRecipeController,
} from '../controllers/recipe.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { authenticate } from '../middlewares/authenticate.js';
import { optionalAuthenticate } from '../middlewares/optionalAuthenticate.js';
import { uploadRecipeImage } from '../middlewares/uploadRecipeImage.js';
import { validateBody } from '../middlewares/validateBody.js';
import { isValidId } from '../middlewares/isValidId.js';
import { createRecipeSchema, updateRecipeSchema } from '../validation/recipe.js';

const router = Router();

router.get('/', ctrlWrapper(getAllRecipesController));
router.get('/category/:category', ctrlWrapper(getRecipesByCategoryController));
router.get('/me', authenticate, ctrlWrapper(getMyRecipesController));
router.get('/author/:authorId', isValidId, ctrlWrapper(getRecipesByAuthorController));
router.post(
  '/from-image',
  authenticate,
  uploadRecipeImage.single('image'),
  ctrlWrapper(createRecipeFromImageController),
);
router.get('/:slug', optionalAuthenticate, ctrlWrapper(getRecipeBySlugController));

router.post(
  '/',
  authenticate,
  validateBody(createRecipeSchema),
  ctrlWrapper(createRecipeController),
);

router.patch(
  '/:id',
  authenticate,
  isValidId,
  validateBody(updateRecipeSchema),
  ctrlWrapper(updateRecipeController),
);

router.delete(
  '/:id',
  authenticate,
  isValidId,
  ctrlWrapper(deleteRecipeController),
);

export default router;
