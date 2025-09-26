import React, { useState, useRef, useEffect } from 'react';
import type { AdminPanelDispute, DisputeMessage } from '../services/adminApiService';

interface DisputeDetailsModalProps {
    dispute: AdminPanelDispute;
    onClose: () => void;
    onResolve: (dispute: AdminPanelDispute, resolutionStatus: 'RESOLVED_BUYER' | 'RESOLVED_SELLER', adminMessage: string) => Promise<void>;
}

const DisputeMessageBubble: React.FC<{ message: DisputeMessage, buyerId: string, sellerId: string }> = ({ message, buyerId, sellerId }) => {
    const isBuyer = message.senderId === buyerId;
    const isSeller = message.senderId === sellerId;
    const isArbitrator = !isBuyer && !isSeller;

    const alignment = isSeller ? 'items-end' : 'items-start';
    const bubbleColor = isSeller ? 'bg-primary/80' : (isArbitrator ? 'bg-amber-600/80' : 'bg-base-300');
    const bubbleStyles = isSeller ? 'rounded-br-none' : 'rounded-bl-none';

    return (
        <div className={`flex flex-col mb-4 ${alignment} w-full`}>
            {!isSeller && (
                 <div className="flex items-center gap-2 mb-1">
                    <img src={message.senderAvatar} alt={message.senderName} className="w-6 h-6 rounded-full"/>
                    <span className="text-sm font-semibold text-base-content/70">{message.senderName} {isArbitrator && '(Арбитр)'}</span>
                 </div>
            )}
            <div className={`max-w-md w-fit px-4 py-3 rounded-2xl ${bubbleColor} ${bubbleStyles}`}>
                {message.text && (
                     <p className="text-white text-sm leading-relaxed">{message.text}</p>
                )}
                <p className={`text-xs mt-1 text-white/60 text-right`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </div>
    );
};


const DisputeDetailsModal: React.FC<DisputeDetailsModalProps> = ({ dispute, onClose, onResolve }) => {
    const [adminMessage, setAdminMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [dispute.messages]);

    const handleResolve = async (resolutionStatus: 'RESOLVED_BUYER' | 'RESOLVED_SELLER') => {
        if (!adminMessage.trim()) {
            alert('Пожалуйста, введите комментарий с решением.');
            return;
        }
        setIsSaving(true);
        await onResolve(dispute, resolutionStatus, adminMessage);
        setIsSaving(false);
    };

    const firstItem = dispute.order.items[0];
    const isResolved = dispute.status.startsWith('RESOLVED');
    const buyerId = 'buyer-1'; // This would come from the order object in a real app
    const sellerId = 'user-1';  // This would come from the order object in a real app

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-base-300">
                    <h2 className="text-xl font-bold text-white">Разрешение спора по заказу <span className="font-mono text-primary">{dispute.id}</span></h2>
                </div>
                
                <div className="p-4 flex-grow overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Left Column: Order Info */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-base-200 p-3 rounded-md">
                            <img src={firstItem.imageUrl} alt={firstItem.title} className="w-full aspect-square object-cover rounded-md mb-2"/>
                            <p className="font-semibold text-white">{firstItem.title}</p>
                            <p className="text-sm text-base-content/70">Сумма: {dispute.order.total.toFixed(2)} USDT</p>
                        </div>
                        <div className="bg-base-200 p-3 rounded-md text-sm">
                            <p><strong>Покупатель:</strong> {dispute.order.customerName}</p>
                            <p><strong>Продавец:</strong> {dispute.order.sellerName}</p>
                        </div>
                    </div>
                    
                    {/* Right Column: Chat */}
                    <div className="md:col-span-2 bg-base-200 rounded-md p-4 flex flex-col h-[70vh]">
                        <h3 className="font-semibold mb-2 text-white border-b border-base-300 pb-2">История спора</h3>
                        <div className="flex-grow overflow-y-auto pr-2">
                             {dispute.messages.map(msg => (
                                <DisputeMessageBubble key={msg.id} message={msg} buyerId={buyerId} sellerId={sellerId} />
                             ))}
                            <div ref={messagesEndRef} />
                        </div>
                        {!isResolved && (
                            <div className="mt-4 pt-4 border-t border-base-300">
                                <textarea
                                    value={adminMessage}
                                    onChange={e => setAdminMessage(e.target.value)}
                                    rows={3}
                                    className="w-full bg-base-100 border border-base-300 rounded-md p-2 text-sm"
                                    placeholder="Введите ваше решение/комментарий..."
                                />
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="p-4 bg-base-200/50 flex justify-between items-center rounded-b-lg mt-auto">
                    <button onClick={onClose} disabled={isSaving} className="bg-base-300 hover:bg-base-200 text-white font-bold py-2 px-4 rounded">
                       {isResolved ? 'Закрыть' : 'Отмена'}
                    </button>
                    {!isResolved && (
                         <div className="flex gap-3">
                             <button onClick={() => handleResolve('RESOLVED_BUYER')} disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                                {isSaving ? '...' : 'В пользу Покупателя'}
                            </button>
                             <button onClick={() => handleResolve('RESOLVED_SELLER')} disabled={isSaving} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded">
                                {isSaving ? '...' : 'В пользу Продавца'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DisputeDetailsModal;