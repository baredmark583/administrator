import React from 'react';
import type { AdminGlobalPromoCode } from '../services/adminApiService';
import { useCurrency } from '../hooks/useCurrency';

interface PromoCodesTableProps {
    promoCodes: AdminGlobalPromoCode[];
    onDelete: (id: string) => void;
    onToggle: (promo: AdminGlobalPromoCode) => void;
    togglingId?: string | null;
}

const formatDateTime = (value?: string | null) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
};

const PromoCodesTable: React.FC<PromoCodesTableProps> = ({ promoCodes, onDelete, onToggle, togglingId }) => {
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
                        <th scope="col" className="px-6 py-3">Актуальность</th>
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
                            <td className="px-6 py-4 space-y-1">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${promo.isActive ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>
                                    {promo.isActive ? 'Активен' : 'Неактивен'}
                                </span>
                                {promo.validUntil && (
                                    <p className="text-[11px] text-base-content/60">до {new Date(promo.validUntil).toLocaleDateString()}</p>
                                )}
                            </td>
                            <td className="px-6 py-4 text-sm text-base-content/80">
                                <div>c {formatDateTime(promo.validFrom)}</div>
                                <div>до {formatDateTime(promo.validUntil)}</div>
                            </td>
                            <td className="px-6 py-4">
                                {promo.uses}{promo.maxUses ? ` / ${promo.maxUses}` : ''}
                            </td>
                             <td className="px-6 py-4">
                                {promo.minPurchaseAmount ? `от ${getFormattedPrice(promo.minPurchaseAmount)}` : '–'}
                            </td>
                            <td className="px-6 py-4 text-right space-x-3">
                                <button
                                    onClick={() => onToggle(promo)}
                                    disabled={togglingId === promo.id}
                                    className={`font-medium ${promo.isActive ? 'text-yellow-400' : 'text-green-400'} hover:underline disabled:opacity-50`}
                                >
                                    {togglingId === promo.id ? '...' : promo.isActive ? 'Выключить' : 'Включить'}
                                </button>
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
