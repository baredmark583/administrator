import React from 'react';

const OrdersPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Order Management</h1>
            <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                <p className="text-base-content">A list of all orders on the platform will be displayed here.</p>
            </div>
        </div>
    );
};

export default OrdersPage;