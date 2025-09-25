import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';

// For now, this is a mock. In the future, it would hold admin user details.
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

// Mock implementation
export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // We'll start with a logged-in state for development convenience.
  // Set to `null` to test the login page.
  const [user, setUser] = useState<AdminUser | null>({ email: 'superadmin@cryptocraft.app', role: 'SUPER_ADMIN' });
  const [token, setToken] = useState<string | null>('mock-admin-token');
  const [isLoading, setIsLoading] = useState(false); // No initial loading needed for mock

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(res => setTimeout(res, 1000));
    if (email === 'admin' && pass === 'admin') {
        setUser({ email: 'superadmin@cryptocraft.app', role: 'SUPER_ADMIN' });
        setToken('mock-admin-token');
    } else {
        throw new Error('Invalid credentials');
    }
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: !!user,
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