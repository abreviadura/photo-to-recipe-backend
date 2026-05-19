import OpenAI from 'openai';

import { RECIPE_CATEGORIES } from '../constants/recipeCategories.js';
import { getEnvVar } from '../utils/getEnvVar.js';

const SYSTEM_PROMPT = `You are a cooking assistant. Analyze the food photo and output a structured recipe in JSON only.
The JSON must have exactly these keys:
- "title": string, dish name (can be in Ukrainian)
- "shortDescription": string, 1-2 sentences
- "ingredients": array of strings, each ingredient with amount if visible
- "steps": array of strings, ordered cooking steps
- "category": string, MUST be exactly one of: ${RECIPE_CATEGORIES.join(', ')}
- "cookingTime": string, human-readable e.g. "30 хв" or "1 год 20 хв"
Infer reasonable ingredients and steps from the dish type if the photo does not show full detail.
Do not include markdown or extra keys.`;

function normalizeCategory(value) {
  const raw = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
  if (RECIPE_CATEGORIES.includes(raw)) return raw;
  return 'main-courses';
}

function normalizeRecipe(parsed) {
  const title = String(parsed.title ?? 'Рецепт').trim() || 'Рецепт';
  const shortDescription = String(parsed.shortDescription ?? '').trim() || title;
  const ingredients = Array.isArray(parsed.ingredients)
    ? parsed.ingredients.map((x) => String(x).trim()).filter(Boolean)
    : [];
  const steps = Array.isArray(parsed.steps)
    ? parsed.steps.map((x) => String(x).trim()).filter(Boolean)
    : [];
  const category = normalizeCategory(parsed.category);
  const cookingTime = String(parsed.cookingTime ?? '30 хв').trim() || '30 хв';

  if (ingredients.length === 0) ingredients.push('За смаком');
  if (steps.length === 0) steps.push('Приготуйте страву за класичним рецептом.');

  return {
    title,
    shortDescription,
    ingredients,
    steps,
    category,
    cookingTime,
  };
}

export async function generateRecipeFromImageBuffer(buffer, mimeType) {
  const apiKey = getEnvVar('OPENAI_API_KEY');
  const openai = new OpenAI({ apiKey });

  const base64 = buffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Describe this dish and produce the JSON recipe.',
          },
          {
            type: 'image_url',
            image_url: { url: dataUrl },
          },
        ],
      },
    ],
    response_format: { type: 'json_object' },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error('Empty response from OpenAI');
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Invalid JSON from OpenAI');
  }

  return normalizeRecipe(parsed);
}
