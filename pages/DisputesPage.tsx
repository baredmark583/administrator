import React, { useState, useEffect, useMemo } from 'react';
import { backendApiService } from '../services/backendApiService';
import type { DisputesReport } from '../services/backendApiService';
import type { AdminPanelDispute, AdminPanelDisputeDetails } from '../services/adminApiService';
import DisputesTable from '../components/DisputesTable';
import DisputeDetailsModal from '../components/DisputeDetailsModal';
import Spinner from '../components/Spinner';

const DisputesPage: React.FC = () => {
    const [disputes, setDisputes] = useState<AdminPanelDispute[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'open' | 'resolved'>('open');
    const [viewingDispute, setViewingDispute] = useState<AdminPanelDisputeDetails | null>(null);
    const [isLoadingModal, setIsLoadingModal] = useState(false);
    const [report, setReport] = useState<DisputesReport | null>(null);

    const fetchDisputes = async () => {
        setIsLoading(true);
        try {
            const result = await backendApiService.getDisputes();
            setDisputes(result);
        } catch (error) {
            console.error("Failed to fetch disputes", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchReport = async () => {
        try {
            const data = await backendApiService.getDisputesReport();
            setReport(data);
        } catch (error) {
            console.error("Failed to fetch dispute report", error);
        }
    };

    useEffect(() => {
        fetchDisputes();
        fetchReport();
    }, []);

    const filteredDisputes = useMemo(() => {
        if (activeTab === 'open') {
            return disputes.filter(d => d.status === 'OPEN' || d.status === 'UNDER_REVIEW');
        }
        return disputes.filter(d => d.status.startsWith('RESOLVED'));
    }, [disputes, activeTab]);
    
    const handleViewDetails = async (disputeId: string) => {
        setIsLoadingModal(true);
        try {
            const disputeDetails = await backendApiService.getDisputeDetails(disputeId);
            setViewingDispute(disputeDetails);
        } catch (error) {
            console.error("Failed to load dispute details", error);
            alert("Не удалось загрузить детали спора.");
        } finally {
            setIsLoadingModal(false);
        }
    };

    const handleResolveDispute = async (dispute: AdminPanelDispute, resolutionStatus: 'RESOLVED_BUYER' | 'RESOLVED_SELLER', adminMessage: string) => {
        const updatedDispute: AdminPanelDispute = {
            ...dispute,
            status: resolutionStatus,
            messages: [
                ...dispute.messages,
                {
                    id: `msg-${Date.now()}`,
                    senderId: 'arbitrator-01', // This should be the current admin's ID
                    senderName: 'CryptoCraft Support',
                    senderAvatar: 'https://picsum.photos/seed/support/100/100', // Admin avatar
                    timestamp: Date.now(),
                    text: `РЕШЕНИЕ АРБИТРА: ${adminMessage}`
                }
            ]
        };

        // Optimistic update
        setDisputes(prev => prev.map(d => d.id === dispute.id ? updatedDispute : d));
        setViewingDispute(null);

        try {
            await backendApiService.updateDispute(updatedDispute);
            // Optional: refetch for consistency, but optimistic update should suffice
            fetchDisputes();
            fetchReport();
        } catch (error) {
            console.error("Failed to update dispute:", error);
            alert("Ошибка сохранения. Данные будут возвращены к исходному состоянию.");
            fetchDisputes(); // Revert
        }
    };

    const handleUpdateDisputeMeta = async (updated: AdminPanelDisputeDetails) => {
        setViewingDispute(updated);
        setDisputes(prev => prev.map(d => d.id === updated.id ? updated : d));
        try {
            await backendApiService.updateDispute(updated);
            fetchReport();
        } catch (error) {
            console.error("Failed to update dispute metadata", error);
            alert("Не удалось обновить спор.");
            fetchDisputes();
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Центр Разрешения Споров</h1>

            <div className="bg-base-100 p-6 rounded-lg shadow-lg space-y-6">
                {report && (
                    <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="bg-base-200 p-3 rounded">
                            <p className="text-xs text-base-content/60">Открытые споры</p>
                            <p className="text-2xl font-bold text-white">{report.open}</p>
                        </div>
                        <div className="bg-base-200 p-3 rounded">
                            <p className="text-xs text-base-content/60">Решены</p>
                            <p className="text-2xl font-bold text-white">{report.resolvedBuyer + report.resolvedSeller}</p>
                        </div>
                        <div className="bg-base-200 p-3 rounded">
                            <p className="text-xs text-base-content/60">Среднее время</p>
                            <p className="text-2xl font-bold text-white">{report.averageResolutionHours} ч</p>
                        </div>
                        <div className="bg-base-200 p-3 rounded">
                            <p className="text-xs text-base-content/60">Нарушений SLA</p>
                            <p className="text-2xl font-bold text-white">{report.slaBreaches}</p>
                        </div>
                    </div>
                    <div className="text-xs text-base-content/60 flex flex-wrap gap-4">
                        <span>Приоритеты: низкий — {report.priorityBreakdown.LOW}, нормальный — {report.priorityBreakdown.NORMAL}, срочный — {report.priorityBreakdown.URGENT}</span>
                        <span>Авто-действий: {report.autoActionsExecuted}</span>
                    </div>
                    </>
                )}
                <div className="border-b border-base-300 mb-4">
                    <nav className="-mb-px flex space-x-6">
                        <button
                            onClick={() => setActiveTab('open')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'open' ? 'border-primary text-primary' : 'border-transparent text-base-content/70 hover:text-white'}`}
                        >
                            Открытые споры ({disputes.filter(d => d.status === 'OPEN' || d.status === 'UNDER_REVIEW').length})
                        </button>
                         <button
                            onClick={() => setActiveTab('resolved')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'resolved' ? 'border-primary text-primary' : 'border-transparent text-base-content/70 hover:text-white'}`}
                        >
                            Решенные споры ({disputes.filter(d => d.status.startsWith('RESOLVED')).length})
                        </button>
                    </nav>
                </div>
                
                {isLoading || isLoadingModal ? (
                     <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
                ) : (
                    <DisputesTable
                        disputes={filteredDisputes}
                        onViewDetails={handleViewDetails}
                    />
                )}
            </div>
            {viewingDispute && (
                <DisputeDetailsModal 
                    dispute={viewingDispute}
                    onClose={() => setViewingDispute(null)}
                    onResolve={handleResolveDispute}
                    onUpdateDispute={handleUpdateDisputeMeta}
                />
            )}
        </div>
    );
};

export default DisputesPage;
