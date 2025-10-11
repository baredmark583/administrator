import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './hooks/useAdminAuth';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import UserDetailPage from './pages/UserDetailPage';
import ProductsPage from './pages/ProductsPage';
import ProductModerationPage from './pages/ProductModerationPage';
import OrdersPage from './pages/OrdersPage';
import DisputesPage from './pages/DisputesPage';
import CategoriesPage from './pages/CategoriesPage';
import IconsPage from './pages/IconsPage';
import FinancesPage from './pages/FinancesPage';
import SettingsPage from './pages/SettingsPage';
import DebugPage from './pages/DebugPage';
import GovernancePage from './pages/GovernancePage';

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAdminAuth();
    if (isLoading) {
        return <div>Loading...</div>; // Or a spinner component
    }
    return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
    const { isAuthenticated, isLoading } = useAdminAuth();

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<PrivateRoute><Layout><Navigate to="/dashboard" /></Layout></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Layout><DashboardPage /></Layout></PrivateRoute>} />
            <Route path="/users" element={<PrivateRoute><Layout><UsersPage /></Layout></PrivateRoute>} />
            <Route path="/users/:id" element={<PrivateRoute><Layout><UserDetailPage /></Layout></PrivateRoute>} />
            <Route path="/products" element={<PrivateRoute><Layout><ProductsPage /></Layout></PrivateRoute>} />
            <Route path="/moderation" element={<PrivateRoute><Layout><ProductModerationPage /></Layout></PrivateRoute>} />
            <Route path="/orders" element={<PrivateRoute><Layout><OrdersPage /></Layout></PrivateRoute>} />
            <Route path="/disputes" element={<PrivateRoute><Layout><DisputesPage /></Layout></PrivateRoute>} />
            <Route path="/governance" element={<PrivateRoute><Layout><GovernancePage /></Layout></PrivateRoute>} />
            <Route path="/categories" element={<PrivateRoute><Layout><CategoriesPage /></Layout></PrivateRoute>} />
            <Route path="/icons" element={<PrivateRoute><Layout><IconsPage /></Layout></PrivateRoute>} />
            <Route path="/finances/*" element={<PrivateRoute><Layout><FinancesPage /></Layout></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Layout><SettingsPage /></Layout></PrivateRoute>} />
            <Route path="/debug" element={<PrivateRoute><Layout><DebugPage /></Layout></PrivateRoute>} />
            <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        </Routes>
    );
};

const App: React.FC = () => {
  return (
    <Router>
        <AdminAuthProvider>
            <AppRoutes />
        </AdminAuthProvider>
    </Router>
  );
};

export default App;