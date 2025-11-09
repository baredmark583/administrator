import React, { useState } from 'react';
import type { AdminGlobalPromoCodeInput } from '../services/adminApiService';

interface CreatePromoCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AdminGlobalPromoCodeInput) => Promise<void>;
}

const CreatePromoCodeModal: React.FC<CreatePromoCodeModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [code, setCode] = useState('');
    const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
    const [discountValue, setDiscountValue] = useState<number | ''>('');
    const [maxUses, setMaxUses] = useState<number | ''>('');
    const [minPurchaseAmount, setMinPurchaseAmount] = useState<number | ''>('');
    const [validFrom, setValidFrom] = useState('');
    const [validUntil, setValidUntil] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim() || !discountValue) {
            alert('Пожалуйста, заполните код и значение скидки.');
            return;
        }
        setIsSaving(true);
        const promoData = {
            code: code.toUpperCase().trim(),
            discountType,
            discountValue: Number(discountValue),
            isActive,
            maxUses: maxUses ? Number(maxUses) : undefined,
            minPurchaseAmount: minPurchaseAmount ? Number(minPurchaseAmount) : undefined,
            validFrom: validFrom ? new Date(validFrom).toISOString() : undefined,
            validUntil: validUntil ? new Date(validUntil).toISOString() : undefined,
        };
        await onSubmit(promoData);
        setIsSaving(false);
        setCode('');
        setDiscountValue('');
        setMaxUses('');
        setMinPurchaseAmount('');
        setValidFrom('');
        setValidUntil('');
        setIsActive(true);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-base-300">
                        <h2 className="text-xl font-bold text-white">Создать глобальный промокод</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-base-content/70 mb-1">Промокод</label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                className="w-full bg-base-200 border border-base-300 rounded-md p-2 font-mono"
                                placeholder="WELCOME15"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-base-content/70 mb-1">Тип скидки</label>
                                <select
                                    value={discountType}
                                    onChange={(e) => setDiscountType(e.target.value as any)}
                                    className="w-full bg-base-200 border border-base-300 rounded-md p-2"
                                >
                                    <option value="PERCENTAGE">Процент (%)</option>
                                    <option value="FIXED_AMOUNT">Фикс. сумма</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-base-content/70 mb-1">Значение</label>
                                <input
                                    type="number"
                                    value={discountValue}
                                    onChange={(e) => setDiscountValue(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                    className="w-full bg-base-200 border border-base-300 rounded-md p-2"
                                    placeholder="15"
                                    required
                                    min="0"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-base-content/70 mb-1">Лимит использований</label>
                                <input
                                    type="number"
                                    value={maxUses}
                                    onChange={(e) => setMaxUses(e.target.value === '' ? '' : parseInt(e.target.value))}
                                    className="w-full bg-base-200 border border-base-300 rounded-md p-2"
                                    placeholder="Необязательно"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-base-content/70 mb-1">Мин. сумма заказа</label>
                                <input
                                    type="number"
                                    value={minPurchaseAmount}
                                    onChange={(e) => setMinPurchaseAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                    className="w-full bg-base-200 border border-base-300 rounded-md p-2"
                                    placeholder="Необязательно"
                                    min="0"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-base-content/70 mb-1">Действует с</label>
                                <input
                                    type="datetime-local"
                                    value={validFrom}
                                    onChange={(e) => setValidFrom(e.target.value)}
                                    className="w-full bg-base-200 border border-base-300 rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-base-content/70 mb-1">Действует до</label>
                                <input
                                    type="datetime-local"
                                    value={validUntil}
                                    onChange={(e) => setValidUntil(e.target.value)}
                                    className="w-full bg-base-200 border border-base-300 rounded-md p-2"
                                />
                            </div>
                        </div>
                        <div>
                             <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="h-4 w-4 rounded bg-base-200 border-base-300 text-primary focus:ring-primary"
                                />
                                <span className="ml-2 text-sm font-medium text-base-content">Активен сразу после создания</span>
                            </label>
                        </div>
                    </div>
                    <div className="p-4 bg-base-200/50 flex justify-end gap-3 rounded-b-lg">
                        <button type="button" onClick={onClose} disabled={isSaving} className="bg-base-300 hover:bg-base-200 text-white font-bold py-2 px-4 rounded">Отмена</button>
                        <button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded">
                            {isSaving ? 'Создание...' : 'Создать'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePromoCodeModal;
