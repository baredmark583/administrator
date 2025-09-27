import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import SalesChart from '../components/SalesChart';
import { backendApiService } from '../services/backendApiService';
import type { AdminDashboardData } from '../services/adminApiService';
import { Link } from 'react-router-dom';

const icon = (d: string) => <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d={d}></path></svg>;

const ActivityFeed: React.FC<{ activities: AdminDashboardData['recentActivity'] }> = ({ activities }) => (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg h-full">
        <h2 className="text-xl font-bold text-white mb-4">Лента активности</h2>
        <ul className="space-y-4">
            {activities.map(activity => (
                <li key={activity.id} className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${activity.type === 'new_user' ? 'bg-sky-500/20 text-sky-400' : 'bg-green-500/20 text-green-400'}`}>
                        {activity.type === 'new_user' ? '👤' : '🛒'}
                    </div>
                    <div>
                        <p className="text-sm text-base-content leading-tight">{activity.text}</p>
                        <p className="text-xs text-base-content/60">{activity.time}</p>
                    </div>
                </li>
            ))}
        </ul>
    </div>
);

const TopSellers: React.FC<{ sellers: AdminDashboardData['topSellers'] }> = ({ sellers }) => (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg h-full">
        <h2 className="text-xl font-bold text-white mb-4">Топ продавцы (30 дней)</h2>
        <ul className="space-y-3">
            {sellers.map(seller => (
                <li key={seller.id} className="flex items-center gap-3">
                    <img src={seller.avatarUrl} alt={seller.name} className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                        <p className="font-semibold text-white leading-tight">{seller.name}</p>
                        <p className="text-xs text-base-content/60">{seller.salesCount} продаж</p>
                    </div>
                    <p className="font-mono font-semibold text-green-400">{seller.totalRevenue.toFixed(2)}</p>
                </li>
            ))}
        </ul>
    </div>
);


const DashboardPage: React.FC = () => {
    const [data, setData] = useState<AdminDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await backendApiService.getDashboardData();
                setData(result);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>;
    }

    if (!data) {
        return <div className="text-center text-red-400">Failed to load dashboard data.</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Оборот за сегодня" 
                    value={`${data.kpis.totalRevenueToday.toLocaleString()} USDT`} 
                    icon={icon("M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H8l4-5v4h3l-4 5z")}
                    color="text-green-400"
                />
                <StatCard 
                    title="Новые заказы сегодня" 
                    value={data.kpis.newOrdersToday.toLocaleString()} 
                    icon={icon("M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z")}
                    color="text-sky-400"
                />
                 <StatCard 
                    title="Активные споры" 
                    value={data.kpis.activeDisputes.toLocaleString()} 
                    icon={icon("M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z")}
                    color="text-red-400"
                />
                <StatCard 
                    title="На модерации" 
                    value={data.kpis.productsForModeration.toLocaleString()} 
                    icon={icon("M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z")}
                    color="text-yellow-400"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* Sales Chart */}
                <div className="lg:col-span-2 bg-base-100 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold text-white mb-4">Динамика продаж (Последние 30 дней)</h2>
                    <div className="h-96">
                        <SalesChart data={data.salesData} />
                    </div>
                </div>

                {/* Side Panels */}
                <div className="lg:col-span-1 space-y-8">
                    <ActivityFeed activities={data.recentActivity} />
                    <TopSellers sellers={data.topSellers} />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;