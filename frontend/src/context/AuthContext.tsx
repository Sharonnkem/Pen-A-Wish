import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";

import { authService } from "@/services/auth.service";
import {
  clearStoredSession,
  getAccessToken,
  getStoredUser,
  setAccessToken,
  setStoredUser
} from "@/services/token-storage";
import type { AuthUser } from "@/types/auth";

type AuthContextValue = {
  forgotPassword: (input: { email: string }) => Promise<string>;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (input: { email: string; password: string }) => Promise<AuthUser>;
  logout: () => Promise<void>;
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

      try {
        const response = await authService.refreshToken();

        if (!mounted) {
          return;
        }

        persistSession(response.data.accessToken, response.data.user);
        setUser(response.data.user);
      } catch {
        if (!mounted) {
          return;
        }

        clearStoredSession();
        setUser(null);
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
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
      async logout() {
        try {
          await authService.logout();
        } finally {
          clearStoredSession();
          setUser(null);
        }
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
