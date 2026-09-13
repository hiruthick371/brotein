import { Schema, model, Document, Types } from 'mongoose';

export interface DailyGoalDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
}

const dailyGoalSchema = new Schema<DailyGoalDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  calorieTarget: { type: Number, required: true, default: 2000, min: 0 },
  proteinTarget: { type: Number, required: true, default: 150, min: 0 },
  carbsTarget: { type: Number, required: true, default: 200, min: 0 },
  fatTarget: { type: Number, required: true, default: 60, min: 0 },
});

export const DailyGoal = model<DailyGoalDocument>('DailyGoal', dailyGoalSchema);
