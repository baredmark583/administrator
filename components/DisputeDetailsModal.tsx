import React, { useState, useRef, useEffect } from 'react';
import type { AdminPanelDisputeDetails, DisputeMessage } from '../services/adminApiService';

interface DisputeDetailsModalProps {
    dispute: AdminPanelDisputeDetails;
    onClose: () => void;
    onResolve: (dispute: AdminPanelDisputeDetails, resolutionStatus: 'RESOLVED_BUYER' | 'RESOLVED_SELLER', adminMessage: string) => Promise<void>;
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


const InfoCard: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div className="bg-base-200 p-3 rounded-md">
        <h4 className="font-semibold text-white mb-2 border-b border-base-300 pb-1">{title}</h4>
        <div className="text-sm space-y-1 text-base-content/80">
            {children}
        </div>
    </div>
);

const DisputeDetailsModal: React.FC<DisputeDetailsModalProps> = ({ dispute, onClose, onResolve }) => {
    const [adminMessage, setAdminMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [internalNotes, setInternalNotes] = useState<string[]>([]);
    const [newNote, setNewNote] = useState('');
    const [partialRefundAmount, setPartialRefundAmount] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const quickReplies = [
        "Здравствуйте, я арбитр CryptoCraft. Изучаю ваше дело.",
        "Пожалуйста, предоставьте фото товара и упаковки.",
        "Мы изучим информацию и вернемся с решением в течение 24 часов."
    ];
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [dispute.messages, internalNotes]);

    const handleResolve = async (resolutionStatus: 'RESOLVED_BUYER' | 'RESOLVED_SELLER') => {
        let finalMessage = adminMessage.trim();
        if (partialRefundAmount) {
            finalMessage += `\nРЕШЕНИЕ: Частичный возврат ${partialRefundAmount} USDT.`
        }
        if (!finalMessage) {
            alert('Пожалуйста, введите комментарий с решением.');
            return;
        }
        setIsSaving(true);
        await onResolve(dispute, resolutionStatus, finalMessage);
        setIsSaving(false);
    };

    const isResolved = dispute.status.startsWith('RESOLVED');

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-base-300 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Разрешение спора по заказу <span className="font-mono text-primary">{dispute.id}</span></h2>
                    <button onClick={onClose} className="text-base-content/70 hover:text-white text-3xl">&times;</button>
                </div>
                
                <div className="flex-grow overflow-y-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Context */}
                    <div className="lg:col-span-3 space-y-4">
                        <InfoCard title="Детали Заказа">
                            <p><strong>Статус:</strong> {dispute.fullOrder.status}</p>
                            <p><strong>Сумма:</strong> {dispute.fullOrder.total.toFixed(2)} USDT</p>
                            <p><strong>Доставка:</strong> {dispute.fullOrder.customerInfo.shippingAddress}</p>
                        </InfoCard>
                         <InfoCard title="Покупатель">
                            <p><strong>Имя:</strong> {dispute.buyer.name}</p>
                            <p><strong>Email:</strong> {dispute.buyer.email}</p>
                            <p><strong>Всего заказов:</strong> {dispute.buyerStats.totalOrders}</p>
                            <p><strong>Процент споров:</strong> {dispute.buyerStats.disputeRate}%</p>
                        </InfoCard>
                         <InfoCard title="Продавец">
                            <p><strong>Имя:</strong> {dispute.seller.name}</p>
                            <p><strong>Email:</strong> {dispute.seller.email}</p>
                            <p><strong>Всего продаж:</strong> {dispute.sellerStats.totalSales}</p>
                            <p><strong>Процент споров:</strong> {dispute.sellerStats.disputeRate}%</p>
                        </InfoCard>
                    </div>
                    
                    {/* Center Column: Chat */}
                    <div className="lg:col-span-5 bg-base-200 rounded-md p-4 flex flex-col h-[75vh]">
                        <h3 className="font-semibold mb-2 text-white border-b border-base-300 pb-2">История спора</h3>
                        <div className="flex-grow overflow-y-auto pr-2">
                             {dispute.messages.map(msg => (
                                <DisputeMessageBubble key={msg.id} message={msg} buyerId={dispute.buyer.id} sellerId={dispute.seller.id} />
                             ))}
                            <div ref={messagesEndRef} />
                        </div>
                         {!isResolved && (
                            <div className="mt-4 pt-4 border-t border-base-300">
                                <h4 className="text-sm font-semibold mb-2 text-base-content/80">Внутренние заметки (не видны пользователям)</h4>
                                <div className="max-h-24 overflow-y-auto text-xs space-y-1 mb-2 bg-base-100 p-2 rounded">
                                    {internalNotes.length > 0 ? internalNotes.map((note, i) => <p key={i}>- {note}</p>) : <p className="text-base-content/60">Заметок пока нет.</p>}
                                </div>
                                <div className="flex gap-2">
                                    <input value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Добавить заметку..." className="flex-grow bg-base-100 border border-base-300 rounded-md p-1 text-sm" />
                                    <button onClick={() => {if(newNote.trim()){ setInternalNotes([...internalNotes, newNote]); setNewNote('');}}} className="bg-base-300 text-sm px-3 rounded">Добавить</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Actions */}
                    <div className="lg:col-span-4 space-y-4">
                        <InfoCard title="Панель действий">
                            {!isResolved ? (
                            <>
                                <h4 className="text-sm font-semibold text-white mb-2">Шаблоны ответов</h4>
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {quickReplies.map(text => (
                                        <button key={text} onClick={() => setAdminMessage(prev => prev ? `${prev}\n${text}`: text)} className="text-xs bg-base-300 hover:bg-base-100 p-1.5 rounded">"{text.slice(0, 20)}..."</button>
                                    ))}
                                </div>
                                
                                <h4 className="text-sm font-semibold text-white mb-2">Сообщение для сторон</h4>
                                <textarea
                                    value={adminMessage}
                                    onChange={e => setAdminMessage(e.target.value)}
                                    rows={4}
                                    className="w-full bg-base-300 border border-base-100 rounded-md p-2 text-sm"
                                    placeholder="Введите ваше решение/комментарий..."
                                />
                                
                                <h4 className="text-sm font-semibold text-white mt-4 mb-2">Финансовые действия</h4>
                                <div className="flex gap-2">
                                    <input 
                                        type="number" 
                                        value={partialRefundAmount} 
                                        onChange={e => setPartialRefundAmount(e.target.value)}
                                        placeholder="Сумма возврата"
                                        className="w-full bg-base-300 border border-base-100 rounded-md p-2 text-sm"
                                    />
                                    <button onClick={() => setAdminMessage(prev => `${prev}\nРЕШЕНИЕ: Частичный возврат ${partialRefundAmount} USDT.`)} disabled={!partialRefundAmount} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold p-2 rounded-lg text-sm disabled:bg-gray-500">
                                        Частичный возврат
                                    </button>
                                </div>
                                 <button onClick={() => setAdminMessage(prev => `${prev}\nРЕШЕНИЕ: Полный возврат средств покупателю.`)} className="w-full mt-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold p-2 rounded-lg text-sm">
                                    Полный возврат
                                </button>
                                
                                <button className="w-full mt-2 bg-gray-600 hover:bg-gray-700 text-white font-bold p-2 rounded-lg text-sm">
                                    Передать старшему арбитру
                                </button>
                            </>
                            ) : (
                                <div>
                                    <p className="font-bold text-lg text-green-400">Спор разрешен</p>
                                    <p>Статус: {dispute.status}</p>
                                </div>
                            )}
                        </InfoCard>
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