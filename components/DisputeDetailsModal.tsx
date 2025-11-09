import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { AdminPanelDisputeDetails, DisputeMessage } from '../services/adminApiService';

interface DisputeDetailsModalProps {
    dispute: AdminPanelDisputeDetails;
    onClose: () => void;
    onResolve: (
        dispute: AdminPanelDisputeDetails,
        resolutionStatus: 'RESOLVED_BUYER' | 'RESOLVED_SELLER',
        adminMessage: string
    ) => Promise<void>;
    onUpdateDispute: (updated: AdminPanelDisputeDetails) => Promise<void>;
}

const quickReplies = [
    'Здравствуйте, я арбитр CryptoCraft. Изучаю ваше дело.',
    'Пожалуйста, предоставьте фото товара и упаковки.',
    'Мы изучим информацию и вернёмся с решением в течение 24 часов.',
];

const priorityOptions = [
    { value: 'LOW', label: 'Низкий' },
    { value: 'NORMAL', label: 'Нормальный' },
    { value: 'URGENT', label: 'Срочный' },
] as const;

const tierOptions = [
    { value: 'LEVEL1', label: '1-й уровень' },
    { value: 'LEVEL2', label: '2-й уровень' },
    { value: 'SUPERVISOR', label: 'Супервизор' },
] as const;

const DisputeMessageBubble: React.FC<{ message: DisputeMessage; buyerId: string; sellerId: string }> = ({
    message,
    buyerId,
    sellerId,
}) => {
    const isBuyer = message.senderId === buyerId;
    const isSeller = message.senderId === sellerId;
    const isArbitrator = !isBuyer && !isSeller;

    const alignment = isSeller ? 'items-end' : 'items-start';
    const bubbleColor = isSeller ? 'bg-primary/80' : isArbitrator ? 'bg-amber-600/80' : 'bg-base-300';
    const bubbleStyles = isSeller ? 'rounded-br-none' : 'rounded-bl-none';

    return (
        <div className={`flex flex-col mb-4 ${alignment} w-full`}>
            {!isSeller && (
                <div className="flex items-center gap-2 mb-1">
                    <img src={message.senderAvatar} alt={message.senderName} className="w-6 h-6 rounded-full" />
                    <span className="text-sm font-semibold text-base-content/70">
                        {message.senderName} {isArbitrator && '(Арбитр)'}
                    </span>
                </div>
            )}
            <div className={`max-w-md w-fit px-4 py-3 rounded-2xl ${bubbleColor} ${bubbleStyles}`}>
                {message.text && <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>}
                <p className="text-xs mt-1 text-white/60 text-right">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </div>
    );
};

const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-base-200 p-3 rounded-md">
        <h4 className="font-semibold text-white mb-2 border-b border-base-300 pb-1">{title}</h4>
        <div className="text-sm space-y-1 text-base-content/80">{children}</div>
    </div>
);

const DisputeDetailsModal: React.FC<DisputeDetailsModalProps> = ({
    dispute,
    onClose,
    onResolve,
    onUpdateDispute,
}) => {
    const [adminMessage, setAdminMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [priority, setPriority] = useState(dispute.priority ?? 'NORMAL');
    const [assignedTier, setAssignedTier] = useState(dispute.assignedTier ?? 'LEVEL1');
    const [newNote, setNewNote] = useState('');
    const [isMetaSaving, setIsMetaSaving] = useState(false);
    const [isNoteSaving, setIsNoteSaving] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const templates = dispute.resolutionTemplates || [];
    const notes = dispute.internalNotes || [];
    const automationLog = (dispute.automationLog || []).slice(-5).reverse();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [dispute.messages]);

    useEffect(() => {
        setPriority(dispute.priority ?? 'NORMAL');
        setAssignedTier(dispute.assignedTier ?? 'LEVEL1');
    }, [dispute]);

    const slaCountdown = useMemo(() => {
        if (!dispute.responseSlaDueAt) return { label: '—', isLate: false };
        const due = new Date(dispute.responseSlaDueAt).getTime();
        const diffMs = due - Date.now();
        if (diffMs <= 0) return { label: 'Просрочено', isLate: true };
        const hours = Math.floor(diffMs / 36e5);
        const minutes = Math.floor((diffMs % 36e5) / 60000);
        return { label: `≈ ${hours}ч ${minutes}м`, isLate: false };
    }, [dispute.responseSlaDueAt]);

    const pendingAutoActionLabel = useMemo(() => {
        if (!dispute.pendingAutoAction || dispute.pendingAutoAction === 'NONE') return null;
        const deadline = dispute.pendingAutoActionAt
            ? new Date(dispute.pendingAutoActionAt).toLocaleString()
            : 'в любой момент';
        const map: Record<string, string> = {
            AUTO_ESCALATE: 'Автоперевод спорa супервизору',
            AUTO_REFUND: 'Автовозврат средств покупателю',
            AUTO_RELEASE: 'Авторазблокировка средств продавцу',
        };
        return `${map[dispute.pendingAutoAction] || 'Автоматическое действие'} • дедлайн ${deadline}`;
    }, [dispute.pendingAutoAction, dispute.pendingAutoActionAt]);

    const handlePersist = async (partial: Partial<AdminPanelDisputeDetails>, setLoading: (value: boolean) => void) => {
        try {
            setLoading(true);
            await onUpdateDispute({ ...dispute, ...partial });
        } catch (error) {
            console.error('Failed to update dispute metadata', error);
            alert('Не удалось обновить спор. Попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };

    const handlePriorityChange = (value: typeof priority) => {
        setPriority(value);
        handlePersist({ priority: value }, setIsMetaSaving);
    };

    const handleTierChange = (value: typeof assignedTier) => {
        setAssignedTier(value);
        handlePersist({ assignedTier: value }, setIsMetaSaving);
    };

    const handleAddNote = () => {
        if (!newNote.trim()) return;
        const noteEntry = {
            id: `note-${Date.now()}`,
            authorId: 'arbitrator-01',
            authorName: 'CryptoCraft Support',
            note: newNote.trim(),
            createdAt: new Date().toISOString(),
        };
        setNewNote('');
        handlePersist({ internalNotes: [...notes, noteEntry] }, setIsNoteSaving);
    };

    const handleApplyTemplate = (body: string) => {
        setAdminMessage((prev) => (prev ? `${prev}\n${body}` : body));
    };

    const handleResolve = async (resolutionStatus: 'RESOLVED_BUYER' | 'RESOLVED_SELLER') => {
        const finalMessage = adminMessage.trim();
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
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            Разрешение спора по заказу{' '}
                            <span className="font-mono text-primary">{dispute.id}</span>
                        </h2>
                        <p className="text-xs text-base-content/70">
                            Приоритет: {priorityOptions.find((opt) => opt.value === priority)?.label} • Уровень:{' '}
                            {tierOptions.find((opt) => opt.value === assignedTier)?.label}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-base-content/70 hover:text-white text-3xl">
                        &times;
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <div className="lg:col-span-8 space-y-4">
                            <InfoCard title="Информация о заказе">
                                <p>
                                    <strong>Покупатель:</strong> {dispute.order.customerName}
                                </p>
                                <p>
                                    <strong>Продавец:</strong> {dispute.order.sellerName}
                                </p>
                                <p>
                                    <strong>Сумма:</strong> {dispute.order.total.toLocaleString()} USDT
                                </p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {dispute.order.items.map((item) => (
                                        <div key={item.title} className="flex items-center gap-2 bg-base-100/50 px-2 py-1 rounded">
                                            <img src={item.imageUrl} alt={item.title} className="w-8 h-8 rounded object-cover" />
                                            <span className="text-xs">{item.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </InfoCard>

                            <InfoCard title="SLA и автоматизация">
                                <div className="flex flex-col gap-1 text-sm">
                                    <div className="flex justify-between">
                                        <span>Следующий ответ до</span>
                                        <strong>{dispute.responseSlaDueAt ? new Date(dispute.responseSlaDueAt).toLocaleString() : '—'}</strong>
                                    </div>
                                    <p className={`text-xs ${slaCountdown.isLate ? 'text-red-400' : 'text-green-400'}`}>
                                        {slaCountdown.label}
                                    </p>
                                    <div className="flex justify-between">
                                        <span>Нарушений SLA</span>
                                        <strong>{dispute.slaBreachCount ?? 0}</strong>
                                    </div>
                                    {pendingAutoActionLabel && (
                                        <p className="text-xs text-amber-400">{pendingAutoActionLabel}</p>
                                    )}
                                </div>
                            </InfoCard>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-base-content/60 block mb-1">Приоритет</label>
                                    <select
                                        value={priority}
                                        onChange={(e) => handlePriorityChange(e.target.value as typeof priority)}
                                        className="w-full bg-base-200 border border-base-300 rounded-md p-2 text-sm"
                                        disabled={isMetaSaving || isResolved}
                                    >
                                        {priorityOptions.map((opt) => (
                                            <option value={opt.value} key={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-base-content/60 block mb-1">Уровень арбитра</label>
                                    <select
                                        value={assignedTier}
                                        onChange={(e) => handleTierChange(e.target.value as typeof assignedTier)}
                                        className="w-full bg-base-200 border border-base-300 rounded-md p-2 text-sm"
                                        disabled={isMetaSaving || isResolved}
                                    >
                                        {tierOptions.map((opt) => (
                                            <option value={opt.value} key={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="bg-base-200/60 rounded-md p-3">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-sm font-semibold text-white">Диалог</h4>
                                </div>
                                <div className="max-h-96 overflow-y-auto pr-2">
                                    {dispute.messages.map((msg) => (
                                        <DisputeMessageBubble
                                            key={msg.id}
                                            message={msg}
                                            buyerId={dispute.buyer.id}
                                            sellerId={dispute.seller.id}
                                        />
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-4">
                            <InfoCard title="Шаблоны и сообщения">
                                {templates.length > 0 && (
                                    <>
                                        <h4 className="text-xs font-semibold text-base-content/80 mb-2">Шаблоны решений</h4>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {templates.map((tmpl) => (
                                                <button
                                                    key={tmpl.id}
                                                    onClick={() => handleApplyTemplate(tmpl.body)}
                                                    className="text-xs bg-base-300 hover:bg-base-100 p-1.5 rounded"
                                                    type="button"
                                                >
                                                    {tmpl.title}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                                <h4 className="text-xs font-semibold text-base-content/80 mb-2">Быстрые ответы</h4>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {quickReplies.map((text) => (
                                        <button
                                            key={text}
                                            onClick={() => setAdminMessage((prev) => (prev ? `${prev}\n${text}` : text))}
                                            className="text-xs bg-base-300 hover:bg-base-100 p-1.5 rounded"
                                            type="button"
                                        >
                                            "{text.slice(0, 18)}..."
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={adminMessage}
                                    onChange={(e) => setAdminMessage(e.target.value)}
                                    rows={4}
                                    className="w-full bg-base-300 border border-base-100 rounded-md p-2 text-sm"
                                    placeholder="Введите ваше решение/комментарий..."
                                    disabled={isResolved}
                                />
                            </InfoCard>

                            <InfoCard title="Внутренние заметки">
                                <div className="max-h-36 overflow-y-auto text-xs space-y-1 mb-2 bg-base-100 p-2 rounded">
                                    {notes.length > 0 ? (
                                        notes.map((note) => (
                                            <p key={note.id}>
                                                <span className="font-semibold">{note.authorName}:</span> {note.note}{' '}
                                                <span className="opacity-60">
                                                    ({new Date(note.createdAt).toLocaleString()})
                                                </span>
                                            </p>
                                        ))
                                    ) : (
                                        <p className="text-base-content/60">Заметок пока нет.</p>
                                    )}
                                </div>
                                {!isResolved && (
                                    <div className="flex gap-2">
                                        <input
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            placeholder="Добавить заметку..."
                                            className="flex-grow bg-base-100 border border-base-300 rounded-md p-1 text-sm"
                                        />
                                        <button
                                            onClick={handleAddNote}
                                            className="bg-base-300 text-sm px-3 rounded disabled:opacity-50"
                                            disabled={isNoteSaving || !newNote.trim()}
                                            type="button"
                                        >
                                            {isNoteSaving ? '...' : 'Добавить'}
                                        </button>
                                    </div>
                                )}
                            </InfoCard>

                            {automationLog.length > 0 && (
                                <InfoCard title="Журнал автоматизации">
                                    <ul className="text-xs space-y-1">
                                        {automationLog.map((entry) => (
                                            <li key={entry.id} className="flex justify-between gap-2">
                                                <span>{entry.message}</span>
                                                <span className="opacity-60">{new Date(entry.createdAt).toLocaleString()}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </InfoCard>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-base-200/50 flex justify-between items-center rounded-b-lg mt-auto">
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="bg-base-300 hover:bg-base-200 text-white font-bold py-2 px-4 rounded"
                    >
                        {isResolved ? 'Закрыть' : 'Отмена'}
                    </button>
                    {!isResolved && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleResolve('RESOLVED_BUYER')}
                                disabled={isSaving}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                            >
                                {isSaving ? '...' : 'В пользу Покупателя'}
                            </button>
                            <button
                                onClick={() => handleResolve('RESOLVED_SELLER')}
                                disabled={isSaving}
                                className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded"
                            >
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
