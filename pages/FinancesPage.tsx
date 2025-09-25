import React from 'react';
import { useLocation } from 'react-router-dom';

const FinancesPage: React.FC = () => {
    const location = useLocation();
    const isTransactions = location.pathname.includes('transactions');

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Финансы: {isTransactions ? 'Транзакции' : 'Промокоды'}</h1>
            <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                 <h2 className="text-xl font-bold text-white mb-4">Раздел в разработке</h2>
                <p className="text-base-content/70">
                    {isTransactions 
                        ? 'Здесь будет отображаться полный лог всех финансовых операций на платформе: пополнения, выводы, комиссии, оплата заказов.'
                        : 'Здесь администраторы смогут создавать и управлять глобальными промокодами от имени платформы.'
                    }
                </p>
            </div>
        </div>
    );
};

export default FinancesPage;