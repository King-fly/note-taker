// Type definitions for auth-context
declare module "@/auth-context" {
  import React from 'react';
  
  export interface AuthContextType {
    user: import("./api").UserProfile | null;
    stats: import("./api").ProfileStats | null;
    token: string | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string, displayName?: string, grade?: string) => Promise<void>;
    logout: () => void;
  }
  
  export const useAuth: () => AuthContextType;
  export const AuthProvider: React.FC<{ children: React.ReactNode }>;
}