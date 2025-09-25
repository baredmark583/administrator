import React from 'react';
import type { AdminPanelOrder } from '../services/adminApiService';

interface OrdersTableProps {
    orders: AdminPanelOrder[];
    onViewDetails: (orderId: string) => void;
}

const StatusBadge: React.FC<{ status: AdminPanelOrder['status'] }> = ({ status }) => {
    const styles = {
        'Processing': 'bg-blue-500/20 text-blue-300',
        'Shipped': 'bg-sky-500/20 text-sky-300',
        'Completed': 'bg-green-500/20 text-green-300',
        'Cancelled': 'bg-red-500/20 text-red-300',
    };
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
            {status}
        </span>
    );
};

const OrdersTable: React.FC<OrdersTableProps> = ({ orders, onViewDetails }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-base-content">
                <thead className="text-xs text-base-content/70 uppercase bg-base-300">
                    <tr>
                        <th scope="col" className="px-6 py-3">ID Заказа</th>
                        <th scope="col" className="px-6 py-3">Покупатель</th>
                        <th scope="col" className="px-6 py-3">Дата</th>
                        <th scope="col" className="px-6 py-3">Сумма</th>
                        <th scope="col" className="px-6 py-3">Статус</th>
                        <th scope="col" className="px-6 py-3 text-right">Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id} className="bg-base-100 border-b border-base-300 hover:bg-base-300/50">
                            <td className="px-6 py-4 font-mono text-white whitespace-nowrap">{order.id}</td>
                            <td className="px-6 py-4 font-medium text-white">{order.customerName}</td>
                            <td className="px-6 py-4">{order.date}</td>
                            <td className="px-6 py-4 font-mono">{order.total.toFixed(2)} USDT</td>
                            <td className="px-6 py-4">
                                <StatusBadge status={order.status} />
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => onViewDetails(order.id)} className="font-medium text-sky-400 hover:underline">Детали</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrdersTable;