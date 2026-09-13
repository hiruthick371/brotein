import { Response } from 'express';
import { Types } from 'mongoose';
import { FoodEntry, MEAL_TYPES, MealType } from '../models/FoodEntry';
import { FoodItem } from '../models/FoodItem';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { HttpError } from '../utils/apiError';

function serializeEntry(entry: {
  _id: unknown;
  userId: unknown;
  foodItemId?: unknown;
  mealType: MealType;
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

interface CreateEntryBody {
  foodItemId?: string | null;
  mealType?: MealType;
  foodName?: string;
  loggedAt?: string;
  servingMultiplier?: number;
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  fiberG?: number;
}

export const createEntry = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const body = req.body as CreateEntryBody;

    if (!body.mealType || !MEAL_TYPES.includes(body.mealType)) {
      throw new HttpError(400, `mealType must be one of ${MEAL_TYPES.join(', ')}`);
    }

    const loggedAt = body.loggedAt ? new Date(body.loggedAt) : new Date();
    if (Number.isNaN(loggedAt.getTime())) {
      throw new HttpError(400, 'loggedAt must be a valid date');
    }

    let macros: {
      foodName: string;
      calories: number;
      proteinG: number;
      carbsG: number;
      fatG: number;
      fiberG: number;
      foodItemId: Types.ObjectId | null;
    };

    if (body.foodItemId) {
      if (!Types.ObjectId.isValid(body.foodItemId)) {
        throw new HttpError(400, 'foodItemId is not a valid id');
      }
      const foodItem = await FoodItem.findById(body.foodItemId);
      if (!foodItem) {
        throw new HttpError(404, 'FoodItem not found');
      }
      const multiplier = body.servingMultiplier && body.servingMultiplier > 0
        ? body.servingMultiplier
        : 1;

      macros = {
        foodName: body.foodName?.trim() || foodItem.name,
        calories: foodItem.calories * multiplier,
        proteinG: foodItem.proteinG * multiplier,
        carbsG: foodItem.carbsG * multiplier,
        fatG: foodItem.fatG * multiplier,
        fiberG: foodItem.fiberG * multiplier,
        foodItemId: foodItem._id,
      };
    } else {
      if (!body.foodName?.trim()) {
        throw new HttpError(400, 'foodName is required for a custom entry');
      }
      const requiredNumeric: (keyof CreateEntryBody)[] = [
        'calories',
        'proteinG',
        'carbsG',
        'fatG',
        'fiberG',
      ];
      for (const field of requiredNumeric) {
        if (typeof body[field] !== 'number' || (body[field] as number) < 0) {
          throw new HttpError(400, `${field} must be a non-negative number for a custom entry`);
        }
      }

      macros = {
        foodName: body.foodName.trim(),
        calories: body.calories as number,
        proteinG: body.proteinG as number,
        carbsG: body.carbsG as number,
        fatG: body.fatG as number,
        fiberG: body.fiberG as number,
        foodItemId: null,
      };
    }

    const entry = await FoodEntry.create({
      userId: req.userId,
      foodItemId: macros.foodItemId,
      mealType: body.mealType,
      foodName: macros.foodName,
      calories: macros.calories,
      proteinG: macros.proteinG,
      carbsG: macros.carbsG,
      fatG: macros.fatG,
      fiberG: macros.fiberG,
      loggedAt,
    });

    res.status(201).json(serializeEntry(entry));
  }
);

export const listEntries = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { from, to, mealType } = req.query as {
      from?: string;
      to?: string;
      mealType?: string;
    };

    const filter: Record<string, unknown> = { userId: req.userId };

    if (from || to) {
      const range: Record<string, Date> = {};
      if (from) {
        const fromDate = new Date(from);
        if (Number.isNaN(fromDate.getTime())) {
          throw new HttpError(400, 'from must be a valid date');
        }
        range.$gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        if (Number.isNaN(toDate.getTime())) {
          throw new HttpError(400, 'to must be a valid date');
        }
        range.$lte = toDate;
      }
      filter.loggedAt = range;
    }

    if (mealType) {
      if (!MEAL_TYPES.includes(mealType as MealType)) {
        throw new HttpError(400, `mealType must be one of ${MEAL_TYPES.join(', ')}`);
      }
      filter.mealType = mealType;
    }

    const entries = await FoodEntry.find(filter).sort({ loggedAt: -1 });
    res.json(entries.map(serializeEntry));
  }
);

export const updateEntry = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpError(400, 'Invalid entry id');
    }

    const entry = await FoodEntry.findOne({ _id: id, userId: req.userId });
    if (!entry) {
      throw new HttpError(404, 'Entry not found');
    }

    const body = req.body as Partial<CreateEntryBody>;

    if (body.mealType) {
      if (!MEAL_TYPES.includes(body.mealType)) {
        throw new HttpError(400, `mealType must be one of ${MEAL_TYPES.join(', ')}`);
      }
      entry.mealType = body.mealType;
    }
    if (body.foodName !== undefined) entry.foodName = body.foodName.trim();
    if (body.calories !== undefined) entry.calories = body.calories;
    if (body.proteinG !== undefined) entry.proteinG = body.proteinG;
    if (body.carbsG !== undefined) entry.carbsG = body.carbsG;
    if (body.fatG !== undefined) entry.fatG = body.fatG;
    if (body.fiberG !== undefined) entry.fiberG = body.fiberG;
    if (body.loggedAt !== undefined) {
      const loggedAt = new Date(body.loggedAt);
      if (Number.isNaN(loggedAt.getTime())) {
        throw new HttpError(400, 'loggedAt must be a valid date');
      }
      entry.loggedAt = loggedAt;
    }

    await entry.save();
    res.json(serializeEntry(entry));
  }
);

export const deleteEntry = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpError(400, 'Invalid entry id');
    }

    const result = await FoodEntry.deleteOne({ _id: id, userId: req.userId });
    if (result.deletedCount === 0) {
      throw new HttpError(404, 'Entry not found');
    }

    res.json({ success: true });
  }
);
