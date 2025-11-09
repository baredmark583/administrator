import React from 'react';
import type { AdminPanelDispute } from '../services/adminApiService';

interface DisputesTableProps {
    disputes: AdminPanelDispute[];
    onViewDetails: (disputeId: string) => void;
}

const StatusBadge: React.FC<{ status: AdminPanelDispute['status'] }> = ({ status }) => {
    const statusMap = {
        OPEN: { text: 'Открыт', style: 'bg-yellow-500/20 text-yellow-300' },
        UNDER_REVIEW: { text: 'На рассмотрении', style: 'bg-sky-500/20 text-sky-300' },
        RESOLVED_BUYER: { text: 'Решён (Покупатель)', style: 'bg-green-500/20 text-green-300' },
        RESOLVED_SELLER: { text: 'Решён (Продавец)', style: 'bg-green-500/20 text-green-300' },
    };
    const { text, style } = statusMap[status] || { text: status, style: 'bg-gray-500/20 text-gray-300' };
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${style}`}>
            {text}
        </span>
    );
};

const PriorityBadge: React.FC<{ priority?: AdminPanelDispute['priority'] }> = ({ priority = 'NORMAL' }) => {
    const map = {
        LOW: { text: 'Низкий', style: 'bg-base-200 text-base-content' },
        NORMAL: { text: 'Нормальный', style: 'bg-amber-500/20 text-amber-200' },
        URGENT: { text: 'Срочный', style: 'bg-red-500/20 text-red-300' },
    };
    const { text, style } = map[priority];
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${style}`}>{text}</span>;
};

const SlaCountdown: React.FC<{ responseSlaDueAt?: string }> = ({ responseSlaDueAt }) => {
    if (!responseSlaDueAt) return <span className="text-xs text-base-content/60">—</span>;
    const due = new Date(responseSlaDueAt).getTime();
    const diffMs = due - Date.now();
    if (diffMs <= 0) {
        return <span className="text-xs font-semibold text-red-400">Просрочено</span>;
    }
    const hours = Math.floor(diffMs / 36e5);
    const minutes = Math.floor((diffMs % 36e5) / 60000);
    return (
        <span className="text-xs text-base-content/70">
            {hours}ч {minutes}м
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
                        <th scope="col" className="px-6 py-3">ID заказа</th>
                        <th scope="col" className="px-6 py-3">Участники</th>
                        <th scope="col" className="px-6 py-3">Приоритет</th>
                        <th scope="col" className="px-6 py-3">SLA</th>
                        <th scope="col" className="px-6 py-3">Статус</th>
                        <th scope="col" className="px-6 py-3">Дата</th>
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
                            <td className="px-6 py-4">
                                <PriorityBadge priority={dispute.priority} />
                            </td>
                            <td className="px-6 py-4">
                                <SlaCountdown responseSlaDueAt={dispute.responseSlaDueAt} />
                            </td>
                            <td className="px-6 py-4">
                                <StatusBadge status={dispute.status} />
                            </td>
                            <td className="px-6 py-4">{dispute.createdAt}</td>
                            <td className="px-6 py-4 text-right">
                                <button
                                    onClick={() => onViewDetails(dispute.id)}
                                    className="font-medium text-sky-400 hover:underline"
                                >
                                    Детали
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DisputesTable;
