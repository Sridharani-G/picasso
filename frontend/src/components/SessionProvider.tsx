'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import SessionManager from '@/utils/sessionManager';

interface SessionContextType {
  user: any;
  isLoggedIn: boolean;
  token: string | null;
  login: (token: string, userData: any) => void;
  logout: () => void;
  updateUser: (userData: any) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    SessionManager.init();
    const currentToken = SessionManager.getToken();
    const userData = SessionManager.getUser();

    setToken(currentToken);
    if (currentToken && userData) {
      setUser(userData);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
    const handleAuthChange = (isCurrentlyLoggedIn: boolean) => {
      const currentToken = SessionManager.getToken();
      const userData = SessionManager.getUser();
      setToken(currentToken);
      if (isCurrentlyLoggedIn) {
        setUser(userData);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    };

    SessionManager.addListener(handleAuthChange);
    return () => {
      SessionManager.removeListener(handleAuthChange);
    };
  }, []);

  const login = (token: string, userData: any, rememberMe: boolean = true) => {
    SessionManager.saveSession(token, userData, rememberMe);
    setToken(token);
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = () => {
    SessionManager.logout();
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
  };

  const updateUser = (userData: any) => {
    setUser(userData);
    const token = SessionManager.getToken();
    if (token) {
      SessionManager.saveSession(token, userData, true);
    }
  };

  return (
    <SessionContext.Provider value={{ user, isLoggedIn, token, login, logout, updateUser }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
