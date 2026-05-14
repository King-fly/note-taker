/**
 * Auth context for managing user state and token lifecycle.
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { login as loginApi, register as registerApi, getProfile, getStats, clearAuthToken, getAuthToken, setAuthToken } from "@/api";
import type { UserProfile, ProfileStats } from "@/api";

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  stats: ProfileStats | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, display_name?: string, grade?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: getAuthToken(),
    user: null,
    stats: null,
    loading: true,
    error: null,
  });

  // Restore user from token on mount
  useEffect(() => {
    if (state.token) {
      refreshUser().catch(() => {
        setState((s) => ({ ...s, loading: false }));
      });
    } else {
      setState((s) => ({ ...s, loading: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshUser = useCallback(async () => {
    if (!state.token) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const [user, stats] = await Promise.all([getProfile(), getStats()]);
      setState((s) => ({ ...s, user, stats, loading: false }));
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.message || "Failed to load user" }));
    }
  }, [state.token]);

  const login = useCallback(async (username: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await loginApi({ username, password });
      // Persist token to localStorage so subsequent API calls can read it
      setAuthToken(res.access_token);
      setState((s) => ({ ...s, token: res.access_token, loading: false, error: null }));
      // Now fetch user data (token is now in localStorage)
      const [user, stats] = await Promise.all([getProfile(), getStats()]);
      setState((s) => ({ ...s, user, stats }));
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.message || "Login failed" }));
      throw err;
    }
  }, []);

  const register = useCallback(async (username: string, email: string, password: string, display_name?: string, grade?: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await registerApi({ username, email, password, display_name, grade });
      // Persist token to localStorage so subsequent API calls can read it
      setAuthToken(res.access_token);
      setState((s) => ({ ...s, token: res.access_token, loading: false, error: null }));
      const [user, stats] = await Promise.all([getProfile(), getStats()]);
      setState((s) => ({ ...s, user, stats }));
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.message || "Registration failed" }));
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    setState({ token: null, user: null, stats: null, loading: false, error: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
