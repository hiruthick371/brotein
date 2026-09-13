import type { MealType } from './types';

export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner'];

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  snack: 'Snack',
  dinner: 'Dinner',
};

export const DEFAULT_GOAL = {
  calorieTarget: 2000,
  proteinTarget: 150,
  carbsTarget: 200,
  fatTarget: 60,
};

export const MACRO_COLORS = {
  protein: '#00e054',
  carbs: '#ff8000',
  fat: '#40bcf4',
  fiber: '#ff3f80',
};

export const AUTH_TOKEN_STORAGE_KEY = 'brotein_auth_token';
