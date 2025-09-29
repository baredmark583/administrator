import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { backendApiService } from '../services/backendApiService';

interface AdminUser {
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
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
        const item = localStorage.getItem('adminUser');
        return item ? JSON.parse(item) : null;
    } catch (error) {
        return null;
    }
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [isLoading, setIsLoading] = useState(false); // No initial loading needed as we read from sync storage

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

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  };

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
  }), [user, token, isLoading]);

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
