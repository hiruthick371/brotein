export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export interface Macros {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface FoodItem extends Macros {
  id: string;
  name: string;
  servingSize: number;
  servingUnit: string;
}

export interface CreateFoodItemPayload extends Macros {
  name: string;
  servingSize: number;
  servingUnit: string;
}

export interface FoodEntry extends Macros {
  id: string;
  userId: string;
  foodItemId?: string | null;
  mealType: MealType;
  foodName: string;
  loggedAt: string;
  createdAt: string;
}

export interface CreateFoodEntryPayload extends Partial<Macros> {
  foodItemId?: string | null;
  mealType: MealType;
  foodName: string;
  loggedAt?: string;
  servingMultiplier?: number;
}

export type UpdateFoodEntryPayload = Partial<CreateFoodEntryPayload>;

export interface DailyGoal {
  id: string;
  userId: string;
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
}

export type UpdateDailyGoalPayload = Partial<
  Omit<DailyGoal, 'id' | 'userId'>
>;

export interface MacroTotals {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

export interface DailySummary {
  date: string;
  totals: MacroTotals;
  goal: DailyGoal | null;
  entries: FoodEntry[];
}

export interface RangeSummaryDay {
  date: string;
  totals: MacroTotals;
}

export interface RangeSummary {
  from: string;
  to: string;
  totals: MacroTotals;
  days: RangeSummaryDay[];
  goal: DailyGoal | null;
}

export interface MonthlySummary extends RangeSummary {
  month: number;
  year: number;
}

export interface ApiErrorBody {
  error: string;
  details?: unknown;
}
