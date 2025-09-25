import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { backendApiService } from '../services/backendApiService';

interface AdminUser {
    email: string;
    role: 'SUPER_ADMIN' | 'MODERATOR' | 'admin';
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
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if a token exists and is valid on initial load (optional, but good practice)
    // For this implementation, we just trust the stored token if it exists.
    if (token) {
        // In a real app, you would validate the token against a '/auth/me' endpoint here.
        // For now, we'll just set a mock user if a token is found.
        setUser({ email: 'superadmin@cryptocraft.app', role: 'admin' });
    }
    setIsLoading(false);
  }, [token]);


  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
        // FIX: Corrected service call to use `backendApiService` which handles real API calls.
        const { access_token, user: adminUser } = await backendApiService.login(email, pass);
        localStorage.setItem('adminToken', access_token);
        setToken(access_token);
        setUser(adminUser);
    } catch (error) {
        // Clear any stale tokens on login failure
        localStorage.removeItem('adminToken');
        setToken(null);
        setUser(null);
        throw error; // Re-throw for the login page to handle
    } finally {
        setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('adminToken');
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