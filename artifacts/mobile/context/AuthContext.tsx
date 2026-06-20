import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const TOKEN_KEY = "@livingsyria_auth_token";

export interface MobileAuthUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
}

interface AuthContextValue {
  user: MobileAuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MobileAuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setAuthTokenGetter(() => token);
  }, [token]);

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(TOKEN_KEY)
      .then(async (stored) => {
        if (!stored) return;
        try {
          const res = await fetch("/api/me", {
            headers: { Authorization: `Bearer ${stored}` },
          });
          if (!active) return;
          if (res.ok) {
            const data = (await res.json()) as {
              user: MobileAuthUser | null;
            };
            if (data.user) {
              setToken(stored);
              setUser(data.user);
            } else {
              await AsyncStorage.removeItem(TOKEN_KEY);
            }
          } else {
            await AsyncStorage.removeItem(TOKEN_KEY);
          }
        } catch {
          // network error, keep token for retry
          if (active) setToken(stored);
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
      };
      throw new Error(data.message ?? "Invalid credentials");
    }

    const data = (await res.json()) as {
      user?: MobileAuthUser;
      session?: { token?: string };
      token?: string;
    };

    const newToken = data.session?.token ?? data.token;
    if (!newToken) throw new Error("No session token returned");

    await AsyncStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    if (data.user) setUser(data.user);
  }, []);

  const signOut = useCallback(async () => {
    if (token) {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setAuthTokenGetter(null);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useMobileAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useMobileAuth must be used inside AuthProvider");
  return ctx;
}
