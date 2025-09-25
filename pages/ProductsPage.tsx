import React from 'react';

const ProductsPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Product Management</h1>
            <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                <p className="text-base-content">Product list, editing, and moderation queue will be available here.</p>
            </div>
        </div>
    );
};

export default ProductsPage;