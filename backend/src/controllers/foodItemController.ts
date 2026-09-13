import { Response } from 'express';
import { FoodItem } from '../models/FoodItem';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { HttpError } from '../utils/apiError';

function serializeFoodItem(item: {
  _id: unknown;
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  servingSize: number;
  servingUnit: string;
}) {
  return {
    id: String(item._id),
    name: item.name,
    calories: item.calories,
    proteinG: item.proteinG,
    carbsG: item.carbsG,
    fatG: item.fatG,
    fiberG: item.fiberG,
    servingSize: item.servingSize,
    servingUnit: item.servingUnit,
  };
}

export const searchFoodItems = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    const filter = search
      ? { name: { $regex: search, $options: 'i' } }
      : {};

    const items = await FoodItem.find(filter).sort({ name: 1 }).limit(50);
    res.json(items.map(serializeFoodItem));
  }
);

interface CreateFoodItemBody {
  name?: string;
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  fiberG?: number;
  servingSize?: number;
  servingUnit?: string;
}

export const createFoodItem = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const body = req.body as CreateFoodItemBody;

    if (!body.name?.trim()) {
      throw new HttpError(400, 'name is required');
    }
    if (!body.servingUnit?.trim()) {
      throw new HttpError(400, 'servingUnit is required');
    }

    const numericFields: (keyof CreateFoodItemBody)[] = [
      'calories',
      'proteinG',
      'carbsG',
      'fatG',
      'fiberG',
      'servingSize',
    ];
    for (const field of numericFields) {
      if (typeof body[field] !== 'number' || (body[field] as number) < 0) {
        throw new HttpError(400, `${field} must be a non-negative number`);
      }
    }

    const item = await FoodItem.create({
      name: body.name.trim(),
      calories: body.calories,
      proteinG: body.proteinG,
      carbsG: body.carbsG,
      fatG: body.fatG,
      fiberG: body.fiberG,
      servingSize: body.servingSize,
      servingUnit: body.servingUnit.trim(),
    });

    res.status(201).json(serializeFoodItem(item));
  }
);
