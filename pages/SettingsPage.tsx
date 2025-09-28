import React, { useState, useEffect, useCallback } from 'react';
import { backendApiService } from '../services/backendApiService';
import Spinner from '../components/Spinner';

type SettingsTab = 'general' | 'financial' | 'integrations';

const SettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    
    // API Test State
    const [apiTestStatus, setApiTestStatus] = useState<Record<string, { status: 'idle' | 'testing' | 'success' | 'error', message: string }>>({
        gemini: { status: 'idle', message: '' },
        cloudinary: { status: 'idle', message: '' },
    });

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        try {
            const settingsArray = await backendApiService.getSettings();
            const settingsMap = settingsArray.reduce((acc, setting) => {
                acc[setting.key] = setting.value;
                return acc;
            }, {} as Record<string, string>);
            setSettings(settingsMap);
        } catch (error) {
            console.error("Failed to fetch settings:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleInputChange = (key: string, value: string | boolean) => {
        setSettings(prev => ({ ...prev, [key]: String(value) }));
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        setSuccessMessage('');
        try {
            const settingsArray = Object.entries(settings).map(([key, value]) => ({ key, value }));
            await backendApiService.updateSettings(settingsArray);
            setSuccessMessage('Настройки успешно сохранены!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error("Failed to save settings:", error);
            alert("Ошибка сохранения настроек.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleTestApiKey = async (serviceName: 'gemini' | 'cloudinary') => {
        setApiTestStatus(prev => ({ ...prev, [serviceName]: { status: 'testing', message: '' } }));
        try {
            const result = await backendApiService.testApiKey(serviceName);
            setApiTestStatus(prev => ({ ...prev, [serviceName]: { status: 'success', message: result.message } }));
        } catch (error) {
             setApiTestStatus(prev => ({ ...prev, [serviceName]: { status: 'error', message: (error as Error).message } }));
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>;
    }
    
    const TabButton: React.FC<{ tab: SettingsTab; label: string }> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-base-content/70 hover:text-white'}`}
        >
            {label}
        </button>
    );

    const renderContent = () => {
        switch(activeTab) {
            case 'general':
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white">Общие настройки</h3>
                        <div>
                            <label className="flex items-center justify-between cursor-pointer p-4 bg-base-200 rounded-lg">
                                <div>
                                    <span className="font-medium text-white">Режим технического обслуживания</span>
                                    <p className="text-xs text-base-content/70">При включении сайт будет недоступен для пользователей.</p>
                                </div>
                                <div className="relative">
                                    <input type="checkbox" checked={settings['MAINTENANCE_MODE'] === 'true'} onChange={(e) => handleInputChange('MAINTENANCE_MODE', e.target.checked)} className="sr-only" />
                                    <div className="block bg-base-300 w-14 h-8 rounded-full"></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings['MAINTENANCE_MODE'] === 'true' ? 'translate-x-6 bg-green-400' : ''}`}></div>
                                </div>
                            </label>
                        </div>
                    </div>
                );
            case 'financial':
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white">Финансовые настройки</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-base-content/70 mb-1">Базовая комиссия (%)</label>
                                <input type="number" value={settings['COMMISSION_RATE_STANDARD'] || ''} onChange={e => handleInputChange('COMMISSION_RATE_STANDARD', e.target.value)} className="w-full bg-base-200 border border-base-300 rounded-lg p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-base-content/70 mb-1">Комиссия для Pro (%)</label>
                                <input type="number" value={settings['COMMISSION_RATE_PRO'] || ''} onChange={e => handleInputChange('COMMISSION_RATE_PRO', e.target.value)} className="w-full bg-base-200 border border-base-300 rounded-lg p-2" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-base-content/70 mb-1">Мин. комиссия (USDT)</label>
                                <input type="number" value={settings['COMMISSION_MINIMUM_FEE'] || ''} onChange={e => handleInputChange('COMMISSION_MINIMUM_FEE', e.target.value)} className="w-full bg-base-200 border border-base-300 rounded-lg p-2" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-base-content/70 mb-1">Адрес казначейского кошелька TON</label>
                            <input type="text" value={settings['TREASURY_WALLET_ADDRESS'] || ''} onChange={e => handleInputChange('TREASURY_WALLET_ADDRESS', e.target.value)} className="w-full bg-base-200 border border-base-300 rounded-lg p-2 font-mono" />
                            <p className="text-xs text-base-content/60 mt-1">Кошелек для "Безопасных сделок" (Escrow).</p>
                        </div>
                    </div>
                );
            case 'integrations':
                 const ApiKeyInput: React.FC<{ serviceKey: 'gemini' | 'cloudinary', label: string }> = ({ serviceKey, label }) => {
                    const status = apiTestStatus[serviceKey];
                    const [showKey, setShowKey] = useState(false);
                    const dbKey = serviceKey === 'gemini' ? 'GEMINI_API_KEY' : 'CLOUDINARY_URL';

                    const statusIndicator = () => {
                        switch (status.status) {
                            case 'testing': return <div className="flex items-center gap-1 text-xs text-yellow-400"><Spinner size="sm" /> Тестируем...</div>;
                            case 'success': return <div className="text-xs text-green-400">✅ {status.message}</div>;
                            case 'error': return <div className="text-xs text-red-400">❌ {status.message}</div>;
                            default: return null;
                        }
                    };

                    return (
                        <div>
                            <label className="block text-sm font-medium text-base-content/70 mb-1">{label}</label>
                            <div className="flex gap-2">
                                <input
                                    type={showKey ? 'text' : 'password'}
                                    value={settings[dbKey] || ''}
                                    onChange={e => handleInputChange(dbKey, e.target.value)}
                                    className="w-full bg-base-200 border border-base-300 rounded-lg p-2 font-mono"
                                />
                                <button type="button" onClick={() => setShowKey(!showKey)} className="p-2 bg-base-200 rounded-md">
                                    {showKey ? '🙈' : '👁️'}
                                </button>
                                <button type="button" onClick={() => handleTestApiKey(serviceKey)} disabled={status.status === 'testing'} className="px-3 text-sm bg-sky-600 hover:bg-sky-700 text-white rounded-lg disabled:bg-gray-500">
                                    Тест
                                </button>
                            </div>
                            <div className="h-4 mt-1">{statusIndicator()}</div>
                        </div>
                    );
                };
                return (
                     <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white">Интеграции и API</h3>
                        <ApiKeyInput serviceKey="gemini" label="Google Gemini API Key" />
                        <ApiKeyInput serviceKey="cloudinary" label="Cloudinary URL" />
                    </div>
                );
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Настройки Платформы</h1>
                <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-500 flex items-center gap-2"
                >
                    {isSaving && <Spinner size="sm"/>}
                    {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
            </div>
            {successMessage && <div className="bg-green-500/20 text-green-300 p-3 rounded-md mb-6 text-center animate-fade-in-down">{successMessage}</div>}

            <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                <div className="border-b border-base-300 mb-6">
                    <nav className="-mb-px flex space-x-6">
                        <TabButton tab="general" label="Общие" />
                        <TabButton tab="financial" label="Финансы" />
                        <TabButton tab="integrations" label="Интеграции" />
                    </nav>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default SettingsPage;
