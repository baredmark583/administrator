import React, { useState } from 'react';
import type { AdminPanelProduct } from '../services/adminApiService';

interface ProductModerationModalProps {
    product: AdminPanelProduct;
    onClose: () => void;
    onSave: (product: AdminPanelProduct, newStatus: 'Active' | 'Rejected', rejectionReason?: string) => Promise<void>;
}

const ProductModerationModal: React.FC<ProductModerationModalProps> = ({ product, onClose, onSave }) => {
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectionForm, setShowRejectionForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleAction = async (action: 'approve' | 'reject') => {
        if (action === 'reject') {
            if (!showRejectionForm) {
                setShowRejectionForm(true);
                return;
            }
            if (!rejectionReason.trim()) {
                alert('Пожалуйста, укажите причину отклонения.');
                return;
            }
        }
        
        setIsSaving(true);
        const newStatus = action === 'approve' ? 'Active' : 'Rejected';
        await onSave(product, newStatus, rejectionReason);
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-base-300">
                    <h2 className="text-xl font-bold text-white">Модерация товара</h2>
                    <p className="text-sm text-base-content/70">{product.title}</p>
                </div>

                <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Side: Images & Info */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            {product.imageUrls.map((url, index) => (
                                <img key={index} src={url} alt={`Product image ${index + 1}`} className="w-full aspect-square object-cover rounded-md" />
                            ))}
                        </div>
                        <div className="text-sm">
                            <p><strong>Продавец:</strong> {product.sellerName}</p>
                            <p><strong>Категория:</strong> {product.category}</p>
                            <p><strong>Цена:</strong> {product.price.toFixed(2)} USDT</p>
                        </div>
                    </div>
                    {/* Right Side: Content & Attributes */}
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-1">Описание</h4>
                            <p className="text-sm text-base-content/80 bg-base-200 p-3 rounded-md max-h-40 overflow-y-auto">{product.description}</p>
                        </div>
                         <div>
                            <h4 className="font-semibold mb-1">Характеристики</h4>
                            <div className="text-sm text-base-content/80 bg-base-200 p-3 rounded-md space-y-1">
                                {Object.entries(product.dynamicAttributes).map(([key, value]) => (
                                    <div key={key}><strong>{key}:</strong> {String(value)}</div>
                                ))}
                            </div>
                        </div>
                        {showRejectionForm && (
                            <div className="animate-fade-in-down">
                                <label className="block text-sm font-medium text-red-400 mb-1">Причина отклонения*</label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={e => setRejectionReason(e.target.value)}
                                    rows={3}
                                    className="w-full bg-base-200 border border-red-500/50 rounded-md p-2"
                                    placeholder="Например: 'Фотографии низкого качества' или 'Запрещенный товар'"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 bg-base-200/50 flex flex-col sm:flex-row justify-between items-center gap-3 rounded-b-lg">
                     <a href={`/#/product/${product.id}`} target="_blank" rel="noopener noreferrer" className="text-sm text-sky-400 hover:underline">
                        Посмотреть на сайте
                    </a>
                    <div className="flex gap-3">
                        <button onClick={onClose} disabled={isSaving} className="bg-base-300 hover:bg-base-200 text-white font-bold py-2 px-4 rounded">
                            Закрыть
                        </button>
                        <button onClick={() => handleAction('reject')} disabled={isSaving} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                            {isSaving && showRejectionForm ? '...' : 'Отклонить'}
                        </button>
                         <button onClick={() => handleAction('approve')} disabled={isSaving || showRejectionForm} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                            {isSaving && !showRejectionForm ? '...' : 'Одобрить'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductModerationModal;