import { HttpError } from './apiError';

const DAY_MS = 24 * 60 * 60 * 1000;

export function parseDateOnly(value: string, fieldName: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new HttpError(400, `${fieldName} must be in YYYY-MM-DD format`);
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new HttpError(400, `${fieldName} is not a valid date`);
  }
  return date;
}

export function dayBounds(dateOnly: Date): { start: Date; end: Date } {
  const start = new Date(dateOnly);
  const end = new Date(dateOnly.getTime() + DAY_MS);
  return { start, end };
}

export function toDateOnlyString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function monthBounds(month: number, year: number): { start: Date; end: Date } {
  if (month < 1 || month > 12) {
    throw new HttpError(400, 'month must be between 1 and 12');
  }
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  return { start, end };
}
