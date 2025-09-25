import React, { useState, useEffect, useRef, useMemo } from 'react';
import { adminApiService, AdminLog } from '../services/adminApiService';

const LogLine: React.FC<{ log: AdminLog }> = ({ log }) => {
    const levelColors = {
        INFO: 'text-sky-400',
        WARN: 'text-yellow-400',
        ERROR: 'text-red-500',
    };

    return (
        <div className="flex font-mono text-sm items-start">
            <span className="text-base-content/50 pr-4">{log.timestamp.toLocaleTimeString()}</span>
            <span className={`font-bold w-16 flex-shrink-0 ${levelColors[log.level]}`}>[{log.level}]</span>
            <p className="flex-1 break-words whitespace-pre-wrap">{log.message}</p>
        </div>
    );
};


const DebugPage: React.FC = () => {
    const [logs, setLogs] = useState<AdminLog[]>([]);
    const [filter, setFilter] = useState<'All' | 'INFO' | 'WARN' | 'ERROR'>('All');
    const [isPaused, setIsPaused] = useState(false);
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isPaused) return;

        const unsubscribe = adminApiService.subscribeToLogs((newLog) => {
            setLogs(prevLogs => [...prevLogs, newLog]);
        });

        return () => {
            unsubscribe();
        };
    }, [isPaused]);

    useEffect(() => {
        // Auto-scroll to bottom
        if (logContainerRef.current && !isPaused) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs, isPaused]);

    const filteredLogs = useMemo(() => {
        if (filter === 'All') {
            return logs;
        }
        return logs.filter(log => log.level === filter);
    }, [logs, filter]);

    const FilterButton: React.FC<{ level: typeof filter }> = ({ level }) => (
        <button
            onClick={() => setFilter(level)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${filter === level ? 'bg-primary text-primary-content font-semibold' : 'bg-base-300 hover:bg-base-100'}`}
        >
            {level}
        </button>
    );

    return (
        <div className="flex flex-col h-full">
            <h1 className="text-3xl font-bold text-white mb-4">Консоль Отладки</h1>
            <div className="bg-base-100 p-4 rounded-lg shadow-lg flex-1 flex flex-col">
                <div className="flex flex-wrap items-center gap-4 mb-4 pb-4 border-b border-base-300">
                    <div className="flex gap-2">
                        <FilterButton level="All" />
                        <FilterButton level="INFO" />
                        <FilterButton level="WARN" />
                        <FilterButton level="ERROR" />
                    </div>
                    <div className="flex-grow"></div>
                    <div className="flex gap-2">
                         <button onClick={() => setIsPaused(!isPaused)} className="px-3 py-1 text-sm rounded-md bg-base-300 hover:bg-base-100">
                            {isPaused ? '▶️ Возобновить' : '⏸️ Пауза'}
                        </button>
                        <button onClick={() => setLogs([])} className="px-3 py-1 text-sm rounded-md bg-base-300 hover:bg-base-100">
                            🧹 Очистить
                        </button>
                    </div>
                </div>
                <div ref={logContainerRef} className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {filteredLogs.map((log, index) => (
                        <LogLine key={index} log={log} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DebugPage;