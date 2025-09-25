import React from 'react';

const DashboardPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
            <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                <p className="text-base-content">Welcome to the CryptoCraft Admin Panel. Analytics and metrics will be displayed here.</p>
            </div>
        </div>
    );
};

export default DashboardPage;