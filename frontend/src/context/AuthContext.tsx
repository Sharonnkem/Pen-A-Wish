import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";

import { authService } from "../services/auth.service";
import {
  clearStoredSession,
  getAccessToken,
  getAccessTokenExpiryMs,
  getStoredUser,
  setAccessToken,
  setStoredUser
} from "../services/token-storage";
import type { AuthUser } from "../types/auth";

type AuthContextValue = {
  forgotPassword: (input: { email: string }) => Promise<string>;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (input: { email: string; password: string }) => Promise<AuthUser>;
  deleteAccount: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (input: {
    avatarUrl: string | null;
    email: string;
    name: string;
  }) => Promise<AuthUser>;
  refreshSession: () => Promise<void>;
  register: (input: {
    email: string;
    name: string;
    password: string;
  }) => Promise<AuthUser>;
  resetPassword: (input: { password: string; token: string }) => Promise<string>;
  user: AuthUser | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function persistSession(accessToken: string, user: AuthUser) {
  setAccessToken(accessToken);
  setStoredUser(user);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser());
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const storedUser = getStoredUser();
      const storedAccessToken = getAccessToken();

      if (!storedUser && !storedAccessToken) {
        if (mounted) {
          setIsInitializing(false);
        }

        return;
      }

      if (!storedUser || !storedAccessToken) {
        clearStoredSession();

        if (mounted) {
          setUser(null);
          setIsInitializing(false);
        }

        return;
      }

      const expiresAt = getAccessTokenExpiryMs(storedAccessToken);
      const isTokenFresh = expiresAt ? expiresAt > Date.now() + 60_000 : false;

      if (!isTokenFresh) {
        if (mounted) {
          setUser(storedUser);
          setIsInitializing(false);
        }

        void authService
          .refreshToken()
          .then((response) => {
            if (!mounted) {
              return;
            }

            persistSession(response.data.accessToken, response.data.user);
            setUser(response.data.user);
          })
          .catch(() => {
            if (!mounted) {
              return;
            }

            clearStoredSession();
            setUser(null);
          });

        return;
      }

      if (mounted) {
        setUser(storedUser);
        setIsInitializing(false);
      }
    }

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  const hasAccessToken = Boolean(getAccessToken());

  const value = useMemo<AuthContextValue>(
    () => ({
      async forgotPassword(input) {
        const response = await authService.forgotPassword(input);
        return response.message;
      },
      isAuthenticated: Boolean(user && hasAccessToken),
      isInitializing,
      async login(input) {
        const response = await authService.login(input);
        persistSession(response.data.accessToken, response.data.user);
        setUser(response.data.user);
        return response.data.user;
      },
      async deleteAccount() {
        await authService.deleteAccount();
        clearStoredSession();
        setUser(null);
      },
      async logout() {
        try {
          await authService.logout();
        } finally {
          clearStoredSession();
          setUser(null);
        }
      },
      async updateProfile(input) {
        const response = await authService.updateProfile(input);
        if (response.data.accessToken) {
          persistSession(response.data.accessToken, response.data.user);
        } else {
          setStoredUser(response.data.user);
        }
        setUser(response.data.user);
        return response.data.user;
      },
      async refreshSession() {
        const response = await authService.refreshToken();
        persistSession(response.data.accessToken, response.data.user);
        setUser(response.data.user);
      },
      async register(input) {
        const response = await authService.register(input);
        persistSession(response.data.accessToken, response.data.user);
        setUser(response.data.user);
        return response.data.user;
      },
      async resetPassword(input) {
        const response = await authService.resetPassword(input);
        clearStoredSession();
        setUser(null);
        return response.message;
      },
      user
    }),
    [hasAccessToken, isInitializing, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
