import express, { Express } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import foodItemRoutes from './routes/foodItemRoutes';
import entryRoutes from './routes/entryRoutes';
import summaryRoutes from './routes/summaryRoutes';
import goalRoutes from './routes/goalRoutes';
import { requireAuth } from './middleware/auth';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? '*' }));
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/food-items', requireAuth, foodItemRoutes);
  app.use('/api/entries', requireAuth, entryRoutes);
  app.use('/api/summary', requireAuth, summaryRoutes);
  app.use('/api/goals', requireAuth, goalRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
