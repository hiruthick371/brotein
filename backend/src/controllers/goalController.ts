import { Response } from 'express';
import { DailyGoal } from '../models/DailyGoal';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../middleware/auth';

function serializeGoal(goal: {
  _id: unknown;
  userId: unknown;
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
}) {
  return {
    id: String(goal._id),
    userId: String(goal.userId),
    calorieTarget: goal.calorieTarget,
    proteinTarget: goal.proteinTarget,
    carbsTarget: goal.carbsTarget,
    fatTarget: goal.fatTarget,
  };
}

async function getOrCreateGoal(userId: string) {
  let goal = await DailyGoal.findOne({ userId });
  if (!goal) {
    goal = await DailyGoal.create({ userId });
  }
  return goal;
}

export const getGoals = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const goal = await getOrCreateGoal(req.userId as string);
    res.json(serializeGoal(goal));
  }
);

export const updateGoals = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const body = req.body as Partial<{
      calorieTarget: number;
      proteinTarget: number;
      carbsTarget: number;
      fatTarget: number;
    }>;

    const goal = await getOrCreateGoal(req.userId as string);

    if (body.calorieTarget !== undefined) goal.calorieTarget = body.calorieTarget;
    if (body.proteinTarget !== undefined) goal.proteinTarget = body.proteinTarget;
    if (body.carbsTarget !== undefined) goal.carbsTarget = body.carbsTarget;
    if (body.fatTarget !== undefined) goal.fatTarget = body.fatTarget;

    await goal.save();
    res.json(serializeGoal(goal));
  }
);
