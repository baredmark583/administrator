import React from 'react';
import Sidebar from './Sidebar';
import { useAdminAuth } from '../hooks/useAdminAuth';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAdminAuth();

    return (
        <div className="flex h-screen bg-base-200 text-base-content">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-between items-center p-4 bg-base-100 border-b border-base-300">
                    <h1 className="text-xl font-semibold">CryptoCraft Admin</h1>
                    <div className="flex items-center gap-4">
                        <span>{user?.email}</span>
                        <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm">
                            Logout
                        </button>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-base-200 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;