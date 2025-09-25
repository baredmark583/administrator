import React from 'react';
import type { AdminPanelUser } from '../services/adminApiService';

interface UsersTableProps {
    users: AdminPanelUser[];
    onEdit: (userId: string) => void;
    onBlock: (userId: string) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({ users, onEdit, onBlock }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-base-content">
                <thead className="text-xs text-base-content/70 uppercase bg-base-300">
                    <tr>
                        <th scope="col" className="px-6 py-3">Пользователь</th>
                        <th scope="col" className="px-6 py-3">Дата регистрации</th>
                        <th scope="col" className="px-6 py-3">Статус</th>
                        <th scope="col" className="px-6 py-3">Баланс</th>
                        <th scope="col" className="px-6 py-3 text-right">Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className={`border-b border-base-300 ${user.isBlocked ? 'bg-red-900/40 hover:bg-red-900/60' : 'bg-base-100 hover:bg-base-300/50'}`}>
                            <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                    <img className="w-10 h-10 rounded-full" src={user.avatarUrl} alt={user.name} />
                                    <div>
                                        <div className="font-semibold">{user.name}</div>
                                        <div className="text-sm text-base-content/70">{user.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">{user.registrationDate}</td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full w-fit ${user.status === 'Pro' ? 'bg-amber-500/20 text-amber-300' : 'bg-gray-500/20 text-gray-300'}`}>
                                        {user.status}
                                    </span>
                                    {user.isBlocked && (
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full w-fit bg-red-500/20 text-red-300">
                                            Заблокирован
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 font-mono">{user.balance.toFixed(2)} USDT</td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => onEdit(user.id)} className="font-medium text-sky-400 hover:underline">Редактировать</button>
                                    <button onClick={() => onBlock(user.id)} className={`font-medium ${user.isBlocked ? 'text-green-400' : 'text-red-500'} hover:underline`}>
                                        {user.isBlocked ? 'Разблокировать' : 'Заблокировать'}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UsersTable;
