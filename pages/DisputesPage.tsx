import React, { useState, useEffect, useMemo } from 'react';
import { backendApiService } from '../services/backendApiService';
import type { AdminPanelDispute } from '../services/adminApiService';
import DisputesTable from '../components/DisputesTable';
import DisputeDetailsModal from '../components/DisputeDetailsModal';

const DisputesPage: React.FC = () => {
    const [disputes, setDisputes] = useState<AdminPanelDispute[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'open' | 'resolved'>('open');
    const [viewingDispute, setViewingDispute] = useState<AdminPanelDispute | null>(null);

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

    useEffect(() => {
        fetchDisputes();
    }, []);

    const filteredDisputes = useMemo(() => {
        if (activeTab === 'open') {
            return disputes.filter(d => d.status === 'OPEN' || d.status === 'UNDER_REVIEW');
        }
        return disputes.filter(d => d.status.startsWith('RESOLVED'));
    }, [disputes, activeTab]);
    
    const handleViewDetails = (disputeId: string) => {
        const disputeToView = disputes.find(d => d.id === disputeId);
        if (disputeToView) {
            setViewingDispute(disputeToView);
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
        } catch (error) {
            console.error("Failed to update dispute:", error);
            alert("Ошибка сохранения. Данные будут возвращены к исходному состоянию.");
            fetchDisputes(); // Revert
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Центр Разрешения Споров</h1>

            <div className="bg-base-100 p-6 rounded-lg shadow-lg">
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
                
                {isLoading ? (
                     <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>
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
                />
            )}
        </div>
    );
};

export default DisputesPage;