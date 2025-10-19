import React from 'react';
import type { AdminGlobalPromoCode } from '../services/adminApiService';
import { useCurrency } from '../hooks/useCurrency';

interface PromoCodesTableProps {
    promoCodes: AdminGlobalPromoCode[];
    onDelete: (id: string) => void;
}

const PromoCodesTable: React.FC<PromoCodesTableProps> = ({ promoCodes, onDelete }) => {
    const { getFormattedPrice } = useCurrency();
    if (promoCodes.length === 0) {
        return <div className="text-center py-16"><p className="text-base-content/70">Глобальных промокодов пока нет.</p></div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-base-content">
                <thead className="text-xs text-base-content/70 uppercase bg-base-300">
                    <tr>
                        <th scope="col" className="px-6 py-3">Код</th>
                        <th scope="col" className="px-6 py-3">Скидка</th>
                        <th scope="col" className="px-6 py-3">Статус</th>
                        <th scope="col" className="px-6 py-3">Использовано</th>
                        <th scope="col" className="px-6 py-3">Условия</th>
                        <th scope="col" className="px-6 py-3 text-right">Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {promoCodes.map((promo) => (
                        <tr key={promo.id} className="bg-base-100 border-b border-base-300 hover:bg-base-300/50">
                            <td className="px-6 py-4 font-mono text-primary font-bold">{promo.code}</td>
                            <td className="px-6 py-4 font-semibold text-white">
                                {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}%` : getFormattedPrice(promo.discountValue)}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${promo.isActive ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>
                                    {promo.isActive ? 'Активен' : 'Неактивен'}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                {promo.uses}{promo.maxUses ? ` / ${promo.maxUses}` : ''}
                            </td>
                             <td className="px-6 py-4">
                                {promo.minPurchaseAmount ? `от ${getFormattedPrice(promo.minPurchaseAmount)}` : '–'}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => onDelete(promo.id)} className="font-medium text-red-500 hover:underline">Удалить</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PromoCodesTable;