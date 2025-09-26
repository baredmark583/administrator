import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { adminApiService, AdminTransaction, AdminGlobalPromoCode } from '../services/adminApiService';
import TransactionsTable from '../components/TransactionsTable';
import PromoCodesTable from '../components/PromoCodesTable';
import CreatePromoCodeModal from '../components/CreatePromoCodeModal';

const FinancesPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // State for Transactions tab
    const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
    const [isTxnLoading, setIsTxnLoading] = useState(true);
    const [txnSearchQuery, setTxnSearchQuery] = useState('');
    const [txnTypeFilter, setTxnTypeFilter] = useState('All');

    // State for Promo Codes tab
    const [promoCodes, setPromoCodes] = useState<AdminGlobalPromoCode[]>([]);
    const [isPromoLoading, setIsPromoLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);


    const activeTab = location.pathname.includes('transactions') ? 'transactions' : 'promocodes';

    const fetchTransactions = () => {
        setIsTxnLoading(true);
        adminApiService.getTransactions()
            .then(setTransactions)
            .finally(() => setIsTxnLoading(false));
    };

    const fetchPromoCodes = () => {
        setIsPromoLoading(true);
        adminApiService.getGlobalPromoCodes()
            .then(setPromoCodes)
            .finally(() => setIsPromoLoading(false));
    };

    useEffect(() => {
        if (activeTab === 'transactions') {
            fetchTransactions();
        } else {
            fetchPromoCodes();
        }
    }, [activeTab]);

    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(t => txnTypeFilter === 'All' || t.type === txnTypeFilter)
            .filter(t => 
                t.id.toLowerCase().includes(txnSearchQuery.toLowerCase()) ||
                t.from.name.toLowerCase().includes(txnSearchQuery.toLowerCase()) ||
                t.to.name.toLowerCase().includes(txnSearchQuery.toLowerCase())
            );
    }, [transactions, txnSearchQuery, txnTypeFilter]);

    const handleCreatePromoCode = async (data: Omit<AdminGlobalPromoCode, 'id' | 'uses'>) => {
        const newCode = await adminApiService.createGlobalPromoCode(data);
        setPromoCodes(prev => [...prev, newCode]);
        setIsModalOpen(false);
    };

    const handleDeletePromoCode = async (id: string) => {
        if (window.confirm('Вы уверены, что хотите удалить этот промокод?')) {
            await adminApiService.deleteGlobalPromoCode(id);
            setPromoCodes(prev => prev.filter(p => p.id !== id));
        }
    };

    const renderTransactionsTab = () => (
        <div>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Поиск по ID, отправителю, получателю..."
                    value={txnSearchQuery}
                    onChange={(e) => setTxnSearchQuery(e.target.value)}
                    className="w-full sm:max-w-xs bg-base-300 border border-base-100 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <select
                    value={txnTypeFilter}
                    onChange={(e) => setTxnTypeFilter(e.target.value)}
                    className="w-full sm:max-w-xs bg-base-300 border border-base-100 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="All">Все типы</option>
                    <option value="Sale">Продажа</option>
                    <option value="Withdrawal">Вывод</option>
                    <option value="Deposit">Пополнение</option>
                    <option value="Commission">Комиссия</option>
                    <option value="Refund">Возврат</option>
                </select>
            </div>
            {isTxnLoading ? (
                <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>
            ) : (
                <TransactionsTable transactions={filteredTransactions} />
            )}
        </div>
    );

     const renderPromoCodesTab = () => (
        <div>
            <div className="flex justify-between items-center mb-4">
                 <div>
                    <h2 className="text-xl font-bold text-white">Глобальные промокоды</h2>
                    <p className="text-sm text-base-content/70">Эти промокоды действуют для всех товаров на платформе.</p>
                 </div>
                 <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded-lg">
                    + Создать промокод
                </button>
            </div>
             {isPromoLoading ? (
                <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>
            ) : (
                <PromoCodesTable promoCodes={promoCodes} onDelete={handleDeletePromoCode} />
            )}
        </div>
    );

    return (
        <>
            <div>
                <h1 className="text-3xl font-bold text-white mb-6">Финансы и Маркетинг</h1>
                <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                    <div className="border-b border-base-300 mb-4">
                        <nav className="-mb-px flex space-x-6">
                            <Link
                                to="/finances/transactions"
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'transactions' ? 'border-primary text-primary' : 'border-transparent text-base-content/70 hover:text-white'}`}
                            >
                                Транзакции
                            </Link>
                            <Link
                                to="/finances/promocodes"
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'promocodes' ? 'border-primary text-primary' : 'border-transparent text-base-content/70 hover:text-white'}`}
                            >
                                Промокоды
                            </Link>
                        </nav>
                    </div>
                    {activeTab === 'transactions' ? renderTransactionsTab() : renderPromoCodesTab()}
                </div>
            </div>
            {isModalOpen && (
                <CreatePromoCodeModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleCreatePromoCode}
                />
            )}
        </>
    );
};

export default FinancesPage;