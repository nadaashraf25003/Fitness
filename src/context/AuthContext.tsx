import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, LoginCredentials, LoginResult, User } from '../types/auth.types';
import { authService } from '../services/authService';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const currentUser = await authService.fetchMe();
      if (currentUser) {
        setUser(currentUser);
      } else if (!authService.getToken()) {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      const loggedUser = await authService.login(credentials);
      setUser(loggedUser);
      return { success: true };
    } catch (error: any) {
      console.error('Login failed:', error);
      const detail =
        error?.response?.data?.detail ||
        (error?.code === 'ERR_NETWORK'
          ? 'Backend server is unreachable. Ensure the backend is running on http://localhost:8000'
          : error?.message || 'Authentication failed. Please check your credentials.');
      return { success: false, error: detail };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';
  const isReception = user?.role === 'reception';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isStaff,
        isReception,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

