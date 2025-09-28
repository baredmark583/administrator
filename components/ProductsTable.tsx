import React from 'react';
import type { AdminPanelProduct } from '../services/adminApiService';

interface ProductsTableProps {
    products: AdminPanelProduct[];
    onAction: (product: AdminPanelProduct) => void;
    onDelete: (product: AdminPanelProduct) => void;
}

const StatusBadge: React.FC<{ status: AdminPanelProduct['status'] }> = ({ status }) => {
    const styles = {
        'Active': 'bg-green-500/20 text-green-300',
        'Pending Moderation': 'bg-yellow-500/20 text-yellow-300',
        'Rejected': 'bg-red-500/20 text-red-300',
    };
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full w-fit ${styles[status]}`}>
            {status}
        </span>
    );
};

const ProductsTable: React.FC<ProductsTableProps> = ({ products, onAction, onDelete }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-base-content">
                <thead className="text-xs text-base-content/70 uppercase bg-base-300">
                    <tr>
                        <th scope="col" className="px-6 py-3">Товар</th>
                        <th scope="col" className="px-6 py-3">Продавец</th>
                        <th scope="col" className="px-6 py-3">Цена</th>
                        <th scope="col" className="px-6 py-3">Статус</th>
                        <th scope="col" className="px-6 py-3">Дата</th>
                        <th scope="col" className="px-6 py-3 text-right">Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id} className="bg-base-100 border-b border-base-300 hover:bg-base-300/50">
                            <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                    <img className="w-12 h-12 rounded-md object-cover" src={product.imageUrls[0]} alt={product.title} />
                                    <span>{product.title}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">{product.sellerName}</td>
                            <td className="px-6 py-4 font-mono">{product.price.toFixed(2)} USDT</td>
                            <td className="px-6 py-4">
                                <StatusBadge status={product.status} />
                            </td>
                            <td className="px-6 py-4">{product.dateAdded}</td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => onAction(product)} className="font-medium text-sky-400 hover:underline">Детали</button>
                                    <button onClick={() => onDelete(product)} className="font-medium text-red-500 hover:underline">Удалить</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductsTable;