import { model, Schema } from 'mongoose';

import { RECIPE_CATEGORIES } from '../../constants/recipeCategories.js';

const recipesSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },

    shortDescription: {
      type: String,
      required: true,
      trim: true,
    },

    ingredients: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'Ingredients are required.',
      },
    },

    steps: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'Steps are required.',
      },
    },

    category: {
      type: String,
      required: true,
      enum: RECIPE_CATEGORIES,
    },

    cookingTime: {
      type: String,
      required: true,
      trim: true,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

recipesSchema.index({ slug: 1 });
recipesSchema.index({ category: 1 });
recipesSchema.index({ title: 'text' });
recipesSchema.index({ owner: 1, createdAt: -1 });

export const recipesCollection = model('recipe', recipesSchema);
