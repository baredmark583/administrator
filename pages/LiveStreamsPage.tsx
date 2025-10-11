import React, { useState, useEffect } from 'react';
import { backendApiService } from '../services/backendApiService';
import type { LiveStream } from '../../types';
import Spinner from '../components/Spinner';

const LiveStreamsPage: React.FC = () => {
    const [streams, setStreams] = useState<LiveStream[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStreams = async () => {
            setIsLoading(true);
            try {
                const result = await backendApiService.getLiveStreams();
                // Показываем только активные и запланированные
                setStreams(result.filter(s => s.status === 'LIVE' || s.status === 'UPCOMING'));
            } catch (error) {
                console.error("Failed to fetch livestreams", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStreams();
    }, []);

    const StatusBadge: React.FC<{ status: LiveStream['status'] }> = ({ status }) => {
        const statusMap = {
            'LIVE': { text: 'В ЭФИРЕ', style: 'bg-red-500/20 text-red-300 animate-pulse' },
            'UPCOMING': { text: 'Запланирован', style: 'bg-sky-500/20 text-sky-300' },
            'ENDED': { text: 'Завершен', style: 'bg-gray-500/20 text-gray-300' },
        };
        const { text, style } = statusMap[status];
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${style}`}>{text}</span>;
    };
    

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
        }

        if (streams.length === 0) {
            return (
                <div className="text-center py-16">
                    <h2 className="text-2xl font-bold text-white mb-2">Нет активных трансляций</h2>
                    <p className="text-base-content/70">Сейчас никто из продавцов не ведет прямой эфир.</p>
                </div>
            );
        }

        return (
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-base-content">
                    <thead className="text-xs text-base-content/70 uppercase bg-base-300">
                        <tr>
                            <th scope="col" className="px-6 py-3">Название трансляции</th>
                            <th scope="col" className="px-6 py-3">Продавец</th>
                            <th scope="col" className="px-6 py-3">Статус</th>
                            <th scope="col" className="px-6 py-3">Время начала</th>
                            <th scope="col" className="px-6 py-3 text-right">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {streams.map((stream) => (
                            <tr key={stream.id} className="bg-base-100 border-b border-base-300 hover:bg-base-300/50">
                                <td className="px-6 py-4 font-medium text-white">{stream.title}</td>
                                <td className="px-6 py-4">{stream.seller.name}</td>
                                <td className="px-6 py-4"><StatusBadge status={stream.status} /></td>
                                <td className="px-6 py-4">{stream.scheduledStartTime ? new Date(stream.scheduledStartTime).toLocaleString() : 'Только что'}</td>
                                <td className="px-6 py-4 text-right">
                                    <a href={`/#/live/${stream.id}`} target="_blank" rel="noopener noreferrer" className="font-medium text-sky-400 hover:underline">
                                        Войти и модерировать
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Модерация Прямых Эфиров</h1>
            <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                {renderContent()}
            </div>
        </div>
    );
};

export default LiveStreamsPage;