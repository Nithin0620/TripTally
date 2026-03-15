// ============================================
// Auth Context - User State Management
// Uses HTTP-only cookies for secure token storage
// ============================================

"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { authApi } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  loginWithGoogle: (token: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Check current session from HTTP-only cookie
 */
async function checkSession(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include', // Important: send cookies
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user || null;
  } catch (error) {
    console.error('Session check failed:', error);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount from HTTP-only cookie
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const sessionUser = await checkSession();
        setUser(sessionUser);
      } catch (error) {
        console.error('Session restore failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Refresh session (useful after login/register)
  const refreshSession = async () => {
    try {
      const sessionUser = await checkSession();
      setUser(sessionUser);
    } catch (error) {
      console.error('Session refresh failed:', error);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    
    if (response.error) {
      return { error: response.error };
    }

    // Token is now stored in HTTP-only cookie by the server
    // Refresh session to get user data
    await refreshSession();

    return {};
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await authApi.register({ name, email, password });
    
    if (response.error) {
      return { error: response.error };
    }

    // Token is now stored in HTTP-only cookie by the server
    // Refresh session to get user data
    await refreshSession();

    return {};
  };

  const loginWithGoogle = async (googleToken: string) => {
    const response = await authApi.googleLogin(googleToken);
    
    if (response.error) {
      return { error: response.error };
    }

    // Token is now stored in HTTP-only cookie by the server
    // Refresh session to get user data
    await refreshSession();

    return {};
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    // Cookie is cleared by the server
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout, setUser, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
