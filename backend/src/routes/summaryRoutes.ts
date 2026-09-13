import { Router } from 'express';
import {
  getDailySummary,
  getMonthlySummary,
  getWeeklySummary,
} from '../controllers/summaryController';

const router = Router();

router.get('/daily', getDailySummary);
router.get('/weekly', getWeeklySummary);
router.get('/monthly', getMonthlySummary);

export default router;
