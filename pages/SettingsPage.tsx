import React, { useState, useEffect } from 'react';
import Spinner from '../components/Spinner';
import { backendApiService } from '../services/backendApiService';

interface Setting {
    key: string;
    value: string;
}

const SETTING_DESCRIPTIONS: Record<string, string> = {
    PLATFORM_COMMISSION_PERCENT: 'Комиссия платформы в процентах (например, 2.5 для 2.5%).',
    PRO_VERIFICATION_FEE_USDT: 'Стоимость получения Pro-статуса в основной валюте (USDT).',
    SITE_MAINTENANCE_MODE: 'Включить режим обслуживания (true/false). Сайт будет недоступен для пользователей.',
};

const SettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<Setting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                const fetchedSettings = await backendApiService.getSettings();
                setSettings(fetchedSettings);
            } catch (error) {
                console.error("Failed to fetch settings", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);
    
    const handleSettingChange = (key: string, value: string) => {
        setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await backendApiService.updateSettings(settings);
            alert('Настройки успешно сохранены.');
        } catch (error) {
            alert('Ошибка сохранения настроек.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Глобальные Настройки</h1>

            <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
                 <div className="space-y-6">
                    {settings.map(setting => (
                        <div key={setting.key}>
                            <label htmlFor={setting.key} className="block text-sm font-medium text-white">{setting.key.replace(/_/g, ' ')}</label>
                            <p className="text-xs text-base-content/70 mb-1">{SETTING_DESCRIPTIONS[setting.key] || 'Системный параметр'}</p>
                            <input
                                id={setting.key}
                                type="text"
                                value={setting.value}
                                onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                                className="mt-1 block w-full bg-base-200 border border-base-300 rounded-md p-2"
                            />
                        </div>
                    ))}
                </div>
                
                <div className="mt-8 border-t border-base-300 pt-6">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full flex justify-center py-3 px-4 bg-primary hover:bg-primary-focus text-white font-bold rounded-lg transition-colors disabled:bg-gray-500"
                    >
                        {isSaving ? <Spinner size="sm" /> : 'Сохранить настройки'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;