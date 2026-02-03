import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi, type AuthUser } from "@/lib/auth";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(authApi.getStoredUser());
  const [isLoading, setIsLoading] = useState(authApi.hasToken());

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      if (!authApi.hasToken()) {
        setIsLoading(false);
        return;
      }

      try {
        const me = await authApi.me();
        if (isMounted) {
          setUser(me);
        }
      } catch {
        authApi.clear();
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      async login(email, password) {
        const loggedUser = await authApi.login(email, password);
        setUser(loggedUser);
        return loggedUser;
      },
      async logout() {
        await authApi.logout();
        setUser(null);
      },
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }
  return context;
}
