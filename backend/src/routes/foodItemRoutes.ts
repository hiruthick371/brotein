import { Router } from 'express';
import { createFoodItem, searchFoodItems } from '../controllers/foodItemController';

const router = Router();

router.get('/', searchFoodItems);
router.post('/', createFoodItem);

export default router;
