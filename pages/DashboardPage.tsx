import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import SalesChart from '../components/SalesChart';
import { backendApiService } from '../services/backendApiService';
import type { AdminDashboardData } from '../services/adminApiService';

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
    
    const icon = (d: string) => <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d={d}></path></svg>;


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
                    title="Общий оборот" 
                    value={`${data.kpis.totalRevenue.toLocaleString()} USDT`} 
                    icon={icon("M5 21V3h14v18l-7-3-7 3z")}
                    color="text-green-400"
                />
                <StatCard 
                    title="Прибыль платформы" 
                    value={`${data.kpis.platformProfit.toLocaleString()} USDT`} 
                    icon={icon("M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H8l4-5v4h3l-4 5z")}
                    color="text-sky-400"
                />
                <StatCard 
                    title="Новые пользователи" 
                    value={data.kpis.newUsers.toLocaleString()} 
                    icon={icon("M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z")}
                    color="text-white"
                />
                <StatCard 
                    title="Товары на модерации" 
                    value={data.kpis.productsForModeration.toLocaleString()} 
                    icon={icon("M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z")}
                    color="text-yellow-400"
                />
            </div>

            {/* Sales Chart */}
            <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4">Динамика продаж (Последние 30 дней)</h2>
                <div className="h-80">
                    <SalesChart data={data.salesData} />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;