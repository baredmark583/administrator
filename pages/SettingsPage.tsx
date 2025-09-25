import React from 'react';

const SettingsPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Настройки Платформы</h1>
            <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4">Раздел в разработке</h2>
                <p className="text-base-content/70">
                    Здесь будут находиться глобальные настройки для всего маркетплейса, такие как:
                </p>
                <ul className="list-disc list-inside mt-4 text-base-content/70 space-y-2">
                    <li>Управление API ключами для внешних сервисов.</li>
                    <li>Настройка комиссий платформы.</li>
                    <li>Динамическая кастомизация внешнего вида пользовательского фронтенда.</li>
                    <li>Управление ролями администраторов и модераторов.</li>
                </ul>
            </div>
        </div>
    );
};

export default SettingsPage;