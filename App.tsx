import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './hooks/useAdminAuth';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import UserDetailPage from './pages/UserDetailPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import CategoriesPage from './pages/CategoriesPage';
import DisputesPage from './pages/DisputesPage';
import FinancesPage from './pages/FinancesPage';
import SettingsPage from './pages/SettingsPage';
import DebugPage from './pages/DebugPage';
import ProductModerationPage from './pages/ProductModerationPage';
import IconsPage from './pages/IconsPage';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAdminAuth();
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppContent: React.FC = () => {
    const { isAuthenticated } = useAdminAuth();

    return (
        <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />

            <Route path="/*" element={
                <PrivateRoute>
                    <Layout>
                        <Routes>
                             <Route path="/dashboard" element={<DashboardPage />} />
                             <Route path="/users" element={<UsersPage />} />
                             <Route path="/users/:id" element={<UserDetailPage />} />
                             <Route path="/products" element={<ProductsPage />} />
                             <Route path="/products/moderation" element={<ProductModerationPage />} />
                             <Route path="/products/categories" element={<CategoriesPage />} />
                             <Route path="/content/icons" element={<IconsPage />} />
                             <Route path="/orders" element={<OrdersPage />} />
                             <Route path="/finances/transactions" element={<FinancesPage />} />
                             <Route path="/finances/promocodes" element={<FinancesPage />} />
                             <Route path="/disputes" element={<DisputesPage />} />
                             <Route path="/settings" element={<SettingsPage />} />
                             <Route path="/debug" element={<DebugPage />} />
                             <Route path="/" element={<Navigate to="/dashboard" />} />
                        </Routes>
                    </Layout>
                </PrivateRoute>
            } />
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <AdminAuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AdminAuthProvider>
    );
};

export default App;