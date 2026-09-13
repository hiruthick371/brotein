import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/apiError';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `Not found: ${req.method} ${req.path}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, details: err.details });
    return;
  }

  if (err instanceof Error && err.name === 'ValidationError') {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err instanceof Error && err.name === 'MongoServerError' && (err as unknown as { code?: number }).code === 11000) {
    res.status(409).json({ error: 'Duplicate value violates a unique constraint' });
    return;
  }

  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}
