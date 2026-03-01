// ============================================
// Auth Context - User State Management
// ============================================

"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { authApi } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  loginWithGoogle: (token: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Verify token with backend
async function verifyToken(token: string): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user || null;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Check localStorage for token
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

        if (storedToken) {
          // Verify token with backend
          const verifiedUser = await verifyToken(storedToken);
          
          if (verifiedUser) {
            setToken(storedToken);
            setUser(verifiedUser);
          } else {
            // Token invalid, clear it
            localStorage.removeItem('auth_token');
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Session restore failed:', error);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    
    if (response.error) {
      return { error: response.error };
    }

    if (response.data?.user && response.data?.token) {
      setUser(response.data.user);
      setToken(response.data.token);
      // Store token in localStorage for persistence across refreshes
      localStorage.setItem('auth_token', response.data.token);
    }

    return {};
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await authApi.register({ name, email, password });
    
    if (response.error) {
      return { error: response.error };
    }

    if (response.data?.user && response.data?.token) {
      setUser(response.data.user);
      setToken(response.data.token);
      // Store token in localStorage for persistence across refreshes
      localStorage.setItem('auth_token', response.data.token);
    }

    return {};
  };

  const loginWithGoogle = async (googleToken: string) => {
    const response = await authApi.googleLogin(googleToken);
    
    if (response.error) {
      return { error: response.error };
    }

    if (response.data?.user && response.data?.token) {
      setUser(response.data.user);
      setToken(response.data.token);
      // Store token in localStorage for persistence across refreshes
      localStorage.setItem('auth_token', response.data.token);
    }

    return {};
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setToken(null);
    // Clear token from localStorage
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginWithGoogle, logout, setUser }}>
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
