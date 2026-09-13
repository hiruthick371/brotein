import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { User } from '@brotein/shared';
import {
  clearStoredUser,
  loadStoredUser,
  loadToken,
  saveStoredUser,
  setToken,
} from '../authStorage';

interface AuthContextValue {
  user: User | null;
  isReady: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [token, storedUser] = await Promise.all([
        loadToken(),
        loadStoredUser<User>(),
      ]);
      if (token && storedUser) {
        setUser(storedUser);
      }
      setIsReady(true);
    })();
  }, []);

  const login = useCallback(async (token: string, nextUser: User) => {
    await setToken(token);
    await saveStoredUser(nextUser);
    setUser(nextUser);
  }, []);

  const logout = useCallback(async () => {
    await setToken(null);
    await clearStoredUser();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isReady,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, isReady, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
