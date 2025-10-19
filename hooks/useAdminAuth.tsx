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
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading to validate token

  useEffect(() => {
    const validateToken = async () => {
      const existingToken = localStorage.getItem('adminToken');
      if (existingToken) {
        try {
          const adminData = await backendApiService.getMe();
          setUser(adminData);
          setToken(existingToken);
        } catch (error) {
          console.error("Admin token validation failed:", error);
          // Token is invalid, clear storage
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    validateToken();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
        const { access_token, user: adminUser } = await backendApiService.login(email, pass);
        localStorage.setItem('adminToken', access_token);
        localStorage.setItem('adminUser', JSON.stringify(adminUser));
        setToken(access_token);
        setUser(adminUser as AdminUser);
    } catch (error) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setToken(null);
        setUser(null);
        throw error;
    } finally {
        setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
  }), [user, token, isLoading, login, logout]);

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