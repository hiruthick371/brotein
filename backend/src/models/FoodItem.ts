import { Schema, model, Document, Types } from 'mongoose';

export interface FoodItemDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  servingSize: number;
  servingUnit: string;
}

const foodItemSchema = new Schema<FoodItemDocument>({
  name: { type: String, required: true, trim: true, index: true },
  calories: { type: Number, required: true, min: 0 },
  proteinG: { type: Number, required: true, min: 0 },
  carbsG: { type: Number, required: true, min: 0 },
  fatG: { type: Number, required: true, min: 0 },
  fiberG: { type: Number, required: true, min: 0 },
  servingSize: { type: Number, required: true, min: 0 },
  servingUnit: { type: String, required: true, trim: true },
});

foodItemSchema.index({ name: 'text' });

export const FoodItem = model<FoodItemDocument>('FoodItem', foodItemSchema);
