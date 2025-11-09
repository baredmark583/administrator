import React, { useState, useEffect, useMemo } from 'react';
import type { AdminPanelProduct } from '../services/adminApiService';
import type { CategorySchema } from '../constants';
import { backendApiService } from '../services/backendApiService';
import type { ProductModerationEvent } from '../services/backendApiService';
import Spinner from './Spinner';

interface ProductModerationModalProps {
    product: AdminPanelProduct;
    onClose: () => void;
    onApprove: (note?: string) => Promise<void>;
    onReject: (reason: string, note?: string) => Promise<void>;
}

const actionLabels: Record<ProductModerationEvent['action'], string> = {
    SUBMITTED: 'Создано и отправлено на модерацию',
    APPROVED: 'Одобрено модератором',
    REJECTED: 'Отклонено модератором',
    APPEALED: 'Апелляция продавца',
    REOPENED: 'Повторное открытие',
};

const ProductModerationModal: React.FC<ProductModerationModalProps> = ({ product, onClose, onApprove, onReject }) => {
    const [formData, setFormData] = useState<AdminPanelProduct>(product);
    const [categories, setCategories] = useState<CategorySchema[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [events, setEvents] = useState<ProductModerationEvent[]>([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);
    const [timelineError, setTimelineError] = useState<string | null>(null);
    const [showRejectionForm, setShowRejectionForm] = useState(product.status === 'Rejected');
    const [rejectionReason, setRejectionReason] = useState(product.rejectionReason || '');
    const [moderatorNote, setModeratorNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        backendApiService.getCategories()
            .then(setCategories)
            .finally(() => setIsLoadingCategories(false));
    }, []);

    useEffect(() => {
        setIsLoadingEvents(true);
        setTimelineError(null);
        backendApiService.getProductModerationEvents(product.id)
            .then(setEvents)
            .catch(() => setTimelineError('Не удалось загрузить историю модерации'))
            .finally(() => setIsLoadingEvents(false));
    }, [product.id]);

    const categoryOptions = useMemo(() => {
        if (!categories.length) return [];
        return categories.map(cat => ({ label: cat.name, value: cat.name }));
    }, [categories]);

    useEffect(() => {
        setFormData(product);
        setRejectionReason(product.rejectionReason || '');
        setShowRejectionForm(product.status === 'Rejected');
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' ? parseFloat(value) || 0 : value,
        }));
    };

    const persistEditableFields = async () => {
        const updates: Partial<AdminPanelProduct> = {};
        if (formData.title !== product.title) updates.title = formData.title;
        if (formData.description !== product.description) updates.description = formData.description;
        if (formData.price !== product.price) updates.price = formData.price;
        if (formData.category !== product.category) updates.category = formData.category;
        if (Object.keys(updates).length === 0) return;
        await backendApiService.updateProduct(product.id, updates);
    };

    const handleApprove = async () => {
        setIsSaving(true);
        try {
            await persistEditableFields();
            await onApprove(moderatorNote || undefined);
            onClose();
        } catch (error) {
            console.error('Failed to approve product', error);
            alert('Не удалось одобрить товар. Попробуйте ещё раз.');
            setIsSaving(false);
        }
    };

    const handleReject = async () => {
        if (!showRejectionForm) {
            setShowRejectionForm(true);
            return;
        }
        if (!rejectionReason.trim()) {
            alert('Пожалуйста, укажите причину отклонения.');
            return;
        }
        setIsSaving(true);
        try {
            await persistEditableFields();
            await onReject(rejectionReason.trim(), moderatorNote || undefined);
            onClose();
        } catch (error) {
            console.error('Failed to reject product', error);
            alert('Не удалось отклонить товар. Попробуйте ещё раз.');
            setIsSaving(false);
        }
    };

    const renderTimeline = () => {
        if (isLoadingEvents) {
            return <div className="flex items-center justify-center py-4"><Spinner size="sm" /></div>;
        }
        if (timelineError) {
            return <p className="text-sm text-red-400">{timelineError}</p>;
        }
        if (!events.length) {
            return <p className="text-sm text-base-content/60">История модерации пока пуста.</p>;
        }
        return (
            <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {events.map(event => (
                    <li key={event.id} className="bg-base-200 rounded-md p-2 text-sm">
                        <div className="font-semibold text-white">{actionLabels[event.action]}</div>
                        <div className="text-xs text-base-content/60">{event.createdAt}</div>
                        {(event.previousStatus || event.nextStatus) && (
                            <div className="text-xs text-base-content/60 mt-1">
                                {event.previousStatus || '—'} → {event.nextStatus || '—'}
                            </div>
                        )}
                        {event.comment && <p className="mt-1 text-base-content/80">{event.comment}</p>}
                        {event.moderator && (
                            <p className="text-xs text-base-content/60 mt-1">
                                Модератор: {event.moderator.name}
                            </p>
                        )}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-base-300">
                    <h2 className="text-xl font-bold text-white">Модерация товара</h2>
                </div>

                <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <div>
                            <h4 className="font-semibold mb-1">Характеристики</h4>
                            <div className="text-sm text-base-content/80 bg-base-200 p-3 rounded-md space-y-1 max-h-40 overflow-y-auto">
                                {Object.entries(product.dynamicAttributes || {}).map(([key, value]) => (
                                    <div key={key}><strong>{key}:</strong> {String(value)}</div>
                                ))}
                            </div>
                        </div>
                    </div>

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
                                    {isLoadingCategories ? (
                                        <option>Загрузка...</option>
                                    ) : (
                                        categoryOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>

                        {product.rejectionReason && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-md p-3 text-sm">
                                <p className="font-semibold text-red-300">Последняя причина отклонения</p>
                                <p className="text-red-100 mt-1">{product.rejectionReason}</p>
                            </div>
                        )}

                        {product.appealMessage && (
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-3 text-sm">
                                <p className="font-semibold text-amber-200">Апелляция продавца</p>
                                <p className="text-amber-100 mt-1">{product.appealMessage}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-base-content/70 mb-1">Комментарий модератора (опционально)</label>
                            <textarea
                                value={moderatorNote}
                                onChange={(e) => setModeratorNote(e.target.value)}
                                rows={3}
                                className="w-full bg-base-200 border border-base-300 rounded-md p-2 text-sm"
                                placeholder="Этот комментарий будет виден продавцу."
                            />
                        </div>

                        {showRejectionForm && (
                            <div className="animate-fade-in-down">
                                <label className="block text-sm font-medium text-red-400 mb-1">Причина отклонения*</label>
                                <textarea
                                    name="rejectionReason"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    rows={3}
                                    className="w-full bg-base-200 border border-red-500/50 rounded-md p-2"
                                    placeholder="Например: 'Недостаточно деталей в описании'"
                                />
                            </div>
                        )}

                        <div>
                            <h4 className="text-sm font-semibold text-base-content/70 mb-2">История модерации</h4>
                            {renderTimeline()}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-base-200/50 flex flex-col sm:flex-row justify-between items-center gap-3 rounded-b-lg mt-auto">
                    <a href={`/#/product/${product.id}`} target="_blank" rel="noopener noreferrer" className="text-sm text-sky-400 hover:underline">
                        Посмотреть на площадке
                    </a>
                    <div className="flex gap-3">
                        <button onClick={onClose} disabled={isSaving} className="bg-base-300 hover:bg-base-200 text-white font-bold py-2 px-4 rounded">
                            Закрыть
                        </button>
                        <button onClick={handleReject} disabled={isSaving} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded min-w-[140px]">
                            {showRejectionForm ? (isSaving ? <Spinner size="sm" /> : 'Подтвердить отказ') : 'Отклонить'}
                        </button>
                        <button onClick={handleApprove} disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded min-w-[140px]">
                            {isSaving && !showRejectionForm ? <Spinner size="sm" /> : 'Одобрить'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductModerationModal;
