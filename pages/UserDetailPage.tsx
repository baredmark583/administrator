import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { backendApiService } from '../services/backendApiService';
import type { AdminPanelUserDetails, AdminPanelProduct, AdminPanelOrder, AdminPanelDispute, AdminPanelUser } from '../services/adminApiService';
import EditUserModal from '../components/EditUserModal';
import Spinner from '../components/Spinner';
import { useCurrency } from '../hooks/useCurrency';

const StatCard: React.FC<{ title: string; value: React.ReactNode; icon: string }> = ({ title, value, icon }) => (
    <div className="bg-base-200 p-4 rounded-lg flex items-center gap-4">
        <div className="text-3xl">{icon}</div>
        <div>
            <p className="text-sm text-base-content/70">{title}</p>
            <div className="text-xl font-bold text-white">{value}</div>
        </div>
    </div>
);

type UserDetailTab = 'products' | 'sales' | 'purchases' | 'disputes';

const TelegramMessageSender: React.FC<{ userId: string, userName: string }> = ({ userId, userName }) => {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [result, setResult] = useState('');

    const handleSend = async () => {
        if (!message.trim()) return;
        setIsSending(true);
        setResult('');
        try {
            const response = await backendApiService.sendMessageToUser(userId, message);
            setResult(response.message);
            setMessage('');
        } catch (error) {
            setResult('Ошибка отправки: ' + (error as Error).message);
        } finally {
            setIsSending(false);
        }
    };
    
    return (
        <div className="bg-base-100 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-white mb-2">Отправить сообщение в Telegram</h3>
            <p className="text-sm text-base-content/70 mb-4">Сообщение будет отправлено пользователю {userName} через бота.</p>
             <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={3}
                placeholder="Ваше сообщение..."
                className="w-full bg-base-200 border border-base-300 rounded-md p-2 text-sm"
                disabled={isSending}
            />
            <button
                onClick={handleSend}
                disabled={isSending || !message.trim()}
                className="mt-2 w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg flex justify-center items-center disabled:bg-gray-500"
            >
                {isSending ? <Spinner size="sm" /> : 'Отправить'}
            </button>
            {result && <p className="text-xs text-center mt-2 text-base-content/80">{result}</p>}
        </div>
    )
}

const UserDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [user, setUser] = useState<AdminPanelUserDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<UserDetailTab>('products');
    const [isSavingRole, setIsSavingRole] = useState(false);
    const { getFormattedPrice } = useCurrency();

    useEffect(() => {
        if (id) {
            setIsLoading(true);
            backendApiService.getUserDetails(id)
                .then(setUser)
                .catch(err => console.error("Failed to fetch user details", err))
                .finally(() => setIsLoading(false));
        }
    }, [id]);
    
    const handleSaveUser = async (updatedUser: AdminPanelUser) => {
        if (!user) return;
        const payload = {
            ...user,
            name: updatedUser.name,
            email: updatedUser.email,
            balance: updatedUser.balance,
            status: updatedUser.status,
            role: updatedUser.role,
        };
        const savedUser = await backendApiService.updateUser(payload);
        setUser(prev => prev ? { ...prev, ...savedUser } : null);
        setIsEditing(false);
    };

    const handleBlockUser = async () => {
        if (!user) return;
        const isCurrentlyBlocked = user.isBlocked;
        const confirmation = window.confirm(`Вы уверены, что хотите ${isCurrentlyBlocked ? 'разблокировать' : 'заблокировать'} этого пользователя?`);
        if (confirmation) {
            const updatedUser = { ...user, isBlocked: !isCurrentlyBlocked };
            setUser(updatedUser); // Optimistic update
            await backendApiService.updateUser(updatedUser);
        }
    };

    const handleSaveRole = async (newRole: AdminPanelUser['role']) => {
        if (!user || user.role === newRole) return;
        setIsSavingRole(true);
        try {
            const updatedUser = await backendApiService.updateUser({ id: user.id, role: newRole });
            setUser(prev => prev ? { ...prev, role: updatedUser.role } : null);
            alert('Роль успешно обновлена!');
        } catch (error) {
            alert('Не удалось обновить роль.');
        } finally {
            setIsSavingRole(false);
        }
    }
    
    const TabButton: React.FC<{ tab: UserDetailTab; label: string; count: number }> = ({ tab, label, count }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-2 ${activeTab === tab ? 'bg-primary text-white' : 'text-base-content/70 hover:bg-base-300'}`}
        >
            {label}
            <span className="bg-base-100 text-xs px-2 py-0.5 rounded-full">{count}</span>
        </button>
    );

    const renderTabContent = () => {
        if (!user) return null;
        switch(activeTab) {
            case 'products':
                return <SimpleProductsTable products={user.products} />;
            case 'sales':
                return <SimpleOrdersTable orders={user.sales} type="sales" />;
            case 'purchases':
                return <SimpleOrdersTable orders={user.purchases} type="purchases" />;
            case 'disputes':
                return <SimpleDisputesTable disputes={user.disputes} />;
            default:
                return null;
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
    }

    if (!user) {
        return <div className="text-center text-red-400">Пользователь не найден.</div>;
    }

    return (
        <div>
             <Link to="/users" className="text-sm text-sky-400 hover:underline mb-4 inline-block">&larr; Вернуться ко всем пользователям</Link>

            <div className="bg-base-100 p-6 rounded-lg shadow-lg mb-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full border-4 border-base-300"/>
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                        <p className="text-base-content/70">{user.email}</p>
                        <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
                             <span className={`px-2 py-1 text-xs font-semibold rounded-full w-fit ${user.status === 'Pro' ? 'bg-amber-500/20 text-amber-300' : 'bg-gray-500/20 text-gray-300'}`}>{user.status}</span>
                             {user.isBlocked && <span className="px-2 py-1 text-xs font-semibold rounded-full w-fit bg-red-500/20 text-red-300">Заблокирован</span>}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditing(true)} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg">Редактировать</button>
                        <button onClick={handleBlockUser} className={`${user.isBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white font-bold py-2 px-4 rounded-lg`}>
                            {user.isBlocked ? 'Разблокировать' : 'Заблокировать'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatCard title="Баланс" value={getFormattedPrice(user.balance)} icon="💰" />
                    <StatCard title="Всего продано (GMV)" value={getFormattedPrice(user.financials.gmv)} icon="📈" />
                    <StatCard title="Всего куплено" value={getFormattedPrice(user.financials.totalSpent)} icon="🛒" />
                    <StatCard title="Комиссия платформе" value={getFormattedPrice(user.financials.platformCommission)} icon="🏦" />
                </div>
                <TelegramMessageSender userId={user.id} userName={user.name} />
            </div>

            <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                 <div className="flex flex-wrap gap-2 mb-4 border-b border-base-300 pb-4">
                    <TabButton tab="products" label="Товары" count={user.products.length} />
                    <TabButton tab="sales" label="Продажи" count={user.sales.length} />
                    <TabButton tab="purchases" label="Покупки" count={user.purchases.length} />
                    <TabButton tab="disputes" label="Споры" count={user.disputes.length} />
                </div>
                {renderTabContent()}
            </div>

            {isEditing && <EditUserModal user={user} onClose={() => setIsEditing(false)} onSave={handleSaveUser} />}
        </div>
    );
};

const SimpleProductsTable: React.FC<{products: AdminPanelProduct[]}> = ({products}) => {
    const { getFormattedPrice } = useCurrency();
    return (<div className="overflow-x-auto"><table className="w-full text-sm">
        <thead className="text-xs text-base-content/70 uppercase"><tr><th className="px-4 py-2">Товар</th><th className="px-4 py-2">Цена</th><th className="px-4 py-2">Статус</th></tr></thead>
        <tbody>{products.map(p => <tr key={p.id} className="border-b border-base-300/50">
            <td className="px-4 py-2 text-white font-medium">{p.title}</td>
            <td className="px-4 py-2 font-mono">{getFormattedPrice(p.price)}</td>
            <td className="px-4 py-2">{p.status}</td>
        </tr>)}</tbody>
    </table></div>
)};

const SimpleOrdersTable: React.FC<{orders: AdminPanelOrder[], type: 'sales' | 'purchases'}> = ({orders, type}) => {
    const { getFormattedPrice } = useCurrency();
    return (<div className="overflow-x-auto"><table className="w-full text-sm">
        <thead className="text-xs text-base-content/70 uppercase"><tr><th className="px-4 py-2">ID</th><th className="px-4 py-2">{type === 'sales' ? 'Покупатель' : 'Продавец'}</th><th className="px-4 py-2">Сумма</th><th className="px-4 py-2">Статус</th></tr></thead>
        <tbody>{orders.map(o => <tr key={o.id} className="border-b border-base-300/50">
            <td className="px-4 py-2 font-mono text-white/70">{o.id.slice(0,8)}...</td>
            <td className="px-4 py-2 text-white">{type === 'sales' ? o.buyer.name : o.seller.name}</td>
            <td className="px-4 py-2 font-mono">{getFormattedPrice(o.total)}</td>
            <td className="px-4 py-2">{o.status}</td>
        </tr>)}</tbody>
    </table></div>
)};

const SimpleDisputesTable: React.FC<{disputes: AdminPanelDispute[]}> = ({disputes}) => (
     <div className="overflow-x-auto"><table className="w-full text-sm">
        <thead className="text-xs text-base-content/70 uppercase"><tr><th className="px-4 py-2">ID Заказа</th><th className="px-4 py-2">Создан</th><th className="px-4 py-2">Статус</th></tr></thead>
        <tbody>{disputes.map(d => <tr key={d.id} className="border-b border-base-300/50">
            <td className="px-4 py-2 font-mono text-white/70">{d.order.id.slice(0,8)}...</td>
            <td className="px-4 py-2 text-white">{d.createdAt}</td>
            <td className="px-4 py-2">{d.status}</td>
        </tr>)}</tbody>
    </table></div>
);

export default UserDetailPage;