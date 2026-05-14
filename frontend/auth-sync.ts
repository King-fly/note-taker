/**
 * Persists auth token to localStorage on every change.
 */

import { useEffect } from "react";
import { getAuthToken } from "@/api";

export function useTokenSync() {
  // This effect syncs the global token (set by API calls) to localStorage
  // by re-reading and storing it. The real work happens in api.ts's
  // setAuthToken / clearAuthToken helpers.
  useEffect(() => {
    // Verify token is synced on mount
    const token = getAuthToken();
    if (token) {
      try {
        localStorage.setItem("access_token", token);
      } catch {}
    }
  }, []);
}
