import { BroteinApiClient } from '@brotein/shared';
import { getToken } from './authStorage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

export const api = new BroteinApiClient({
  baseUrl: API_BASE_URL,
  getToken,
});
