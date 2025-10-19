import React from 'react';

interface StatCardProps {
    title: string;
    // FIX: Changed value prop type to React.ReactNode to accept JSX from getFormattedPrice.
    value: React.ReactNode;
    icon: React.ReactElement;
    color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = 'text-white' }) => {
    return (
        <div className="bg-base-100 p-6 rounded-lg shadow-lg flex items-center gap-6 transition-transform hover:-translate-y-1">
            <div className="bg-base-300 p-4 rounded-full">
                {icon}
            </div>
            <div>
                <p className="text-sm text-base-content/70">{title}</p>
                <p className={`text-3xl font-bold ${color}`}>{value}</p>
            </div>
        </div>
    );
};

export default StatCard;