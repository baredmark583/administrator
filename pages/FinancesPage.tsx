import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { backendApiService } from '../services/backendApiService';
import type { AdminTransaction, AdminGlobalPromoCode } from '../services/adminApiService';
import TransactionsTable from '../components/TransactionsTable';
import PromoCodesTable from '../components/PromoCodesTable';
import CreatePromoCodeModal from '../components/CreatePromoCodeModal';

type FinanceTab = 'transactions' | 'promocodes';

const FinancesPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
    const [promoCodes, setPromoCodes] = useState<AdminGlobalPromoCode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const activeTab: FinanceTab = location.pathname.includes('promocodes') ? 'promocodes' : 'transactions';
    
    const fetchData = async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'transactions') {
                const result = await backendApiService.getTransactions();
                setTransactions(result);
            } else {
                const result = await backendApiService.getGlobalPromoCodes();
                setPromoCodes(result);
            }
        } catch (error) {
            console.error(`Failed to fetch ${activeTab}`, error);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleCreatePromo = async (data: Omit<AdminGlobalPromoCode, 'id' | 'uses'>) => {
        try {
            await backendApiService.createGlobalPromoCode(data);
            setIsModalOpen(false);
            fetchData(); // Refetch data
        } catch (error) {
            console.error("Failed to create promo code", error);
            alert("Ошибка создания промокода.");
        }
    };
    
     const handleDeletePromo = async (id: string) => {
        if (window.confirm('Вы уверены, что хотите удалить этот промокод?')) {
            try {
                await backendApiService.deleteGlobalPromoCode(id);
                fetchData(); // Refetch data
            } catch (error) {
                console.error("Failed to delete promo code", error);
                alert("Ошибка удаления промокода.");
            }
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>;
        }
        if (activeTab === 'transactions') {
            return <TransactionsTable transactions={transactions} />;
        }
        if (activeTab === 'promocodes') {
            return <PromoCodesTable promoCodes={promoCodes} onDelete={handleDeletePromo} />;
        }
        return null;
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Финансы</h1>
                {activeTab === 'promocodes' && (
                     <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded-lg">
                        + Создать промокод
                    </button>
                )}
            </div>

            <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                <div className="border-b border-base-300 mb-4">
                    <nav className="-mb-px flex space-x-6">
                        <button
                            onClick={() => navigate('/finances/transactions')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'transactions' ? 'border-primary text-primary' : 'border-transparent text-base-content/70 hover:text-white'}`}
                        >
                            Транзакции
                        </button>
                         <button
                            onClick={() => navigate('/finances/promocodes')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'promocodes' ? 'border-primary text-primary' : 'border-transparent text-base-content/70 hover:text-white'}`}
                        >
                            Глобальные промокоды
                        </button>
                    </nav>
                </div>
                {renderContent()}
            </div>
            
            {isModalOpen && (
                <CreatePromoCodeModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleCreatePromo}
                />
            )}
        </div>
    );
};

export default FinancesPage;
