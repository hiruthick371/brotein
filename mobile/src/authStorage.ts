import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_TOKEN_STORAGE_KEY } from '@brotein/shared';

const USER_STORAGE_KEY = 'brotein_user';

let cachedToken: string | null = null;

export async function loadToken(): Promise<string | null> {
  cachedToken = await AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  return cachedToken;
}

export function getToken(): string | null {
  return cachedToken;
}

export async function setToken(token: string | null): Promise<void> {
  cachedToken = token;
  if (token) {
    await AsyncStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  } else {
    await AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }
}

export async function loadStoredUser<T>(): Promise<T | null> {
  const raw = await AsyncStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function saveStoredUser<T>(user: T): Promise<void> {
  await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export async function clearStoredUser(): Promise<void> {
  await AsyncStorage.removeItem(USER_STORAGE_KEY);
}
