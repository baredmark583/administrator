import React, { useState, useEffect } from 'react';
import type { AdminPanelProduct } from '../services/adminApiService';
import type { CategorySchema } from '../constants';
import { backendApiService } from '../services/backendApiService';
import Spinner from './Spinner';

interface ProductModerationModalProps {
    product: AdminPanelProduct;
    onClose: () => void;
    onSave: (updatedProduct: Partial<AdminPanelProduct>) => Promise<void>;
}

const ProductModerationModal: React.FC<ProductModerationModalProps> = ({ product, onClose, onSave }) => {
    const [formData, setFormData] = useState<AdminPanelProduct>(product);
    const [categories, setCategories] = useState<CategorySchema[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [showRejectionForm, setShowRejectionForm] = useState(product.status === 'Rejected');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        backendApiService.getCategories()
            .then(setCategories)
            .finally(() => setIsLoadingCategories(false));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' ? parseFloat(value) || 0 : value
        }));
    };

    const handleAction = async (action: 'approve' | 'reject') => {
        if (action === 'reject') {
            if (!showRejectionForm) {
                setShowRejectionForm(true);
                setFormData(prev => ({...prev, status: 'Rejected'}));
                return;
            }
            if (!formData.rejectionReason?.trim()) {
                alert('Пожалуйста, укажите причину отклонения.');
                return;
            }
        }
        
        setIsSaving(true);
        const finalStatus = action === 'approve' ? 'Active' : 'Rejected';
        await onSave({ ...formData, status: finalStatus });
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-base-300">
                    <h2 className="text-xl font-bold text-white">Редактирование/Модерация товара</h2>
                </div>

                <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Side: Images & Info */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            {product.imageUrls.map((url, index) => (
                                <img key={index} src={url} alt={`Product image ${index + 1}`} className="w-full aspect-square object-cover rounded-md" />
                            ))}
                        </div>
                         <div>
                            <h4 className="font-semibold mb-1">Описание</h4>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={8}
                                className="w-full bg-base-200 border border-base-300 rounded-md p-2 text-sm"
                            />
                        </div>
                    </div>
                    {/* Right Side: Content & Attributes */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-base-content/70 mb-1">Заголовок</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full bg-base-200 border border-base-300 rounded-md p-2"
                            />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-base-content/70 mb-1">Цена (USDT)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full bg-base-200 border border-base-300 rounded-md p-2"
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-base-content/70 mb-1">Категория</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    disabled={isLoadingCategories}
                                    className="w-full bg-base-200 border border-base-300 rounded-md p-2"
                                >
                                    {isLoadingCategories ? <option>Загрузка...</option> : (
                                        categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)
                                    )}
                                </select>
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-base-content/70 mb-1">Статус</label>
                             <select
                                name="status"
                                value={formData.status}
                                onChange={(e) => {
                                    const newStatus = e.target.value as AdminPanelProduct['status'];
                                    setFormData(prev => ({...prev, status: newStatus}));
                                    setShowRejectionForm(newStatus === 'Rejected');
                                }}
                                className="w-full bg-base-200 border border-base-300 rounded-md p-2"
                            >
                                <option value="Active">Активен</option>
                                <option value="Pending Moderation">На модерации</option>
                                <option value="Rejected">Отклонен</option>
                            </select>
                        </div>
                        
                         <div>
                            <h4 className="font-semibold mb-1">Характеристики</h4>
                            <p className="text-xs text-base-content/70 mb-2">Редактирование динамических полей будет доступно позже.</p>
                            <div className="text-sm text-base-content/80 bg-base-200 p-3 rounded-md space-y-1 max-h-40 overflow-y-auto">
                                {Object.entries(product.dynamicAttributes).map(([key, value]) => (
                                    <div key={key}><strong>{key}:</strong> {String(value)}</div>
                                ))}
                            </div>
                        </div>
                        {showRejectionForm && (
                            <div className="animate-fade-in-down">
                                <label className="block text-sm font-medium text-red-400 mb-1">Причина отклонения*</label>
                                <textarea
                                    name="rejectionReason"
                                    value={formData.rejectionReason || ''}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full bg-base-200 border border-red-500/50 rounded-md p-2"
                                    placeholder="Например: 'Фотографии низкого качества' или 'Запрещенный товар'"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 bg-base-200/50 flex flex-col sm:flex-row justify-between items-center gap-3 rounded-b-lg mt-auto">
                     <a href={`/#/product/${product.id}`} target="_blank" rel="noopener noreferrer" className="text-sm text-sky-400 hover:underline">
                        Посмотреть на сайте
                    </a>
                    <div className="flex gap-3">
                        <button onClick={onClose} disabled={isSaving} className="bg-base-300 hover:bg-base-200 text-white font-bold py-2 px-4 rounded">
                            Закрыть
                        </button>
                        <button onClick={() => handleAction('reject')} disabled={isSaving} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded min-w-[120px]">
                            {isSaving && formData.status === 'Rejected' ? <Spinner size="sm"/> : 'Отклонить'}
                        </button>
                         <button onClick={() => handleAction('approve')} disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded min-w-[120px]">
                            {isSaving && formData.status !== 'Rejected' ? <Spinner size="sm"/> : 'Одобрить'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductModerationModal;