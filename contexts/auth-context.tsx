'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  initGoogleAuth,
  signIn as gisSignIn,
  signOut as gisSignOut,
  getAccessToken,
} from '@/lib/gmail/auth';

interface UserProfile {
  email: string;
  name: string;
  picture: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  signIn: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const USER_PROFILE_KEY = 'myinboxreport_user';

function persistUser(profile: UserProfile): void {
  try {
    sessionStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch { /* ignore */ }
}

function restoreUser(): UserProfile | null {
  try {
    const raw = sessionStorage.getItem(USER_PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function clearUser(): void {
  try {
    sessionStorage.removeItem(USER_PROFILE_KEY);
  } catch { /* ignore */ }
}

async function fetchUserProfile(token: string): Promise<UserProfile> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch user profile');
  }
  const data = await res.json();
  return {
    email: data.email,
    name: data.name ?? data.email,
    picture: data.picture ?? '',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Try to restore session before GIS loads
    const token = getAccessToken();
    if (token) {
      const cached = restoreUser();
      if (cached) {
        setUser(cached);
      }
    }

    initGoogleAuth()
      .catch((err) => {
        console.error('Failed to initialize Google Auth:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const signIn = useCallback(async () => {
    const tokenResponse = await gisSignIn();
    const profile = await fetchUserProfile(tokenResponse.access_token);
    persistUser(profile);
    setUser(profile);
  }, []);

  const signOut = useCallback(() => {
    gisSignOut();
    clearUser();
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      isAuthenticated: !!user && !!getAccessToken(),
      isLoading,
      user,
      signIn,
      signOut,
    }),
    [user, isLoading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
