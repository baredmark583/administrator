import React, { useState, useEffect, useMemo } from 'react';
import { backendApiService } from '../services/backendApiService';
// FIX: Corrected import path for AdminPanelProposal type.
import type { AdminPanelProposal } from '../services/backendApiService';
import Spinner from '../components/Spinner';

const StatusBadge: React.FC<{ status: AdminPanelProposal['status'] }> = ({ status }) => {
    const statusMap: Record<AdminPanelProposal['status'], { text: string; color: string }> = {
        ACTIVE: { text: 'Активно', color: 'bg-sky-500/20 text-sky-300' },
        PASSED: { text: 'Принято', color: 'bg-green-500/20 text-green-300' },
        REJECTED: { text: 'Отклонено', color: 'bg-red-500/20 text-red-300' },
        EXECUTED: { text: 'Исполнено', color: 'bg-purple-500/20 text-purple-300' },
    };
    const { text, color } = statusMap[status] || { text: status, color: 'bg-gray-500/20 text-gray-300' };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${color}`}>{text}</span>;
};

const GovernancePage: React.FC = () => {
    const [proposals, setProposals] = useState<AdminPanelProposal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'passed' | 'executed'>('all');

    const fetchProposals = async () => {
        setIsLoading(true);
        try {
            const result = await backendApiService.getAdminProposals();
            setProposals(result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (error) {
            console.error("Failed to fetch proposals", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProposals();
    }, []);

    const handleExecute = async (proposalId: string) => {
        if (window.confirm('Вы уверены, что хотите отметить это предложение как исполненное?')) {
            try {
                const updatedProposal = await backendApiService.updateProposal(proposalId, { status: 'EXECUTED' });
                setProposals(prev => prev.map(p => p.id === proposalId ? updatedProposal : p));
            } catch (error) {
                alert('Не удалось обновить статус.');
            }
        }
    };
    
    const handleDelete = async (proposalId: string) => {
        if (window.confirm('Вы уверены, что хотите удалить это предложение? Это действие необратимо.')) {
            setProposals(prev => prev.filter(p => p.id !== proposalId)); // Optimistic update
            try {
                await backendApiService.deleteProposal(proposalId);
            } catch (error) {
                alert('Не удалось удалить предложение.');
                fetchProposals(); // Revert
            }
        }
    };

    const filteredProposals = useMemo(() => {
        if (activeTab === 'all') return proposals;
        return proposals.filter(p => p.status.toLowerCase() === activeTab);
    }, [proposals, activeTab]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Управление DAO</h1>
            <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
                ) : (
                    <table className="w-full text-sm text-left text-base-content">
                        <thead className="text-xs text-base-content/70 uppercase bg-base-300">
                            <tr>
                                <th scope="col" className="px-6 py-3">Предложение</th>
                                <th scope="col" className="px-6 py-3">Автор</th>
                                <th scope="col" className="px-6 py-3">Голоса (За/Против)</th>
                                <th scope="col" className="px-6 py-3">Даты</th>
                                <th scope="col" className="px-6 py-3">Статус</th>
                                <th scope="col" className="px-6 py-3 text-right">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proposals.map(p => (
                                <tr key={p.id} className="bg-base-100 border-b border-base-300 hover:bg-base-300/50">
                                    <td className="px-6 py-4 font-medium text-white">{p.title}</td>
                                    <td className="px-6 py-4">{p.proposerName}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-green-400">{p.votesFor}</span> / <span className="text-red-400">{p.votesAgainst}</span>
                                    </td>
                                    <td className="px-6 py-4 text-xs">
                                        <div>Создано: {p.createdAt}</div>
                                        <div>Завершится: {p.endsAt}</div>
                                    </td>
                                    <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        {p.status === 'PASSED' && (
                                            <button onClick={() => handleExecute(p.id)} className="font-medium text-green-400 hover:underline">Исполнить</button>
                                        )}
                                        <button onClick={() => handleDelete(p.id)} className="font-medium text-red-500 hover:underline">Удалить</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default GovernancePage;
