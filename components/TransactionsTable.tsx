import React from 'react';
import type { AdminTransaction } from '../services/adminApiService';

interface TransactionsTableProps {
    transactions: AdminTransaction[];
}

const TypeBadge: React.FC<{ type: AdminTransaction['type'] }> = ({ type }) => {
    const typeMap = {
        'Sale': { text: 'Продажа', style: 'bg-green-500/20 text-green-300' },
        'Withdrawal': { text: 'Вывод', style: 'bg-red-500/20 text-red-300' },
        'Deposit': { text: 'Пополнение', style: 'bg-sky-500/20 text-sky-300' },
        'Commission': { text: 'Комиссия', style: 'bg-purple-500/20 text-purple-300' },
        'Refund': { text: 'Возврат', style: 'bg-yellow-500/20 text-yellow-300' },
    };
    const { text, style } = typeMap[type];
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${style}`}>{text}</span>;
};

const StatusBadge: React.FC<{ status: AdminTransaction['status'] }> = ({ status }) => {
     const statusMap = {
        'Completed': { text: 'Завершено', style: 'text-green-300' },
        'Pending': { text: 'В ожидании', style: 'text-yellow-300' },
        'Failed': { text: 'Ошибка', style: 'text-red-300' },
    };
     const { text, style } = statusMap[status];
    return <span className={`font-semibold ${style}`}>{text}</span>;
};

const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions }) => {
     if (transactions.length === 0) {
        return <div className="text-center py-16"><p className="text-base-content/70">Транзакции не найдены.</p></div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-base-content">
                <thead className="text-xs text-base-content/70 uppercase bg-base-300">
                    <tr>
                        <th scope="col" className="px-6 py-3">ID</th>
                        <th scope="col" className="px-6 py-3">Дата</th>
                        <th scope="col" className="px-6 py-3">Тип</th>
                        <th scope="col" className="px-6 py-3">От кого</th>
                        <th scope="col" className="px-6 py-3">Кому</th>
                        <th scope="col" className="px-6 py-3">Сумма</th>
                        <th scope="col" className="px-6 py-3">Статус</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((txn) => (
                        <tr key={txn.id} className="bg-base-100 border-b border-base-300 hover:bg-base-300/50">
                            <td className="px-6 py-4 font-mono text-white/70 whitespace-nowrap">{txn.id}</td>
                            <td className="px-6 py-4">{txn.date}</td>
                            <td className="px-6 py-4"><TypeBadge type={txn.type} /></td>
                            <td className="px-6 py-4">{txn.from.name}</td>
                            <td className="px-6 py-4">{txn.to.name}</td>
                            <td className={`px-6 py-4 font-mono font-semibold ${txn.type === 'Withdrawal' ? 'text-red-400' : 'text-green-400'}`}>
                                {txn.type === 'Withdrawal' ? '-' : '+'}{txn.amount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4"><StatusBadge status={txn.status} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionsTable;