import React, { useState } from 'react';
import type { AdminPanelOrder } from '../services/adminApiService';

interface OrderDetailsModalProps {
    order: AdminPanelOrder;
    onClose: () => void;
    onSave: (order: AdminPanelOrder) => Promise<void>;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose, onSave }) => {
    const [currentStatus, setCurrentStatus] = useState(order.status);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        await onSave({ ...order, status: currentStatus });
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-base-300 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white">Детали заказа</h2>
                        <p className="text-sm text-primary font-mono">{order.id}</p>
                    </div>
                    <button onClick={onClose} className="text-base-content/70 hover:text-white text-3xl">&times;</button>
                </div>
                
                <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Customer & Shipping */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-base-200 p-4 rounded-md">
                            <h3 className="font-semibold mb-2">Покупатель</h3>
                            <p>{order.customerInfo.name}</p>
                            <p className="text-sm text-base-content/70">{order.customerInfo.email}</p>
                        </div>
                        <div className="bg-base-200 p-4 rounded-md">
                            <h3 className="font-semibold mb-2">Продавец</h3>
                            <p>{order.sellerName}</p>
                        </div>
                        <div className="bg-base-200 p-4 rounded-md">
                            <h3 className="font-semibold mb-2">Адрес доставки</h3>
                            <p className="text-sm text-base-content/80">{order.customerInfo.shippingAddress}</p>
                        </div>
                         <div className="bg-base-200 p-4 rounded-md">
                            <h3 className="font-semibold mb-2">Управление статусом</h3>
                             <select 
                                value={currentStatus} 
                                onChange={e => setCurrentStatus(e.target.value as AdminPanelOrder['status'])}
                                className="w-full bg-base-300 border border-base-100 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                             >
                                <option value="Processing">В обработке</option>
                                <option value="Shipped">Отправлен</option>
                                <option value="Completed">Завершен</option>
                                <option value="Cancelled">Отменен</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Right Column: Items */}
                    <div className="md:col-span-2">
                        <h3 className="font-semibold mb-2">Состав заказа</h3>
                        <div className="bg-base-200 rounded-md divide-y divide-base-300">
                            {order.items.map(item => (
                                <div key={item.productId} className="p-3 flex items-center gap-4">
                                    <img src={item.imageUrl} alt={item.title} className="w-16 h-16 rounded-md object-cover" />
                                    <div className="flex-grow">
                                        <p className="font-semibold text-white">{item.title}</p>
                                        <p className="text-sm text-base-content/70">{item.quantity} шт. &times; {item.price.toFixed(2)} USDT</p>
                                    </div>
                                    <p className="font-mono font-semibold text-white text-lg">{(item.quantity * item.price).toFixed(2)}</p>
                                </div>
                            ))}
                            <div className="p-3 flex justify-between items-center font-bold text-xl">
                                <span>Итого:</span>
                                <span className="text-primary">{order.total.toFixed(2)} USDT</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="p-4 bg-base-200/50 flex justify-end gap-3 rounded-b-lg mt-auto">
                    <button onClick={onClose} disabled={isSaving} className="bg-base-300 hover:bg-base-200 text-white font-bold py-2 px-4 rounded">Отмена</button>
                    <button onClick={handleSave} disabled={isSaving || currentStatus === order.status} className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded disabled:bg-gray-500">
                        {isSaving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
