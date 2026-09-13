import { Router } from 'express';
import { getGoals, updateGoals } from '../controllers/goalController';

const router = Router();

router.get('/', getGoals);
router.put('/', updateGoals);

export default router;
