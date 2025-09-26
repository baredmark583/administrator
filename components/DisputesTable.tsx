import React from 'react';
import type { AdminPanelDispute } from '../services/adminApiService';

interface DisputesTableProps {
    disputes: AdminPanelDispute[];
    onViewDetails: (disputeId: string) => void;
}

const StatusBadge: React.FC<{ status: AdminPanelDispute['status'] }> = ({ status }) => {
    const statusMap = {
        'OPEN': { text: 'Открыт', style: 'bg-yellow-500/20 text-yellow-300' },
        'UNDER_REVIEW': { text: 'На рассмотрении', style: 'bg-sky-500/20 text-sky-300' },
        'RESOLVED_BUYER': { text: 'Решен (Покупатель)', style: 'bg-green-500/20 text-green-300' },
        'RESOLVED_SELLER': { text: 'Решен (Продавец)', style: 'bg-green-500/20 text-green-300' },
    };
    
    const { text, style } = statusMap[status] || { text: status, style: 'bg-gray-500/20 text-gray-300' };

    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${style}`}>
            {text}
        </span>
    );
};

const DisputesTable: React.FC<DisputesTableProps> = ({ disputes, onViewDetails }) => {
    if (disputes.length === 0) {
        return (
            <div className="text-center py-16">
                <p className="text-base-content/70">Споров в этой категории нет.</p>
            </div>
        );
    }
    
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-base-content">
                <thead className="text-xs text-base-content/70 uppercase bg-base-300">
                    <tr>
                        <th scope="col" className="px-6 py-3">ID Заказа</th>
                        <th scope="col" className="px-6 py-3">Участники</th>
                        <th scope="col" className="px-6 py-3">Дата открытия</th>
                        <th scope="col" className="px-6 py-3">Статус</th>
                        <th scope="col" className="px-6 py-3 text-right">Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {disputes.map((dispute) => (
                        <tr key={dispute.id} className="bg-base-100 border-b border-base-300 hover:bg-base-300/50">
                            <td className="px-6 py-4 font-mono text-white whitespace-nowrap">{dispute.id}</td>
                            <td className="px-6 py-4">
                                <div className="font-medium text-white">{dispute.order.customerName}</div>
                                <div className="text-xs text-base-content/70">vs {dispute.order.sellerName}</div>
                            </td>
                            <td className="px-6 py-4">{dispute.createdAt}</td>
                            <td className="px-6 py-4">
                                <StatusBadge status={dispute.status} />
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => onViewDetails(dispute.id)} className="font-medium text-sky-400 hover:underline">Детали</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DisputesTable;
