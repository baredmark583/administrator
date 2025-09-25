import React from 'react';

const DisputesPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Центр Разрешения Споров</h1>
            <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4">Раздел в разработке</h2>
                <p className="text-base-content/70">
                    На этой странице администраторы и арбитры смогут просматривать активные и завершенные споры между пользователями,
                    изучать переписку и выносить решения.
                </p>
            </div>
        </div>
    );
};

export default DisputesPage;