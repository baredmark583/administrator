import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { backendApiService } from '../services/backendApiService';

interface AdminUser {
    id?: string;
    name?: string;
    email: string;
    role: 'SUPER_ADMIN' | 'MODERATOR';
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading to validate session

  useEffect(() => {
    const validateToken = async () => {
      try {
        const adminData = await backendApiService.getMe();
        setUser(adminData);
      } catch (error) {
        console.warn('Admin session validation failed:', error);
        setUser(null);
      }
      setIsLoading(false);
    };

    validateToken();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
        await backendApiService.login(email, pass);
        const adminData = await backendApiService.getMe();
        setUser(adminData);
    } catch (error) {
        setUser(null);
        throw error;
    } finally {
        setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    // Optional: call backend logout endpoint if/when it exists
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  }), [user, isLoading, login, logout]);

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
