import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { DailyGoal } from '../models/DailyGoal';
import { signToken } from '../utils/jwt';
import { HttpError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';

function serializeUser(user: { _id: unknown; name: string; email: string; createdAt: Date }) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
  };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || !email || !password) {
    throw new HttpError(400, 'name, email, and password are required');
  }
  if (password.length < 6) {
    throw new HttpError(400, 'password must be at least 6 characters');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new HttpError(409, 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash });
  await DailyGoal.create({ userId: user._id });

  const token = signToken({ userId: String(user._id) });
  res.status(201).json({ token, user: serializeUser(user) });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    throw new HttpError(400, 'email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const token = signToken({ userId: String(user._id) });
  res.json({ token, user: serializeUser(user) });
});
