import { useState, useEffect, useCallback } from "react";
import type { AuthUser } from "@workspace/api-client-react";

export type { AuthUser };

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/me", { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { user: AuthUser | null };
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  // Listen for cross-instance refresh broadcasts (e.g. from the settings page)
  // so every mounted useAuth copy re-fetches at the same time.
  useEffect(() => {
    const handler = () => { void fetchUser(); };
    window.addEventListener("auth:refresh", handler);
    return () => window.removeEventListener("auth:refresh", handler);
  }, [fetchUser]);

  const refreshUser = useCallback(async () => {
    // Broadcast to all mounted useAuth instances, then re-fetch locally.
    window.dispatchEvent(new Event("auth:refresh"));
  }, []);

  const login = useCallback(() => {
    const path =
      typeof window !== "undefined" ? window.location.pathname : "/";
    const locale = path.startsWith("/en") ? "en" : "ar";
    window.location.href = `/${locale}/auth/login?returnTo=${encodeURIComponent(path)}`;
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore network errors
    }
    window.location.href = "/";
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };
}
