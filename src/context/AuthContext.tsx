'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  user: string | null;
  error: string | null;
  login: (username: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Restore auth state from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('fx-pulse-auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.isAuthenticated && parsed.user) {
          setIsAuthenticated(true);
          setUser(parsed.user);
        }
      } catch {
        // ignore corrupted data
      }
    }
    setHydrated(true);
  }, []);

  // Persist auth state to sessionStorage
  useEffect(() => {
    if (hydrated) {
      sessionStorage.setItem(
        'fx-pulse-auth',
        JSON.stringify({ isAuthenticated, user })
      );
    }
  }, [isAuthenticated, user, hydrated]);

  const login = (username: string, password: string) => {
    setError(null);
    if (username === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
      setUser(username);
    } else {
      setError('Invalid username or password');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
    sessionStorage.removeItem('fx-pulse-auth');
  };

  // Don't render children until hydration is complete to avoid flash
  if (!hydrated) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, error, login, logout }}>
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
