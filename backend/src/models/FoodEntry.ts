import { Schema, model, Document, Types } from 'mongoose';

export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner'];

export interface FoodEntryDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  foodItemId?: Types.ObjectId | null;
  mealType: MealType;
  foodName: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  loggedAt: Date;
  createdAt: Date;
}

const foodEntrySchema = new Schema<FoodEntryDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  foodItemId: { type: Schema.Types.ObjectId, ref: 'FoodItem', default: null },
  mealType: { type: String, enum: MEAL_TYPES, required: true },
  foodName: { type: String, required: true, trim: true },
  calories: { type: Number, required: true, min: 0 },
  proteinG: { type: Number, required: true, min: 0 },
  carbsG: { type: Number, required: true, min: 0 },
  fatG: { type: Number, required: true, min: 0 },
  fiberG: { type: Number, required: true, min: 0 },
  loggedAt: { type: Date, required: true, default: () => new Date(), index: true },
  createdAt: { type: Date, default: () => new Date() },
});

foodEntrySchema.index({ userId: 1, loggedAt: 1 });

export const FoodEntry = model<FoodEntryDocument>('FoodEntry', foodEntrySchema);
