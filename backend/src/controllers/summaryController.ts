import { Response } from 'express';
import { Types } from 'mongoose';
import { FoodEntry } from '../models/FoodEntry';
import { DailyGoal } from '../models/DailyGoal';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { HttpError } from '../utils/apiError';
import { dayBounds, monthBounds, parseDateOnly, toDateOnlyString } from '../utils/dateRange';

interface MacroTotals {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

const EMPTY_TOTALS: MacroTotals = {
  calories: 0,
  proteinG: 0,
  carbsG: 0,
  fatG: 0,
  fiberG: 0,
};

function serializeGoal(goal: {
  _id: unknown;
  userId: unknown;
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
} | null) {
  if (!goal) return null;
  return {
    id: String(goal._id),
    userId: String(goal.userId),
    calorieTarget: goal.calorieTarget,
    proteinTarget: goal.proteinTarget,
    carbsTarget: goal.carbsTarget,
    fatTarget: goal.fatTarget,
  };
}

function serializeEntry(entry: {
  _id: unknown;
  userId: unknown;
  foodItemId?: unknown;
  mealType: string;
  foodName: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  loggedAt: Date;
  createdAt: Date;
}) {
  return {
    id: String(entry._id),
    userId: String(entry.userId),
    foodItemId: entry.foodItemId ? String(entry.foodItemId) : null,
    mealType: entry.mealType,
    foodName: entry.foodName,
    calories: entry.calories,
    proteinG: entry.proteinG,
    carbsG: entry.carbsG,
    fatG: entry.fatG,
    fiberG: entry.fiberG,
    loggedAt: entry.loggedAt.toISOString(),
    createdAt: entry.createdAt.toISOString(),
  };
}

const MACRO_GROUP_STAGE = {
  calories: { $sum: '$calories' },
  proteinG: { $sum: '$proteinG' },
  carbsG: { $sum: '$carbsG' },
  fatG: { $sum: '$fatG' },
  fiberG: { $sum: '$fiberG' },
};

interface DayBucket {
  _id: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

interface TotalBucket {
  _id: null;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

async function aggregateRange(userId: string, start: Date, end: Date) {
  const [result] = await FoodEntry.aggregate<{
    byDay: DayBucket[];
    total: TotalBucket[];
  }>([
    {
      $match: {
        userId: new Types.ObjectId(userId),
        loggedAt: { $gte: start, $lt: end },
      },
    },
    {
      $facet: {
        byDay: [
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$loggedAt' } },
              ...MACRO_GROUP_STAGE,
            },
          },
          { $sort: { _id: 1 } },
        ],
        total: [
          {
            $group: {
              _id: null,
              ...MACRO_GROUP_STAGE,
            },
          },
        ],
      },
    },
  ]);

  return result;
}

export const getDailySummary = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const dateParam = typeof req.query.date === 'string' ? req.query.date : undefined;
    const dateOnly = dateParam ? parseDateOnly(dateParam, 'date') : parseDateOnly(toDateOnlyString(new Date()), 'date');
    const { start, end } = dayBounds(dateOnly);

    const [entries, goal] = await Promise.all([
      FoodEntry.find({
        userId: req.userId,
        loggedAt: { $gte: start, $lt: end },
      }).sort({ loggedAt: 1 }),
      DailyGoal.findOne({ userId: req.userId }),
    ]);

    const totals = entries.reduce<MacroTotals>(
      (acc, entry) => ({
        calories: acc.calories + entry.calories,
        proteinG: acc.proteinG + entry.proteinG,
        carbsG: acc.carbsG + entry.carbsG,
        fatG: acc.fatG + entry.fatG,
        fiberG: acc.fiberG + entry.fiberG,
      }),
      { ...EMPTY_TOTALS }
    );

    res.json({
      date: toDateOnlyString(dateOnly),
      totals,
      goal: serializeGoal(goal),
      entries: entries.map(serializeEntry),
    });
  }
);

export const getWeeklySummary = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { from, to } = req.query as { from?: string; to?: string };
    if (!from || !to) {
      throw new HttpError(400, 'from and to query params are required (YYYY-MM-DD)');
    }

    const fromDate = parseDateOnly(from, 'from');
    const toDateOnly = parseDateOnly(to, 'to');
    const { end } = dayBounds(toDateOnly);

    const [result, goal] = await Promise.all([
      aggregateRange(req.userId as string, fromDate, end),
      DailyGoal.findOne({ userId: req.userId }),
    ]);

    const total = result?.total[0];
    const totals: MacroTotals = total
      ? {
          calories: total.calories,
          proteinG: total.proteinG,
          carbsG: total.carbsG,
          fatG: total.fatG,
          fiberG: total.fiberG,
        }
      : { ...EMPTY_TOTALS };

    const days = (result?.byDay ?? []).map((bucket) => ({
      date: bucket._id,
      totals: {
        calories: bucket.calories,
        proteinG: bucket.proteinG,
        carbsG: bucket.carbsG,
        fatG: bucket.fatG,
        fiberG: bucket.fiberG,
      },
    }));

    res.json({
      from: toDateOnlyString(fromDate),
      to: toDateOnlyString(toDateOnly),
      totals,
      days,
      goal: serializeGoal(goal),
    });
  }
);

export const getMonthlySummary = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { month, year } = req.query as { month?: string; year?: string };
    if (!month || !year) {
      throw new HttpError(400, 'month and year query params are required');
    }

    const monthNum = Number(month);
    const yearNum = Number(year);
    if (!Number.isInteger(monthNum) || !Number.isInteger(yearNum)) {
      throw new HttpError(400, 'month and year must be integers');
    }

    const { start, end } = monthBounds(monthNum, yearNum);

    const [result, goal] = await Promise.all([
      aggregateRange(req.userId as string, start, end),
      DailyGoal.findOne({ userId: req.userId }),
    ]);

    const total = result?.total[0];
    const totals: MacroTotals = total
      ? {
          calories: total.calories,
          proteinG: total.proteinG,
          carbsG: total.carbsG,
          fatG: total.fatG,
          fiberG: total.fiberG,
        }
      : { ...EMPTY_TOTALS };

    const days = (result?.byDay ?? []).map((bucket) => ({
      date: bucket._id,
      totals: {
        calories: bucket.calories,
        proteinG: bucket.proteinG,
        carbsG: bucket.carbsG,
        fatG: bucket.fatG,
        fiberG: bucket.fiberG,
      },
    }));

    res.json({
      month: monthNum,
      year: yearNum,
      from: toDateOnlyString(start),
      to: toDateOnlyString(new Date(end.getTime() - 1)),
      totals,
      days,
      goal: serializeGoal(goal),
    });
  }
);
