import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginGuest: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch {
          // If token expired or invalid, auto-login as guest
          try {
            const guestRes = await api.guestLogin();
            setUser(guestRes.user);
          } catch {
            setUser({ id: 0, email: 'guest@accessable.ai', full_name: 'Guest User', is_active: true, is_guest: true });
          }
        }
      } else {
        // Automatically start guest session so users can immediately scan without friction
        try {
          const guestRes = await api.guestLogin();
          setUser(guestRes.user);
        } catch {
          setUser({ id: 0, email: 'guest@accessable.ai', full_name: 'Guest User', is_active: true, is_guest: true });
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const loginGuest = async () => {
    try {
      const res = await api.guestLogin();
      setUser(res.user);
    } catch {
      setUser({ id: 0, email: 'guest@accessable.ai', full_name: 'Guest User', is_active: true, is_guest: true });
    }
  };

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password: pass });
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, pass: string, name: string) => {
    setIsLoading(true);
    try {
      const res = await api.register({ email, password: pass, full_name: name });
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.setToken(null);
    loginGuest();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !user.is_guest,
        isLoading,
        loginGuest,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
