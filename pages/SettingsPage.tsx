import React, { useState, useEffect } from 'react';
// FIX: Removed unused AdminSetting import as it's not exported from the service.
import { backendApiService } from '../services/backendApiService';

const SettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showGeminiKey, setShowGeminiKey] = useState(false);
    const [showCloudinaryUrl, setShowCloudinaryUrl] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
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
        };
        fetchSettings();
    }, []);

    const handleInputChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        setSuccessMessage('');
        try {
            const settingsArray = Object.entries(settings).map(([key, value]) => ({ key, value }));
            await backendApiService.updateSettings(settingsArray);
            setSuccessMessage('Настройки успешно сохранены!');
            setTimeout(() => setSuccessMessage(''), 3000); // Hide message after 3 seconds
        } catch (error) {
            console.error("Failed to save settings:", error);
            alert("Ошибка сохранения настроек.");
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Настройки Платформы</h1>
                <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-500"
                >
                    {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
            </div>
            {successMessage && <div className="bg-green-500/20 text-green-300 p-3 rounded-md mb-6 text-center">{successMessage}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Financial Settings */}
                <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold text-white mb-4 border-b border-base-300 pb-2">Финансы</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="COMMISSION_RATE" className="block text-sm font-medium text-base-content/70 mb-1">Комиссия платформы (%)</label>
                            <input
                                id="COMMISSION_RATE"
                                type="number"
                                value={settings['COMMISSION_RATE'] || ''}
                                onChange={e => handleInputChange('COMMISSION_RATE', e.target.value)}
                                className="w-full bg-base-300 border border-base-100 rounded-lg p-2"
                                placeholder="Например: 2.5"
                            />
                            <p className="text-xs text-base-content/60 mt-1">Процент, который взимается с каждой успешной продажи.</p>
                        </div>
                    </div>
                </div>

                {/* API Keys */}
                <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold text-white mb-4 border-b border-base-300 pb-2">API Ключи</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="GEMINI_API_KEY" className="block text-sm font-medium text-base-content/70 mb-1">Google Gemini API Key</label>
                            <div className="flex gap-2">
                                <input
                                    id="GEMINI_API_KEY"
                                    type={showGeminiKey ? 'text' : 'password'}
                                    value={settings['GEMINI_API_KEY'] || ''}
                                    onChange={e => handleInputChange('GEMINI_API_KEY', e.target.value)}
                                    className="w-full bg-base-300 border border-base-100 rounded-lg p-2 font-mono"
                                />
                                <button type="button" onClick={() => setShowGeminiKey(!showGeminiKey)} className="p-2 bg-base-300 rounded-md">
                                    {showGeminiKey ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>
                         <div>
                            <label htmlFor="CLOUDINARY_URL" className="block text-sm font-medium text-base-content/70 mb-1">Cloudinary URL</label>
                             <div className="flex gap-2">
                                <input
                                    id="CLOUDINARY_URL"
                                    type={showCloudinaryUrl ? 'text' : 'password'}
                                    value={settings['CLOUDINARY_URL'] || ''}
                                    onChange={e => handleInputChange('CLOUDINARY_URL', e.target.value)}
                                    className="w-full bg-base-300 border border-base-100 rounded-lg p-2 font-mono"
                                />
                                 <button type="button" onClick={() => setShowCloudinaryUrl(!showCloudinaryUrl)} className="p-2 bg-base-300 rounded-md">
                                    {showCloudinaryUrl ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;