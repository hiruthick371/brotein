import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';
import { HttpError } from '../utils/apiError';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function requireAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    next(new HttpError(401, 'Missing or invalid authorization header'));
    return;
  }

  const token = header.slice('Bearer '.length);
  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    next(new HttpError(401, 'Invalid or expired token'));
  }
}
